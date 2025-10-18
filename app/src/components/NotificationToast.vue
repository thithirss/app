<template>
  <div 
    v-if="show" 
    class="notification-toast" 
    :class="notificationType"
  >
    <div class="notification-content">
      <div class="notification-header">
        <strong>{{ notification.title }}</strong>
        <button @click="close" class="close-btn">&times;</button>
      </div>
      <div class="notification-body">
        {{ notification.message }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotificationToast',
  props: {
    notification: {
      type: Object,
      required: true
    },
    duration: {
      type: Number,
      default: 5000
    }
  },
  data() {
    return {
      show: false,
      timer: null
    };
  },
  computed: {
    notificationType() {
      return `notification-${this.notification.type || 'info'}`;
    }
  },
  mounted() {
    this.show = true;
    this.startTimer();
  },
  beforeUnmount() {
    this.clearTimer();
  },
  methods: {
    startTimer() {
      if (this.duration > 0) {
        this.timer = setTimeout(() => {
          this.close();
        }, this.duration);
      }
    },
    clearTimer() {
      if (this.timer) {
        clearTimeout(this.timer);
      }
    },
    close() {
      this.show = false;
      this.clearTimer();
      this.$emit('close');
    }
  }
};
</script>

<style scoped>
.notification-toast {
  position: fixed;
  top: 20px;
  right: 20px;
  min-width: 300px;
  max-width: 400px;
  padding: 15px;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  animation: slide-in 0.3s ease-out;
  transition: all 0.3s ease;
}

.notification-content {
  display: flex;
  flex-direction: column;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.notification-body {
  font-size: 14px;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  margin-left: 10px;
  opacity: 0.7;
}

.close-btn:hover {
  opacity: 1;
}

.notification-success {
  background-color: #d4edda;
  color: #155724;
  border-left: 4px solid #28a745;
}

.notification-error {
  background-color: #f8d7da;
  color: #721c24;
  border-left: 4px solid #dc3545;
}

.notification-warning {
  background-color: #fff3cd;
  color: #856404;
  border-left: 4px solid #ffc107;
}

.notification-info {
  background-color: #d1ecf1;
  color: #0c5460;
  border-left: 4px solid #17a2b8;
}

@keyframes slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>