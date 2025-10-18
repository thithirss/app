<template>
  <div class="home">
    <div v-if="isAuthenticated">
      <router-link to="/dashboard" replace></router-link>
    </div>
    <div v-else>
      <router-link to="/login" replace></router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomeView',
  computed: {
    isAuthenticated() {
      return !!localStorage.getItem('auth_token')
    }
  },
  mounted() {
    if (this.isAuthenticated) {
      this.$router.replace('/dashboard')
    } else {
      this.$router.replace('/login')
    }
  }
}
</script>
