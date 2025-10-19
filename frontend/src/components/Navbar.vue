<template>
  <nav>
    <router-link to="/events">Events</router-link>
    <router-link to="/ticket">Tickets</router-link>
    <router-link to="/upload">Upload</router-link>
    <button @click="logout">Logout</button>
  </nav>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
function logout() {
  localStorage.removeItem('token')
  router.push('/login')
}
</script>

<style scoped>
nav { display: flex; gap: 1rem; background: #222; color: white; padding: 1rem; }
a { color: white; text-decoration: none; }
button { background: crimson; color: white; border: none; padding: 0.5rem 1rem; }
</style>