
const STORAGE_KEY = 'travel_rep_notifications';

export const notificationService = {
  /**
   * 
   * @returns {Promise<Array>} 
   */
  async fetchNotifications() {
    try {
      
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
      
      this.saveNotifications(data);
      return data;
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      
      return this.getNotifications();
    }
  },
  /**
   * 
   * @param {Object} notification - 
   * @param {string} notification.title 
   * @param {string} notification.message 
   * @param {string} notification.type 
   * @param {string} notification.orderId 
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
   * 
   * @param {Object} order 
   * @param {string} newStatus 
   * @returns {Promise} 
   */
  async addOrderStatusNotification(order, newStatus) {
    let title, message, type;
    
    
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
   * 
   * @returns {Array} 
   */
  getNotifications() {
    const storedNotifications = localStorage.getItem(STORAGE_KEY);
    return storedNotifications ? JSON.parse(storedNotifications) : [];
  },

  /**
   * 
   * @param {Array} notifications - 
   */
  saveNotifications(notifications) {
    
    const limitedNotifications = notifications.slice(0, 50);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedNotifications));
  },

  /**
   * 
   * @param {string} id 
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
   * 
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
   * 
   * @param {string} id - 
   */
  removeNotification(id) {
    const notifications = this.getNotifications();
    const updatedNotifications = notifications.filter(
      notification => notification.id !== id
    );
    
    this.saveNotifications(updatedNotifications);
  },

  /**
   * 
   */
  clearAllNotifications() {
    this.saveNotifications([]);
  },

  /**
   * 
   * @returns {number} 
   */
  getUnreadCount() {
    const notifications = this.getNotifications();
    return notifications.filter(notification => !notification.read).length;
  }
};