<template>
  <transition name="fade">
    <div v-if="message" class="toast" :class="typeClass" role="alert">
      {{ message }}
    </div>
  </transition>
</template>

<script>
export default {
  name: 'BaseToast',
  props: {
    message: { type: String, default: '' },
    type: { type: String, default: 'info' } 
  },
  computed: {
    typeClass() {
      return `toast--${this.type}`
    }
  }
}
</script>

<style scoped>
.toast {
  padding: 10px 14px;
  border-radius: 6px;
  margin: 10px auto;
  max-width: 600px;
  text-align: left;
}
.toast--success { background: #e6ffed; color: #03543f; border: 1px solid #a7f3d0; }
.toast--error { background: #ffe6e6; color: #7a0b0b; border: 1px solid #feb2b2; }
.toast--info { background: #eef2ff; color: #3730a3; border: 1px solid #c7d2fe; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>