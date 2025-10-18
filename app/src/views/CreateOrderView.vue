<template>
  <div class="create-order">
    <h2>Novo Pedido de Viagem</h2>

    <BaseToast :message="message" :type="messageType" />

    <form @submit.prevent="onSubmit" class="form">
      <label>
        ID do Pedido
        <input v-model="orderId" type="text" readonly class="readonly-field" :placeholder="orderIdPlaceholder" />
      </label>
      <label>
        Nome do Solicitante
        <input v-model="requesterName" type="text" placeholder="Seu nome completo" required />
      </label>
      <label>
        Destino
        <Multiselect
          v-model="selectedLocalidade"
          :options="localidades"
          :searchable="true"
          placeholder="Digite para buscar cidade e estado"
          label="nome"
          track-by="id"
          @search-change="searchLocalidades"
          :loading="loadingLocalidades"
          required
        />
      </label>
      <div class="form-row">
        <label class="half-width ">
          Data de Ida
          <input v-model="departureDate" type="date" required />
        </label>
        <label class="half-width">
          Data de Volta
          <input v-model="returnDate" type="date" required />
        </label>
      </div>
      <label>
        Descrição
        <textarea v-model="description" rows="4" placeholder="Motivo da viagem, detalhes adicionais..."></textarea>
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
import { locationService } from '@/services/locationService'
import BaseToast from '@/components/BaseToast.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import Multiselect from 'vue-multiselect'

export default {
  name: 'CreateOrderView',
  components: { BaseToast, LoadingSpinner, Multiselect },
  data() {
    return {
      orderId: '',
      orderIdPlaceholder: 'Será gerado automaticamente',
      requesterName: '',
      destination: '',
      departureDate: '',
      returnDate: '',
      description: '',
      loading: false,
      message: '',
      messageType: 'info',
      // Campo para autocompletar localidade (cidade e estado juntos)
      localidades: [],
      selectedLocalidade: null,
      loadingLocalidades: false
    }
  },
  created() {
    this.searchLocalidades('')
  },
  methods: {
    async searchLocalidades(query) {
      this.loadingLocalidades = true
      try {
        this.localidades = await locationService.getLocalidades(query)
      } catch (error) {
        console.error('Erro ao buscar localidades:', error)
      } finally {
        this.loadingLocalidades = false
      }
    },
    async onSubmit() {
      this.loading = true
      this.message = ''
      try {
        // Usa a localidade selecionada para o destino
        if (this.selectedLocalidade) {
          this.destination = this.selectedLocalidade.nome
        }
        
        const payload = { 
          requesterName: this.requesterName,
          destination: this.destination,
          departureDate: this.departureDate,
          returnDate: this.returnDate,
          description: this.description,
          status: 'solicitado' // Status inicial
        }
        
        const response = await api.createOrder(payload)
        this.orderId = response.id
        this.message = 'Pedido de viagem criado com sucesso.'
        this.messageType = 'success'
        this.$router.push('/dashboard')
      } catch (e) {
        this.message = e.message || 'Erro ao criar pedido de viagem.'
        this.messageType = 'error'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style src="vue-multiselect/dist/vue-multiselect.css"></style>
<style scoped>
.create-order { max-width: 700px; margin: 20px auto; text-align: left; }
.form { display: grid; gap: 12px; }
label { display: grid; gap: 6px; }
input, textarea { padding: 10px; border: 1px solid #ccc; border-radius: 6px; }
button { padding: 10px; border: none; border-radius: 6px; background: #64d0ff; color: white; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; }
button:disabled { opacity: 0.7; cursor: not-allowed; }
.form-row { display: flex; gap: 12px; }
.half-width { flex: 1;}
.readonly-field { background-color: #f5f5f5; color: #666; cursor: not-allowed; }
</style>

<style>
/* Estilos globais para o multiselect */
.multiselect__option--highlight {
  background: #64d0ff !important;
  color: white !important;
}

.multiselect__option--selected.multiselect__option--highlight {
  background: #50b8e5 !important;
  color: white !important;
}

/* Removendo completamente o "Press enter to select" */
.multiselect__option:after {
  display: none !important;
}
</style>