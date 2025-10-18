// Serviço para gerenciar notificações do sistema
const STORAGE_KEY = 'travel_rep_notifications';

export const notificationService = {
  /**
   * Busca notificações do servidor
   * @returns {Promise<Array>} Lista de notificações
   */
  async fetchNotifications() {
    try {
      // Buscar notificações do servidor
      const response = await fetch('/api/notifications', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar notificações: ${response.statusText}`);
      }
      
      const data = await response.json();
      // Salvar no armazenamento local como backup
      this.saveNotifications(data);
      return data;
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      // Retornar notificações locais em caso de falha
      return this.getNotifications();
    }
  },
  /**
   * Adiciona uma nova notificação
   * @param {Object} notification - Objeto com dados da notificação
   * @param {string} notification.title - Título da notificação
   * @param {string} notification.message - Mensagem da notificação
   * @param {string} notification.type - Tipo da notificação (success, warning, error, info)
   * @param {string} notification.orderId - ID do pedido relacionado (opcional)
   */
  addNotification(notification) {
    const notifications = this.getNotifications();
    const newNotification = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    };
    
    notifications.unshift(newNotification);
    this.saveNotifications(notifications);
    return newNotification;
  },

  /**
   * Adiciona notificação de mudança de status de pedido
   * @param {Object} order - Dados do pedido
   * @param {string} newStatus - Novo status do pedido
   * @returns {Promise} Promise com a notificação criada
   */
  async addOrderStatusNotification(order, newStatus) {
    let title, message, type;
    
    // Tradução dos status
    const statusTraducao = {
      'pending': 'Pendente',
      'approved': 'Aprovado',
      'cancelled': 'Cancelado',
      'in_progress': 'Em Andamento'
    };
    
    const statusTraduzido = statusTraducao[newStatus] || newStatus;
    
    switch (newStatus) {
      case 'approved':
        title = 'Viagem Aprovada';
        message = `Sua viagem para ${order.destination} foi aprovada!`;
        type = 'success';
        break;
      case 'cancelled':
        title = 'Viagem Cancelada';
        message = `Sua viagem para ${order.destination} foi cancelada.`;
        type = 'error';
        break;

      default:
        title = 'Status da Viagem Atualizado';
        message = `O status da sua viagem para ${order.destination} foi atualizado para ${statusTraduzido}.`;
        type = 'info';
    }
    
    try {
      // Enviar para o servidor
      const response = await fetch('/api/notifications/order-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          order_id: order.id,
          status: newStatus
        })
      });
      
      if (!response.ok) {
        throw new Error(`Erro ao criar notificação: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao salvar notificação no servidor:', error);
      // Fallback para armazenamento local
      const notification = this.addNotification({
        title,
        message,
        type,
        orderId: order.id
      });
      return Promise.resolve(notification);
    }
  },

  /**
   * Obtém todas as notificações armazenadas
   * @returns {Array} Lista de notificações
   */
  getNotifications() {
    const storedNotifications = localStorage.getItem(STORAGE_KEY);
    return storedNotifications ? JSON.parse(storedNotifications) : [];
  },

  /**
   * Salva as notificações no localStorage
   * @param {Array} notifications - Lista de notificações
   */
  saveNotifications(notifications) {
    // Limita o número de notificações armazenadas para evitar problemas de espaço
    const limitedNotifications = notifications.slice(0, 50);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedNotifications));
  },

  /**
   * Marca uma notificação como lida
   * @param {string} id - ID da notificação
   */
  markAsRead(id) {
    const notifications = this.getNotifications();
    const updatedNotifications = notifications.map(notification => {
      if (notification.id === id) {
        return { ...notification, read: true };
      }
      return notification;
    });
    
    this.saveNotifications(updatedNotifications);
  },

  /**
   * Marca todas as notificações como lidas
   */
  markAllAsRead() {
    const notifications = this.getNotifications();
    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      read: true
    }));
    
    this.saveNotifications(updatedNotifications);
  },

  /**
   * Remove uma notificação
   * @param {string} id - ID da notificação
   */
  removeNotification(id) {
    const notifications = this.getNotifications();
    const updatedNotifications = notifications.filter(
      notification => notification.id !== id
    );
    
    this.saveNotifications(updatedNotifications);
  },

  /**
   * Limpa todas as notificações
   */
  clearAllNotifications() {
    this.saveNotifications([]);
  },

  /**
   * Obtém o número de notificações não lidas
   * @returns {number} Quantidade de notificações não lidas
   */
  getUnreadCount() {
    const notifications = this.getNotifications();
    return notifications.filter(notification => !notification.read).length;
  }
};