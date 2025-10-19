import { api } from './api';
import { v4 as uuidv4 } from 'uuid';


const STORAGE_KEY = 'notifications';

export const notificationService = {
  /**
   * 
   * @returns {Promise<Array>} 
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
   * 
   * @returns {Array} 
   */
  getNotifications() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  /**
   * 
   * @param {Array} notifications 
   */
  saveNotifications(notifications) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  },

  /**
   * 
   * @param {Object} notification 
   * @returns {Object} 
   */
  async addNotification(notification) {
    
    const newNotification = {
      id: notification.id || uuidv4(),
      title: notification.title,
      message: notification.message,
      type: notification.type || 'info',
      read: false,
      timestamp: notification.timestamp || new Date().toISOString(),
      orderId: notification.orderId
    };

    
    try {
      const response = await api.post('/notifications', {
        title: newNotification.title,
        message: newNotification.message,
        order_id: newNotification.orderId,
        type: newNotification.type,
        global: notification.global || false
      });
      
      
      newNotification.id = response.data.id;
    } catch (error) {
      console.error('Erro ao salvar notificação no servidor:', error);
      
      
      const notifications = this.getNotifications();
      notifications.unshift(newNotification);
      this.saveNotifications(notifications);
    }

    return newNotification;
  },

  /**
   * 
   * @param {Object} order - 
   * @param {String} newStatus - 
   * @returns {Object} 
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
   * 
   * @param {String} id 
   */
  async markAsRead(id) {
    try {
      await api.patch(`/notifications/${id}/read`);
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      
      
      const notifications = this.getNotifications();
      const index = notifications.findIndex(n => n.id === id);
      if (index !== -1) {
        notifications[index].read = true;
        this.saveNotifications(notifications);
      }
    }
  },

  /**
   * 
   */
  async markAllAsRead() {
    try {
      await api.patch('/notifications/read-all');
    } catch (error) {
      console.error('Erro ao marcar todas notificações como lidas:', error);
      
      
      const notifications = this.getNotifications();
      notifications.forEach(n => n.read = true);
      this.saveNotifications(notifications);
    }
  },

  /**
   * 
   * @param {String} id 
   */
  async removeNotification(id) {
    try {
      await api.delete(`/notifications/${id}`);
    } catch (error) {
      console.error('Erro ao remover notificação:', error);
      
      
      const notifications = this.getNotifications().filter(n => n.id !== id);
      this.saveNotifications(notifications);
    }
  },

  /**
   * 
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
    
    
    localStorage.removeItem(STORAGE_KEY);
  },

  /**
   * 
   * @returns {Number} 
   */
  getUnreadCount() {
    return this.getNotifications().filter(n => !n.read).length;
  }
};