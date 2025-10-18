<template>
  <div class="order-details">
    <div class="header">
      <h1>Detalhes do Pedido #{{ orderId }}</h1>
      <router-link to="/dashboard" class="btn back-btn">
        Voltar
      </router-link>
    </div>

    <div v-if="loading" class="center">
      <p>Carregando detalhes do pedido...</p>
    </div>

    <div v-else-if="error" class="error-message">
      <p>{{ error }}</p>
      <router-link to="/dashboard" class="btn">Voltar ao Dashboard</router-link>
    </div>

    <div v-else-if="order" class="order-card">
      <div class="order-header">
        <h2>Pedido #{{ order.id }}</h2>
        <div class="status-badge" :class="order.status">{{ order.status }}</div>
      </div>

      <div class="order-info">


        <div class="info-group">
          <h3>Informações da Viagem</h3>
          <p><strong>Nome do solicitante:</strong> {{ order.requester_name }}</p>
          <p><strong>Destino:</strong> {{ order.destination }}</p>
          <p><strong>Data de Ida:</strong> {{ formatDate(order.departure_date) }}</p>
          <p><strong>Data de Volta:</strong> {{ formatDate(order.return_date) }}</p>
          <p><strong>Descrição:</strong> {{ order.description || 'Sem descrição' }}</p>
        </div>

        <div class="info-group">
          <h3>Status do Pedido</h3>
          <p><strong>Status Atual:</strong> {{ order.status }}</p>
          <p><strong>Criado em:</strong> {{ formatDate(order.created_at) }}</p>
          <p><strong>Atualizado em:</strong> {{ formatDate(order.updated_at) }}</p>
        </div>
      </div>

      <div class="actions">
        <select v-model="newStatus" :disabled="updatingStatus">
          <option value="">Selecione um novo status</option>
          <option v-for="status in availableStatusOptions" :key="status" :value="status">
            {{ status }}
          </option>
        </select>
        <button @click="updateStatus" class="btn" :disabled="!newStatus || updatingStatus">
          Atualizar Status
        </button>
        <router-link v-if="order.status === 'pending'" :to="`/orders/${orderId}/edit`" class="btn edit-btn">
          Editar Pedido
        </router-link>
      </div>
    </div>

  </div>
  
</template>

<script>
import * as api from '@/services/api'
import { eventBus } from '@/services/eventBus'

export default {
  name: 'OrderDetailsView',
  data() {
    return {
      orderId: this.$route.params.id,
      order: null,
      loading: true,
      error: null,
      newStatus: '',
      updatingStatus: false,
      statusOptions: ['pending', 'approved', 'cancelled', 'in_progress', 'completed']
    }
  },
  computed: {
    availableStatusOptions() {
      // Remover a opção 'cancelled' se o pedido já estiver aprovado
      if (this.order && this.order.status === 'approved') {
        return this.statusOptions.filter(status => status !== 'cancelled');
      }
      return this.statusOptions;
    }
  },
  created() {
    this.fetchOrderDetails()
  },
  methods: {
    async fetchOrderDetails() {
      this.loading = true
      this.error = null
      
      try {
        const response = await api.api.getOrderById(this.orderId)
        this.order = response.data || response
        
        if (!this.order) {
          this.error = 'Pedido não encontrado'
        }
      } catch (err) {
        this.error = err.message || 'Erro ao carregar detalhes do pedido'
      } finally {
        this.loading = false
      }
    },
    async updateStatus() {
      if (!this.newStatus || this.updatingStatus) return
      
      this.updatingStatus = true
      this.error = null
      
      try {
        await api.api.updateOrderStatus(this.orderId, this.newStatus)
        
        // Atualizar o status do pedido
        this.order.status = this.newStatus
        
        // Criar notificação para o usuário sobre a mudança de status
        eventBus.emit('notification:order-status', this.order, this.newStatus)
        
        this.newStatus = ''
      } catch (err) {
        // Exibir mensagem de erro específica se for tentativa de cancelar pedido aprovado
        if (err.response && err.response.status === 422) {
          this.error = 'Não é possível cancelar um pedido que já foi aprovado';
        } else {
          this.error = err.message || 'Erro ao atualizar status do pedido';
        }
      } finally {
        this.updatingStatus = false
      }
    },
    formatDate(dateString) {
      if (!dateString) return 'Não informado'
      
      const date = new Date(dateString)
      return date.toLocaleDateString('pt-BR')
    }
  }
}
</script>

<style scoped>
.order-details {
  max-width: 1000px;
  margin: 20px auto;
  padding: 0 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.back-btn {
  background-color: #6c757d;
}

.center {
  display: flex;
  justify-content: center;
  padding: 40px;
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  margin: 20px 0;
}

.order-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
  margin-bottom: 20px;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: bold;
  text-transform: uppercase;
  font-size: 0.8rem;
}

.status-badge.pending {
  background-color: #ffeeba;
  color: #856404;
}

.status-badge.approved {
  background-color: #d4edda;
  color: #155724;
}

.status-badge.cancelled {
  background-color: #f8d7da;
  color: #721c24;
}

.status-badge.in_progress {
  background-color: #cce5ff;
  color: #004085;
}

.status-badge.completed {
  background-color: #d1ecf1;
  color: #0c5460;
}

.order-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.info-group {
  margin-bottom: 20px;
}

.info-group h3 {
  margin-bottom: 10px;
  font-size: 1.2rem;
  color: #42b983;
}

.actions {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
  display: flex;
  gap: 10px;
}

.btn {
  background: #42b983;
  color: #fff;
  padding: 8px 12px;
  border-radius: 6px;
  text-decoration: none;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn:disabled {
  background: #cccccc;
  cursor: not-allowed;
}

select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.edit-btn {
  background-color: #4CAF50;
}

.edit-btn:hover {
  background-color: #45a049;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-group textarea {
  height: 100px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.edit-btn {
  background-color: #007bff;
}

.cancel-btn {
  background-color: #6c757d;
}
</style>