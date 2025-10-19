<template>
  <div class="order-details">
    <div class="header">
      <h1>Detalhes da Viagem #{{ orderId }}</h1>
      <router-link to="/dashboard" class="btn back-btn">
        <i class="fas fa-arrow-left"></i> Voltar
      </router-link>
    </div>

    <div v-if="loading" class="center">
      <p>Carregando detalhes da viagem...</p>
    </div>

    <div v-else-if="error" class="error-message">
      <p>{{ error }}</p>
      <router-link to="/dashboard" class="btn">Voltar ao Dashboard</router-link>
    </div>

    <div v-else-if="order" class="order-card">
      <div class="order-header">
        <h2>Viagem #{{ order.id }}</h2>
        <div class="status-badge" :class="order.status">{{ translateStatus(order.status) }}</div>
      </div>

      <div class="order-info">
        <div class="info-group">
          <h3><i class="fas fa-plane-departure"></i> Informações da Viagem</h3>
          <div class="info-item">
            <span class="info-label">Nome do solicitante:</span>
            <span class="info-value">{{ order.requester_name }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Destino:</span>
            <span class="info-value">{{ order.destination }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Data de Ida:</span>
            <span class="info-value">{{ formatDate(order.departure_date) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Data de Volta:</span>
            <span class="info-value">{{ formatDate(order.return_date) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Descrição:</span>
            <span class="info-value">{{ order.description || 'Sem descrição' }}</span>
          </div>
        </div>

        <div class="info-group">
          <h3><i class="fas fa-info-circle"></i> Status da Viagem</h3>
          <div class="info-item">
            <span class="info-label">Status Atual:</span>
            <span class="info-value status-text" :class="order.status">{{ translateStatus(order.status) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Criado em:</span>
            <span class="info-value">{{ formatDate(order.created_at) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Atualizado em:</span>
            <span class="info-value">{{ formatDate(order.updated_at) }}</span>
          </div>
        </div>
      </div>

      <div class="actions">
        <select v-if="isAdmin" v-model="newStatus" :disabled="updatingStatus">
          <option value="">Selecione um novo status</option>
          <option v-for="status in availableStatusOptions" :key="status" :value="status">
            {{ translateStatus(status) }}
          </option>
        </select>
        <button v-if="isAdmin" @click="updateStatus" class="btn update-btn" :disabled="!newStatus || updatingStatus">
          <i class="fas fa-save"></i> Atualizar Status
        </button>
        <router-link v-if="order.status === 'pending'" :to="`/orders/${orderId}/edit`" class="btn edit-btn">
          <i class="fas fa-edit"></i> Editar Viagem
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
      statusOptions: ['pending', 'approved', 'cancelled', 'in_progress', ]
    }
  },
  computed: {
    isAdmin() {
      
      const userData = localStorage.getItem('user_data');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          return user.is_admin === true;
        } catch (e) {
          console.error('Erro ao analisar dados do usuário:', e);
          return false;
        }
      }
      return false;
    },
    availableStatusOptions() {
      
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
    translateStatus(status) {
      const translations = {
        'pending': 'Pendente',
        'approved': 'Aprovado',
        'cancelled': 'Cancelado',
        'in_progress': 'Em Andamento',
        'completed': 'Concluído'
      };
      return translations[status] || status;
    },
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
        
        
        this.order.status = this.newStatus
        
        
        eventBus.emit('notification:order-status', this.order, this.newStatus)
        
        this.newStatus = ''
      } catch (err) {
        
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
  transition: all 0.3s ease;
}

.back-btn:hover {
  background-color: #5a6268;
  transform: translateX(-3px);
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
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  padding: 25px;
  transition: all 0.3s ease;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
  margin-bottom: 20px;
}

.order-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

@media (max-width: 768px) {
  .order-info {
    grid-template-columns: 1fr;
  }
}

.info-group {
  margin-bottom: 20px;
}

.info-group h3 {
  color: #64d0ff;
  margin-bottom: 15px;
  font-size: 1.2rem;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 8px;
}

.info-item {
  display: flex;
  margin-bottom: 10px;
  padding: 5px 0;
}

.info-label {
  font-weight: bold;
  min-width: 150px;
  color: #555;
}

.info-value {
  flex: 1;
}

.status-text {
  font-weight: bold;
}

.actions {
  margin-top: 30px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.actions select {
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #ddd;
  flex: 1;
  min-width: 200px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background-color: #64d0ff;
  color: white;
  cursor: pointer;
  font-weight: 500;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  transition: all 0.3s ease;
}

.btn:hover {
  background-color: #50b8e5;
  transform: translateY(-2px);
}

.btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.edit-btn {
  background-color: #64d0ff;
}

.edit-btn:hover {
  background-color: #218838;
}

.update-btn {
  background-color: #64d0ff;
}

.update-btn:hover {
  background-color: #50b8e5;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: bold;
  text-transform: uppercase;
  font-size: 0.8rem;
}

.status-badge.pending {
  background-color: #f0ad4e;
  color: white;
}

.status-badge.approved {
  background-color: #5cb85c;
  color: white;
}

.status-badge.cancelled {
  background-color: #d9534f;
  color: white;
}

.status-badge.in_progress {
  background-color: #64d0ff;
  color: white;
}

.status-badge.completed {
  background-color: #5bc0de;
  color: white;
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
  color: #64d0ff;
}

.actions {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
  display: flex;
  gap: 10px;
}

.btn {
  background: #64d0ff;
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
  background-color: #64d0ff;
}

.edit-btn:hover {
  background-color: #50b8e5;
}

.cancel-btn {
  background-color: #6c757d;
}
</style>