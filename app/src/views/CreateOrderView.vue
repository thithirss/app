<template>
  <div class="create-order">
    <h2>Novo Pedido de Viagem</h2>

    <BaseToast :message="message" :type="messageType" />

    <form @submit.prevent="onSubmit" class="form">
      <label>
        Título
        <input v-model="title" type="text" placeholder="Ex.: Viagem a São Paulo" required />
      </label>
      <label>
        Descrição
        <textarea v-model="description" rows="4" placeholder="Motivo, detalhes, datas..."></textarea>
      </label>
      <button type="submit" :disabled="loading">
        <LoadingSpinner :visible="loading" />
        <span v-if="!loading">Criar Pedido</span>
      </button>
    </form>
  </div>
</template>

<script>
import { api } from '@/services/api'
import BaseToast from '@/components/BaseToast.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

export default {
  name: 'CreateOrderView',
  components: { BaseToast, LoadingSpinner },
  data() {
    return {
      title: '',
      description: '',
      loading: false,
      message: '',
      messageType: 'info',
    }
  },
  methods: {
    async onSubmit() {
      this.loading = true
      this.message = ''
      try {
        const payload = { title: this.title, description: this.description, status: 'pending' }
        await api.createOrder(payload)
        this.message = 'Pedido criado com sucesso.'
        this.messageType = 'success'
        this.$router.push('/dashboard')
      } catch (e) {
        this.message = e.message || 'Erro ao criar pedido.'
        this.messageType = 'error'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.create-order { max-width: 700px; margin: 20px auto; text-align: left; }
.form { display: grid; gap: 12px; }
label { display: grid; gap: 6px; }
input, textarea { padding: 10px; border: 1px solid #ccc; border-radius: 6px; }
button { padding: 10px; border: none; border-radius: 6px; background: #42b983; color: white; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; }
button:disabled { opacity: 0.7; cursor: not-allowed; }
</style>