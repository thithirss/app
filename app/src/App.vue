<template>
  <nav>
    <router-link to="/">Home</router-link> |
    <router-link to="/dashboard">Dashboard</router-link> |
    <router-link to="/orders/new">Novo Pedido</router-link> |
    <router-link to="/about">About</router-link> |
    <router-link to="/servicos">Serviços</router-link>
    <span style="float:right">
      <router-link v-if="!isAuthenticated" to="/login">Login</router-link>
      <button v-else class="logout" @click="logout">Sair</button>
    </span>
  </nav>
  <router-view/>
</template>

<script>
import { clearToken } from '@/services/api'
export default {
  name: 'App',
  computed: {
    isAuthenticated() {
      return !!localStorage.getItem('auth_token')
    }
  },
  methods: {
    logout() {
      clearToken()
      this.$router.push('/login')
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
}
button.logout { border: none; background: transparent; color: #e53935; font-weight: bold; cursor: pointer; }
</style>
