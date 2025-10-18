import { api } from './api';
import { v4 as uuidv4 } from 'uuid';

// Chave para armazenamento local de notificações
const STORAGE_KEY = 'notifications';

export const notificationService = {
  /**
   * Obtém todas as notificações do servidor
   * @returns {Promise<Array>} Lista de notificações
   */
  async fetchNotifications() {
    try {
      const response = await api.get('/notifications');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      return [];
    }
  },

  /**
   * Obtém notificações do armazenamento local
   * @returns {Array} Lista de notificações
   */
  getNotifications() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  /**
   * Salva notificações no armazenamento local
   * @param {Array} notifications - Lista de notificações
   */
  saveNotifications(notifications) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  },

  /**
   * Adiciona uma nova notificação
   * @param {Object} notification - Dados da notificação
   * @returns {Object} Notificação adicionada
   */
  async addNotification(notification) {
    // Criar notificação com ID único e timestamp
    const newNotification = {
      id: notification.id || uuidv4(),
      title: notification.title,
      message: notification.message,
      type: notification.type || 'info',
      read: false,
      timestamp: notification.timestamp || new Date().toISOString(),
      orderId: notification.orderId
    };

    // Salvar no servidor se estiver conectado
    try {
      const response = await api.post('/notifications', {
        title: newNotification.title,
        message: newNotification.message,
        order_id: newNotification.orderId,
        type: newNotification.type,
        global: notification.global || false
      });
      
      // Usar o ID retornado pelo servidor
      newNotification.id = response.data.id;
    } catch (error) {
      console.error('Erro ao salvar notificação no servidor:', error);
      
      // Salvar localmente se falhar no servidor
      const notifications = this.getNotifications();
      notifications.unshift(newNotification);
      this.saveNotifications(notifications);
    }

    return newNotification;
  },

  /**
   * Adiciona notificação de mudança de status de pedido
   * @param {Object} order - Dados do pedido
   * @param {String} newStatus - Novo status
   * @returns {Object} Notificação adicionada
   */
  async addOrderStatusNotification(order, newStatus) {
    try {
      const response = await api.post('/notifications/order-status', {
        order_id: order.id,
        status: newStatus
      });
      
      return {
        id: response.data.id,
        title: 'Status da Viagem Atualizado',
        message: `A viagem #${order.id} foi atualizada para ${newStatus}`,
        type: 'info',
        read: false,
        timestamp: new Date().toISOString(),
        orderId: order.id
      };
    } catch (error) {
      console.error('Erro ao criar notificação de status:', error);
      
      // Fallback para notificação local
      return this.addNotification({
        title: 'Status da Viagem Atualizado',
        message: `A viagem #${order.id} foi atualizada para ${newStatus}`,
        type: 'info',
        orderId: order.id,
        global: true
      });
    }
  },

  /**
   * Marca uma notificação como lida
   * @param {String} id - ID da notificação
   */
  async markAsRead(id) {
    try {
      await api.patch(`/notifications/${id}/read`);
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      
      // Fallback para atualização local
      const notifications = this.getNotifications();
      const index = notifications.findIndex(n => n.id === id);
      if (index !== -1) {
        notifications[index].read = true;
        this.saveNotifications(notifications);
      }
    }
  },

  /**
   * Marca todas as notificações como lidas
   */
  async markAllAsRead() {
    try {
      await api.patch('/notifications/read-all');
    } catch (error) {
      console.error('Erro ao marcar todas notificações como lidas:', error);
      
      // Fallback para atualização local
      const notifications = this.getNotifications();
      notifications.forEach(n => n.read = true);
      this.saveNotifications(notifications);
    }
  },

  /**
   * Remove uma notificação
   * @param {String} id - ID da notificação
   */
  async removeNotification(id) {
    try {
      await api.delete(`/notifications/${id}`);
    } catch (error) {
      console.error('Erro ao remover notificação:', error);
      
      // Fallback para remoção local
      const notifications = this.getNotifications().filter(n => n.id !== id);
      this.saveNotifications(notifications);
    }
  },

  /**
   * Remove todas as notificações
   */
  async clearAllNotifications() {
    const notifications = this.getNotifications();
    for (const notification of notifications) {
      try {
        await api.delete(`/notifications/${notification.id}`);
      } catch (error) {
        console.error(`Erro ao remover notificação ${notification.id}:`, error);
      }
    }
    
    // Limpar armazenamento local
    localStorage.removeItem(STORAGE_KEY);
  },

  /**
   * Obtém o número de notificações não lidas
   * @returns {Number} Quantidade de notificações não lidas
   */
  getUnreadCount() {
    return this.getNotifications().filter(n => !n.read).length;
  }
};