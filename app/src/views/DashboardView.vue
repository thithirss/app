<template>
  <div class="dashboard">
    <h2>Pedidos de Viagem</h2>

    <div class="top-bar">
      <div class="search-filters">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="ID, solicitante ou destino" 
          @input="handleSearch"
        />
        <select v-model="statusFilter" @change="fetchOrders">
          <option value="">Todos os status</option>
          <option v-for="status in statusOptions" :key="status" :value="status">
            {{ status }}
          </option>
        </select>
      </div>
      <router-link to="/orders/new" class="btn">
        Novo Pedido
      </router-link>
    </div>

    <BaseToast :message="message" :type="messageType" />

    <div v-if="loading" class="center">
      <LoadingSpinner :visible="true" />
    </div>

    <table v-else-if="filteredOrders.length" class="table">
      <thead>
        <tr>
          <th>ID</th>
          <!-- <th>Código</th> -->
          <th>Solicitante</th>
          <th>Destino</th>
          <th>Data Partida</th>
          <th>Data Retorno</th>
          <th>Descrição</th>
          <th>Status</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="order in filteredOrders" :key="order.id">
          <td>
            <router-link :to="`/orders/${order.id}`" class="order-link">
              {{ order.id }}
            </router-link>
          </td>
          <!-- <td>{{ order.order_id || '—' }}</td> -->
          <td>{{ order.requester_name || '—' }}</td>
          <td>{{ order.destination || '—' }}</td>
          <td>{{ formatDate(order.departure_date) }}</td>
          <td>{{ formatDate(order.return_date) }}</td>
          <td>{{ order.description || '—' }}</td>
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
            <router-link :to="`/orders/${order.id}`" class="btn">
              <span class="material-icons">visibility</span>
              Ver
            </router-link>
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
      searchQuery: '',
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
    },
    filteredOrders() {
      if (!this.searchQuery) return this.orders
      
      const query = this.searchQuery.toLowerCase()
      return this.orders.filter(order => {
        return (
          String(order.id).includes(query) ||
          (order.requester_name && order.requester_name.toLowerCase().includes(query)) ||
          (order.destination && order.destination.toLowerCase().includes(query)) ||
          (order.description && order.description.toLowerCase().includes(query))
        )
      })
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
    handleSearch() {
      // Método para lidar com a pesquisa em tempo real
      // Não precisa fazer nada aqui, pois estamos usando computed property
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
    },
    formatDate(dateString) {
      if (!dateString) return '—'
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return dateString
      return new Intl.DateTimeFormat('pt-BR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      }).format(date)
    }
  }
}
</script>

<style scoped>
.dashboard { max-width: 1200px; margin: 20px auto; text-align: left; }
.top-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.search-filters { display: flex; gap: 15px; align-items: center; }
.btn { background: #42b983; color: #fff; padding: 8px 12px; border-radius: 6px; text-decoration: none; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; }
.table { width: 100%; border-collapse: collapse; }
.table th, .table td { border: 1px solid #eee; padding: 8px; text-align: center; }
.table th { background-color: #f5f5f5; }
.table tr:nth-child(even) { background-color: #f9f9f9; }
.table tr:hover { background-color: #f0f0f0; }
.center { display: flex; justify-content: center; padding: 20px; }
.order-link { color: #42b983; text-decoration: none; font-weight: bold; }
.order-link:hover { text-decoration: underline; }
</style>