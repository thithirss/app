<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h2>Bem-vindo ao Sistema de Viagens</h2>
        <p>Faça login para continuar</p>
      </div>

      <BaseToast :message="message" :type="messageType" />

      <form @submit.prevent="onSubmit" class="login-form">
        <div class="form-group">
          <label for="email">
            <i class="fas fa-envelope"></i> Email
          </label>
          <input 
            id="email"
            v-model="email" 
            type="email" 
            placeholder="email@exemplo.com" 
            required 
          />
        </div>
        
        <div class="form-group">
          <label for="password">
            <i class="fas fa-lock"></i> Senha
          </label>
          <input 
            id="password"
            v-model="password" 
            type="password" 
            placeholder="Sua senha" 
            required 
          />
        </div>

        <button type="submit" :disabled="loading" class="login-button">
          <LoadingSpinner :visible="loading" />
          <span v-if="!loading"><i class="fas fa-sign-in-alt"></i> Entrar</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import { api, setToken } from '@/services/api'
import BaseToast from '@/components/BaseToast.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

export default {
  name: 'LoginView',
  components: { BaseToast, LoadingSpinner },
  data() {
    return {
      email: '',
      password: '',
      loading: false,
      message: '',
      messageType: 'info',
    }
  },
  methods: {
    async onSubmit() {
      this.loading = true
      this.message = ''
      this.messageType = 'info'
      try {
        const res = await api.login(this.email, this.password)
        const token = res?.token || res?.access_token || res?.jwt
        if (!token) throw new Error('Token não retornado pela API')
        setToken(token)
        this.message = 'Login realizado com sucesso.'
        this.messageType = 'success'
        const redirect = this.$route.query.redirect || '/dashboard'
        this.$router.push(redirect)
      } catch (e) {
        this.message = e.message || 'Erro ao efetuar login.'
        this.messageType = 'error'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  background-color: #f8fafc;
}

.login-card {
  width: 100%;
  max-width: 450px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  padding: 2.5rem;
  text-align: center;
}

.login-header {
  margin-bottom: 2rem;
}

.login-header h2 {
  color: #2d3748;
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.login-header p {
  color: #718096;
  font-size: 1rem;
}

.login-form {
  display: grid;
  gap: 1.5rem;
}

.form-group {
  text-align: left;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #4a5568;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background-color: #f8fafc;
}

input:focus {
  outline: none;
  border-color: #64d0ff;
  box-shadow: 0 0 0 3px rgba(100, 208, 255, 0.25);
  background-color: white;
}

.login-button {
  background-color: #64d0ff;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
}

.login-button:hover {
  background-color: #50b8e5;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(100, 208, 255, 0.3);
}

.login-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
</style>