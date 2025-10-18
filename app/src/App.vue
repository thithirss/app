<template>
  <nav>
    <!-- <router-link to="/"><i class="fas fa-home"></i> Home</router-link> -->
    <router-link to="/dashboard"><i class="fas fa-tachometer-alt"></i> Dashboard</router-link>
    <router-link to="/orders/new"><i class="fas fa-plus-circle"></i> Cadastrar solicitação de viagem</router-link>
    <!-- <router-link to="/about">About</router-link> |
    <router-link to="/servicos">Serviços</router-link> -->
    <span style="margin-left: auto">
      <notification-center v-if="isAuthenticated" />
      <router-link v-if="!isAuthenticated" to="/login"><i class="fas fa-sign-in-alt"></i> Login</router-link>
      <button v-else class="logout" @click="logout"><i class="fas fa-sign-out-alt"></i> Sair</button>
    </span>
  </nav>
  <div class="content-container">
    <router-view/>
  </div>
</template>

<script>
import { clearToken } from '@/services/api'
import NotificationCenter from '@/components/NotificationCenter.vue'
import '@/assets/styles/variables.css'
import '@fortawesome/fontawesome-free/css/all.css'

export default {
  name: 'App',
  components: {
    NotificationCenter
  },
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
  color: var(--text-color);
  background-color: var(--background-color);
  min-height: 100vh;
}

nav {
  padding: 20px 30px;
  background-color: white;
  box-shadow: var(--box-shadow);
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

nav a {
  font-weight: bold;
  color: var(--text-color);
  text-decoration: none;
  padding: 8px 12px;
  border-radius: var(--border-radius);
  margin: 0 5px;
  transition: all var(--transition-speed);
}

nav a:hover {
  background-color: var(--primary-light);
  color: var(--primary-dark);
}

nav a.router-link-exact-active {
  color: white;
  background-color: var(--primary-color);
  box-shadow: 0 2px 5px rgba(100, 208, 255, 0.3);
}

button.logout { 
  border: none; 
  background: transparent; 
  color: var(--error-color); 
  font-weight: bold; 
  cursor: pointer;
  padding: 8px 12px;
  border-radius: var(--border-radius);
  transition: all var(--transition-speed);
}

button.logout:hover {
  background-color: #ffebee;
}

.content-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

/* Estilos globais para botões */
.btn {
  background: var(--primary-color);
  color: white;
  padding: 8px 16px;
  border-radius: var(--border-radius);
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all var(--transition-speed);
  text-decoration: none;
  font-weight: 500;
}

.btn:hover {
  background: var(--primary-dark);
  box-shadow: var(--box-shadow-hover);
  transform: translateY(-2px);
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

/* Estilos para tabelas */
table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
  box-shadow: var(--box-shadow);
  border-radius: var(--border-radius);
  overflow: hidden;
}

table th {
  background-color: var(--primary-color);
  color: white;
  padding: 12px;
  text-align: left;
}

table td {
  padding: 12px;
  border-bottom: 1px solid var(--border-color);
}

table tr:nth-child(even) {
  background-color: rgba(100, 208, 255, 0.05);
}

table tr:hover {
  background-color: rgba(100, 208, 255, 0.1);
}

/* Estilos para formulários */
input, select, textarea {
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  width: 100%;
  transition: all var(--transition-speed);
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(100, 208, 255, 0.2);
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

/* Responsividade */
@media (max-width: 768px) {
  nav {
    flex-direction: column;
    padding: 15px;
  }
  
  nav a {
    margin: 5px 0;
  }
  
  nav span {
    margin-top: 10px;
    margin-left: 0;
    width: 100%;
    display: flex;
    justify-content: center;
  }
}
</style>
