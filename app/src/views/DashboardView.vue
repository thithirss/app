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
            {{ translateStatus(status) }}
          </option>
        </select>
      </div>
      <router-link to="/orders/new" class="btn">
        Cadastrar solicitação de viagem
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
            <span class="status-badge" :class="order.status">{{ translateStatus(order.status) }}</span>
          </td>
          <td>
            <router-link :to="`/orders/${order.id}`" class="btn view-btn">
              <i class="fas fa-eye"></i> Ver
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
      defaultStatuses: ['pending','approved','cancelled','in_progress','completed']
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
    translateStatus(status) {
      const translations = {
        'pending': 'Pendente',
        'approved': 'Aprovado',
        'cancelled': 'Cancelado',
        'in_progress': 'Em Andamento',
        'completed': 'Concluído'
      }
      
      return translations[status] || status
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
.btn { background: #64d0ff; color: #fff; padding: 8px 12px; border-radius: 6px; text-decoration: none; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: all 0.3s ease; }
.btn:hover { background: #4db8e5; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
.view-btn { background: #64d0ff; }
.table { width: 100%; border-collapse: collapse; box-shadow: 0 2px 8px rgba(0,0,0,0.05); border-radius: 8px; overflow: hidden; }
.table th, .table td { border: 1px solid #eee; padding: 10px; text-align: center; }
.table th { background-color: #64d0ff; color: white; font-weight: 500; }
.table tr:nth-child(even) { background-color: #f9f9f9; }
.table tr:hover { background-color: #f0f8ff; }
.center { display: flex; justify-content: center; padding: 20px; }
.order-link { color: #64d0ff; text-decoration: none; font-weight: bold; }
.order-link:hover { text-decoration: underline; }
.status-badge {
  display: inline-block;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.85em;
  font-weight: 500;
  color: white;
  background-color: #ccc;
}
.status-badge.pending { background-color: #f0ad4e; }
.status-badge.approved { background-color: #5cb85c; }
.status-badge.cancelled { background-color: #d9534f; }
.status-badge.in_progress { background-color: #64d0ff; }
.status-badge.completed { background-color: #5bc0de; }
</style>