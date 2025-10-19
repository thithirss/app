<template>
  <div class="login-container">
      <div class="login-card">
      <div class="login-header">
        <h2>Bem-vindo a Travel</h2>
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
import { api } from '@/services/api'
import BaseToast from '@/components/BaseToast.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import { eventBus } from '@/services/eventBus'

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
        
        
        localStorage.setItem('auth_token', token)
        localStorage.setItem('user_data', JSON.stringify(res.user))
        
        // Emitir evento de login para atualizar o estado global
        eventBus.emit('auth:login', res.user)
        
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
  min-height: 100vh;
  background-color: #F8FAFC;
  padding: 1rem;
}

.login-card {
  width: 100%;
  max-width: 420px;
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  padding: 3rem 2.5rem;
  text-align: center;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.login-header {
  margin-bottom: 2.5rem;
}

.login-header h2 {
  color: #2d3748;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  letter-spacing: -0.025em;
}

.login-header p {
  color: #718096;
  font-size: 1rem;
  font-weight: 400;
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

.form-group {
  text-align: left;
}

label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  font-weight: 600;
  color: #4a5568;
  font-size: 0.95rem;
}

label i {
  color: #667eea;
  width: 16px;
  text-align: center;
}

input {
  width: 100%;
  padding: 1rem 1.25rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 400;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background-color: #f8fafc;
  box-sizing: border-box;
}

input::placeholder {
  color: #a0aec0;
  font-weight: 400;
}

input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
  background-color: white;
  transform: translateY(-1px);
}

input:hover:not(:focus) {
  border-color: #cbd5e0;
}

.login-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 1rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.5rem;
  min-height: 52px;
  position: relative;
  overflow: hidden;
}

.login-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.login-button:hover::before {
  left: 100%;
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.login-button:active {
  transform: translateY(0);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.login-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.login-button:disabled:hover {
  transform: none;
  box-shadow: none;
}

.login-button i {
  font-size: 1rem;
}

/* Responsividade */
@media (max-width: 480px) {
  .login-container {
    padding: 0.5rem;
  }
  
  .login-card {
    padding: 2rem 1.5rem;
    border-radius: 12px;
  }
  
  .login-header h2 {
    font-size: 1.75rem;
  }
  
  input {
    padding: 0.875rem 1rem;
  }
  
  .login-button {
    padding: 0.875rem 1.25rem;
  }
}

/* Animação de entrada */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-card {
  animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>