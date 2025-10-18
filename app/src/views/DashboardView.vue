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
.dashboard { 
  max-width: 1200px; 
  margin: 20px auto; 
  text-align: left; 
}

h2 {
  font-size: 1.8rem;
  color: #2d3748;
  margin-bottom: 1.5rem;
  font-weight: 600;
  position: relative;
  padding-bottom: 0.5rem;
}

h2:after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 60px;
  height: 4px;
  background-color: #64d0ff;
  border-radius: 2px;
}

.top-bar { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  margin-bottom: 20px;
  background-color: white;
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.search-filters { 
  display: flex; 
  gap: 15px; 
  align-items: center; 
  width: 70%;
}

.search-filters input,
.search-filters select {
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  padding: 12px 16px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.search-filters input:focus,
.search-filters select:focus {
  border-color: #64d0ff;
  box-shadow: 0 0 0 3px rgba(100, 208, 255, 0.25);
}

.btn { 
  background: #64d0ff; 
  color: #fff; 
  padding: 12px 20px; 
  border-radius: 8px; 
  text-decoration: none; 
  border: none; 
  cursor: pointer; 
  display: inline-flex; 
  align-items: center; 
  gap: 8px; 
  transition: all 0.3s ease;
  font-weight: 600;
  font-size: 0.95rem;
}

.btn:hover { 
  background: #50b8e5; 
  box-shadow: 0 4px 12px rgba(100, 208, 255, 0.3);
  transform: translateY(-2px);
}

.view-btn { 
  background: #64d0ff;
  padding: 8px 16px;
  font-size: 0.85rem;
}

.table { 
  width: 100%; 
  border-collapse: separate; 
  border-spacing: 0;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05); 
  border-radius: 10px; 
  overflow: hidden;
  background-color: white;
}

.table th, .table td { 
  padding: 15px; 
  text-align: left; 
}

.table th { 
  background-color: #64d0ff; 
  color: white; 
  font-weight: 600;
  font-size: 0.95rem;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.table td {
  border-bottom: 1px solid #edf2f7;
  font-size: 0.95rem;
}

.table tr:last-child td {
  border-bottom: none;
}

.table tr:nth-child(even) { 
  background-color: #f8fafc; 
}

.table tr:hover { 
  background-color: #f0f9ff; 
}

.center { 
  display: flex; 
  justify-content: center; 
  padding: 40px; 
}

.order-link { 
  color: #64d0ff; 
  text-decoration: none; 
  font-weight: 600; 
}

.order-link:hover { 
  text-decoration: underline; 
}

.status-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85em;
  font-weight: 600;
  color: white;
  background-color: #cbd5e0;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.status-badge.pending { background-color: #f6ad55; }
.status-badge.approved { background-color: #68d391; }
.status-badge.cancelled { background-color: #fc8181; }
.status-badge.in_progress { background-color: #64d0ff; }
.status-badge.completed { background-color: #4fd1c5; }
</style>