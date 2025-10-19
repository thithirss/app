<template>
  <div class="notification-center">

    <div class="notification-icon" @click="toggleNotificationPanel">
      <i class="fas fa-bell"></i>
      <span v-if="unreadCount > 0" class="notification-badge pulse">{{ unreadCount }}</span>
    </div>
    

    <div v-if="showPanel" class="notification-panel">
      <div class="notification-panel-header">
        <h3>Notificações</h3>
      </div>
      
      <div class="notification-list">
        <div v-if="notifications.length === 0" class="no-notifications">
          Nenhuma notificação
        </div>
        <div 
          v-for="notification in notifications" 
          :key="notification.id" 
          class="notification-item"
          :class="{ 'unread': !notification.read }"
          @click="openNotification(notification)"
        >
          <div class="notification-item-content">
            <div class="notification-item-title">{{ notification.title }}</div>
            <div class="notification-item-message">{{ notification.message }}</div>
          </div>
        </div>
      </div>
    </div>
    

    <div class="toast-container">
      <notification-toast
        v-for="toast in toasts"
        :key="toast.id"
        :notification="toast"
        @close="removeToast(toast.id)"
      />
    </div>
  </div>
</template>

<script>
import { notificationService } from '../services/notificationService';
import NotificationToast from '@/components/NotificationToast.vue';
import { eventBus } from '@/services/eventBus';

export default {
  name: 'NotificationCenter',
  components: {
    NotificationToast
  },
  data() {
    return {
      notifications: [],
      showPanel: false,
      toasts: [],
      unreadCount: 0
    };
  },
  created() {
    this.fetchNotificationsFromServer();
    
    
    eventBus.on('notification:new', this.handleNewNotification);
    eventBus.on('notification:order-status', this.handleOrderStatusChange);
    
    
    this.startPolling();
  },
  beforeUnmount() {
    
    eventBus.off('notification:new', this.handleNewNotification);
    eventBus.off('notification:order-status', this.handleOrderStatusChange);
    
    
    this.stopPolling();
  },
  methods: {
    async fetchNotificationsFromServer() {
      try {
        const notifications = await notificationService.fetchNotifications();
        this.notifications = notifications;
        this.updateUnreadCount();
      } catch (error) {
        console.error('Erro ao buscar notificações:', error);
        
        this.notifications = notificationService.getNotifications();
        this.updateUnreadCount();
      }
    },
    
    startPolling() {
      
      this.pollingInterval = setInterval(() => {
        this.fetchNotificationsFromServer();
      }, 30000);
    },
    
    stopPolling() {
      if (this.pollingInterval) {
        clearInterval(this.pollingInterval);
      }
    },
    
    loadNotifications() {
      this.notifications = notificationService.getNotifications();
      this.updateUnreadCount();
    },
    toggleNotificationPanel() {
      this.showPanel = !this.showPanel;
      
      
      if (this.showPanel) {
        this.fetchNotificationsFromServer();
      }
    },
    updateUnreadCount() {
      this.unreadCount = notificationService.getUnreadCount();
    },
    markAllAsRead() {
      notificationService.markAllAsRead();
      this.fetchNotificationsFromServer();
    },
    clearAll() {
      notificationService.clearAllNotifications();
      this.fetchNotificationsFromServer();
    },
    openNotification(notification) {
      if (!notification.read) {
        notificationService.markAsRead(notification.id);
        this.fetchNotificationsFromServer();
      }
      
      
      if (notification.order_id) {
        this.$router.push({ name: 'OrderDetails', params: { id: notification.order_id } });
        this.showPanel = false;
      }
    },
    removeNotification(id) {
      notificationService.removeNotification(id);
      this.fetchNotificationsFromServer();
    },
    handleNewNotification(notification) {
      
      notificationService.addNotification(notification)
        .then(newNotification => {
          
          this.showToast(newNotification);
          
          
          this.fetchNotificationsFromServer();
        });
    },
    handleOrderStatusChange(order, newStatus) {
      
      notificationService.addOrderStatusNotification(order, newStatus)
        .then(notification => {
          
          this.showToast(notification);
          
          
          this.fetchNotificationsFromServer();
        });
    },
    showToast(notification) {
      const toast = { ...notification };
      this.toasts.push(toast);
      
      
      setTimeout(() => {
        this.removeToast(toast.id);
      }, 5000);
    },
    removeToast(id) {
      const index = this.toasts.findIndex(toast => toast.id === id);
      if (index !== -1) {
        this.toasts.splice(index, 1);
      }
    },
    formatTime(timestamp) {
      
      if (!timestamp || isNaN(new Date(timestamp).getTime())) {
        return 'Agora';
      }
      
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);
      
      if (diffMins < 1) {
        return 'Agora';
      } else if (diffMins < 60) {
        return `${diffMins} min atrás`;
      } else if (diffHours < 24) {
        return `${diffHours} h atrás`;
      } else if (diffDays < 7) {
        return `${diffDays} dias atrás`;
      } else {
        return date.toLocaleDateString('pt-BR');
      }
    }
  }
};
</script>

<style scoped>
.notification-center {
  position: relative;
}

.notification-icon {
  position: relative;
  cursor: pointer;
  padding: 8px;
}

.notification-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: var(--error-color);
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(229, 57, 53, 0.7);
  }
  70% {
    transform: scale(1.1);
    box-shadow: 0 0 0 5px rgba(229, 57, 53, 0);
  }
  100% {
    transform: scale(1);
  }
}

.notification-panel {
  position: absolute;
  top: 100%;
  right: 0;
  width: 350px;
  max-height: 400px;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.notification-panel-header {
  padding: 12px 15px;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notification-panel-header h3 {
  margin: 0;
  font-size: 16px;
}

.notification-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  background: transparent;
  border: none;
  color: #007bff;
  font-size: 12px;
  cursor: pointer;
  padding: 0;
}

.action-btn:hover {
  text-decoration: underline;
}

.notification-list {
  overflow-y: auto;
  max-height: 350px;
}

.notification-item {
  padding: 12px 15px;
  border-bottom: 1px solid #e9ecef;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  transition: background-color 0.2s;
}

.notification-item:hover {
  background-color: #f8f9fa;
}

.notification-item.unread {
  background-color: #f0f7ff;
}

.notification-item-content {
  flex: 1;
}

.notification-item-title {
  font-weight: bold;
  margin-bottom: 4px;
}

.notification-item-message {
  font-size: 14px;
  color: #6c757d;
  margin-bottom: 4px;
}

.notification-item-time {
  font-size: 12px;
  color: #adb5bd;
}

.delete-btn {
  background: transparent;
  border: none;
  color: #6c757d;
  font-size: 16px;
  cursor: pointer;
  padding: 0;
  margin-left: 8px;
}

.delete-btn:hover {
  color: #dc3545;
}

.no-notifications {
  padding: 20px;
  text-align: center;
  color: #6c757d;
}

.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>