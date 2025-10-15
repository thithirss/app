<template>
  <div class="login">
    <h2>Login</h2>

    <BaseToast :message="message" :type="messageType" />

    <form @submit.prevent="onSubmit" class="form">
      <label>
        Email
        <input v-model="email" type="email" placeholder="email@exemplo.com" required />
      </label>
      <label>
        Senha
        <input v-model="password" type="password" placeholder="Sua senha" required />
      </label>

      <button type="submit" :disabled="loading">
        <LoadingSpinner :visible="loading" />
        <span v-if="!loading">Entrar</span>
      </button>
    </form>
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
.login { max-width: 420px; margin: 40px auto; text-align: left; }
.form { display: grid; gap: 12px; }
label { display: grid; gap: 6px; }
input { padding: 10px; border: 1px solid #ccc; border-radius: 6px; }
button { padding: 10px; border: none; border-radius: 6px; background: #42b983; color: white; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; }
button:disabled { opacity: 0.7; cursor: not-allowed; }
</style>