<template>
  <nav v-if="showNavbar">
    <div class="nav-container">
      <div class="nav-left">
        <router-link to="/dashboard"><i class="fas fa-tachometer-alt"></i> Dashboard</router-link>
        <router-link to="/orders/new"><i class="fas fa-plus-circle"></i> Cadastrar solicitação de viagem</router-link>
      </div>
      <div class="nav-right">
        <notification-center v-if="isAuthenticated" />
        <router-link v-if="!isAuthenticated" to="/login"><i class="fas fa-sign-in-alt"></i> Login</router-link>
        <button v-else class="logout" @click="logout"><i class="fas fa-sign-out-alt"></i> Sair</button>
      </div>
    </div>
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
    },
    showNavbar() {
      return this.$route.path !== '/login'
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
  padding: 0;
  background-color: #ffffff;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 70px;
}

.nav-left, .nav-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

nav a {
  font-weight: 600;
  color: #4a5568;
  text-decoration: none;
  padding: 10px 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
}

nav a i {
  font-size: 1.1rem;
}

nav a:hover {
  background-color: #f0f9ff;
  color: var(--primary-color);
  transform: translateY(-2px);
}

nav a.router-link-exact-active {
  color: white;
  background-color: var(--primary-color);
  box-shadow: 0 4px 12px rgba(100, 208, 255, 0.4);
}

button.logout { 
  border: none; 
  background: transparent; 
  color: #e53e3e; 
  font-weight: 600;
  cursor: pointer;
  padding: 10px 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
}

button.logout i {
  font-size: 1.1rem;
}

button.logout:hover {
  background-color: #fff5f5;
  transform: translateY(-2px);
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
