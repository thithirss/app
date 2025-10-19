<template>
  <div class="edit-order-container">
    <div class="edit-order-card">
      <h1>Editar Viagem</h1>
      
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      
      <form @submit.prevent="saveChanges" class="edit-form">
        <div class="form-group">
          <label for="requesterName">Nome do Solicitante:</label>
          <input 
            type="text" 
            id="requesterName" 
            v-model="editForm.requester_name" 
            required
          />
        </div>
        
        <div class="form-group">
          <label for="destination">Destino:</label>
          <multiselect
            v-model="selectedLocalidade"
            :options="localidades"
            :searchable="true"
            :loading="loadingLocalidades"
            :preserve-search="true"
            placeholder="Digite para buscar cidades"
            label="nome"
            track-by="id"
            @search-change="searchLocalidades"
            @select="onSelectLocalidade"
          >
            <template v-slot:noResult>
              Nenhuma cidade encontrada. Continue digitando...
            </template>
            <template v-slot:noOptions>
              Digite para buscar cidades...
            </template>
          </multiselect>
        </div>
        
        <div class="form-group">
          <label for="departureDate">Data de Partida:</label>
          <input 
            type="date" 
            id="departureDate" 
            v-model="editForm.departure_date" 
            required
          />
        </div>
        
        <div class="form-group">
          <label for="returnDate">Data de Retorno:</label>
          <input 
            type="date" 
            id="returnDate" 
            v-model="editForm.return_date" 
            required
          />
        </div>
        
        <div class="form-group">
          <label for="description">Descrição:</label>
          <textarea 
            id="description" 
            v-model="editForm.description" 
            rows="4"
          ></textarea>
        </div>
        
        <div class="form-actions">
          <button 
            type="button" 
            class="btn btn-secondary" 
            @click="cancelEdit"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            class="btn btn-primary" 
            :disabled="updating"
          >
            {{ updating ? 'Salvando...' : 'Salvar Alterações' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import * as api from '@/services/api';
import { locationService } from '@/services/locationService';
import Multiselect from 'vue-multiselect';

export default {
  name: 'EditOrderView',
  components: { Multiselect },
  data() {
    return {
      orderId: null,
      editForm: {
        requester_name: '',
        destination: '',
        departure_date: '',
        return_date: '',
        description: ''
      },
      updating: false,
      error: null,
      
      localidades: [],
      selectedLocalidade: null,
      loadingLocalidades: false,
      originalDestination: ''
    };
  },
  created() {
    this.orderId = this.$route.params.id;
    this.fetchOrderDetails();
    
    this.searchLocalidades('');
  },
  methods: {
    async fetchOrderDetails() {
      try {
        const response = await api.api.getOrderById(this.orderId);
        if (response.data) {
          const order = response.data;
          this.originalDestination = order.destination;
          
          this.editForm = {
            requester_name: order.requester_name,
            destination: order.destination,
            departure_date: this.formatDateForInput(order.departure_date),
            return_date: this.formatDateForInput(order.return_date),
            description: order.description || ''
          };
          
          
          if (order.destination) {
            this.searchLocalidades(order.destination);
          }
          
          
          if (order.status !== 'pending') {
            this.error = 'Apenas viagens com status pendente podem ser editadas';
            setTimeout(() => {
              this.$router.push(`/orders/${this.orderId}`);
            }, 2000);
          }
        }
      } catch (error) {
        this.error = 'Erro ao carregar os detalhes do pedido';
        console.error('Erro ao buscar detalhes do pedido:', error);
      }
    },
    async searchLocalidades(query) {
      this.loadingLocalidades = true;
      try {
        this.localidades = await locationService.getLocalidades(query);
        
        
        if (this.originalDestination && query === this.originalDestination) {
          const localidadeEncontrada = this.localidades.find(
            loc => loc.nome === this.originalDestination
          );
          
          if (localidadeEncontrada) {
            this.selectedLocalidade = localidadeEncontrada;
          }
        }
      } catch (error) {
        console.error('Erro ao buscar localidades:', error);
      } finally {
        this.loadingLocalidades = false;
      }
    },
    onSelectLocalidade(localidade) {
      if (localidade) {
        this.editForm.destination = localidade.nome;
      }
    },
    formatDateForInput(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    },
    async saveChanges() {
      this.updating = true;
      this.error = null;
      
      try {
        await api.api.updateOrder(this.orderId, this.editForm);
        this.$router.push(`/orders/${this.orderId}`);
      } catch (error) {
        this.error = 'Erro ao atualizar a viagem';
        console.error('Erro ao atualizar a viagem:', error);
      } finally {
        this.updating = false;
      }
    },
    cancelEdit() {
      this.$router.push(`/orders/${this.orderId}`);
    }
  }
};
</script>

<style scoped>
.edit-order-container {
  display: flex;
  justify-content: center;
  padding: 20px;
}

.edit-order-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  width: 100%;
  max-width: 600px;
}

h1 {
  color: #333;
  font-size: 24px;
  margin-bottom: 20px;
  text-align: center;
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 15px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

/* Estilos para o Multiselect */
.multiselect {
  min-height: 40px;
}

.multiselect__tags {
  min-height: 40px;
  padding: 8px 40px 0 8px;
  border-radius: 4px;
  border: 1px solid #ced4da;
}

.multiselect__placeholder {
  padding-top: 0;
  margin-bottom: 0;
  color: #6c757d;
}

.multiselect__input {
  background: transparent;
  margin-bottom: 0;
}

.multiselect__spinner {
  height: 38px;
}

.multiselect__content-wrapper {
  border: 1px solid #ced4da;
  border-top: none;
}

input, textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

textarea {
  resize: vertical;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.btn-primary {
  background-color: #64d0ff;
  color: white;
}

.btn-primary:hover {
  background-color: #50b8e5;
}

.btn-primary:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #f1f1f1;
  color: #333;
}

.btn-secondary:hover {
  background-color: #e0e0e0;
}
</style>