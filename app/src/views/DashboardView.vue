<template>
  <div class="dashboard">
    <h2>Pedidos de Viagem</h2>

    <div class="top-bar">
      <label>
        Filtrar por status:
        <select v-model="statusFilter" @change="fetchOrders">
          <option value="">Todos</option>
          <option v-for="s in statusOptions" :key="s" :value="s">{{ s }}</option>
        </select>
      </label>
      <router-link class="btn" to="/orders/new">Novo Pedido</router-link>
    </div>

    <BaseToast :message="message" :type="messageType" />

    <div v-if="loading" class="center">
      <LoadingSpinner :visible="true" />
    </div>

    <table v-else class="table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Título/Destino</th>
          <th>Status</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="order in orders" :key="order.id">
          <td>{{ order.id }}</td>
          <td>{{ order.destination || order.title || '—' }}</td>
          <td>
            <select v-model="order.status" @change="onStatusChange(order)" :disabled="updatingId === order.id">
              <option v-for="s in statusOptions" :key="s" :value="s">{{ s }}</option>
            </select>
          </td>
          <td>
            <button class="btn" @click="onStatusChange(order)" :disabled="updatingId === order.id">
              <LoadingSpinner :visible="updatingId === order.id" />
              <span v-if="updatingId !== order.id">Salvar</span>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { api } from '@/services/api'
import BaseToast from '@/components/BaseToast.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

export default {
  name: 'DashboardView',
  components: { BaseToast, LoadingSpinner },
  data() {
    return {
      orders: [],
      loading: false,
      updatingId: null,
      statusFilter: '',
      message: '',
      messageType: 'info',
      defaultStatuses: ['pending','approved','cancelled','in_progress']
    }
  },
  computed: {
    statusOptions() {
      const fromData = Array.from(new Set(this.orders.map(o => String(o.status || '').toLowerCase()).filter(Boolean)))
      const all = Array.from(new Set([...fromData, ...this.defaultStatuses]))
      return all
    }
  },
  created() {
    this.fetchOrders()
  },
  methods: {
    async fetchOrders() {
      this.loading = true
      this.message = ''
      try {
        const res = await api.getOrders(this.statusFilter || undefined)
        this.orders = Array.isArray(res) ? res : (res?.data || [])
      } catch (e) {
        this.message = e.message || 'Erro ao carregar pedidos.'
        this.messageType = 'error'
      } finally {
        this.loading = false
      }
    },
    async onStatusChange(order) {
      if (!order?.id || !order?.status) return
      this.updatingId = order.id
      this.message = ''
      try {
        await api.updateOrderStatus(order.id, order.status)
        this.message = 'Status atualizado com sucesso.'
        this.messageType = 'success'
      } catch (e) {
        this.message = e.message || 'Erro ao atualizar status.'
        this.messageType = 'error'
      } finally {
        this.updatingId = null
      }
    }
  }
}
</script>

<style scoped>
.dashboard { max-width: 900px; margin: 20px auto; text-align: left; }
.top-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.btn { background: #42b983; color: #fff; padding: 8px 12px; border-radius: 6px; text-decoration: none; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; }
.table { width: 100%; border-collapse: collapse; }
.table th, .table td { border: 1px solid #eee; padding: 8px; }
.center { display: flex; justify-content: center; padding: 20px; }
</style>