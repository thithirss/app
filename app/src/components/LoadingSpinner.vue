<template>
  <div v-if="visible" class="spinner" aria-label="Carregando"></div>
  <span v-else style="display:none"></span>
</template>

<script>
export default {
  name: 'LoadingSpinner',
  props: {
    visible: { type: Boolean, default: false }
  }
}
</script>

<style scoped>
.spinner {
  width: 20px;
  height: 20px;
  border: 3px solid #ddd;
  border-top-color: #42b983;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  display: inline-block;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>