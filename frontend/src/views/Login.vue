<template>
  <div class="login">
    <h2>EventHub Login</h2>
    <input v-model="username" placeholder="Username" />
    <input v-model="password" placeholder="Password" type="password" />
    <button @click="login">Login</button>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script setup>
import api from '../api'
import { useRouter } from 'vue-router'

const router = useRouter()
const username = ref('')
const password = ref('')
const error = ref('')

async function login() {
  try {
    const res = await api.post('/token', { username: username.value, password: password.value })
    localStorage.setItem('token', res.data.token)
    router.push('/events')
  } catch (err) {
    error.value = 'Login failed!'
  }
}
</script>

<style scoped>
.login { display: flex; flex-direction: column; gap: 1rem; max-width: 300px; margin: 50px auto; }
.error { color: red; }
</style>