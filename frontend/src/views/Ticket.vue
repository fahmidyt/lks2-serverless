<template>
  <Navbar />
  <div class="container">
    <h2>Validate Ticket</h2>
    <input v-model="ticketCode" placeholder="Enter ticket code" />
    <button @click="validate">Validate</button>
    <p v-if="result">{{ result }}</p>
  </div>
</template>

<script setup>
import api from '../api'
const ticketCode = ref('')
const result = ref('')

async function validate() {
  const res = await api.post('/ticket', { ticketCode: ticketCode.value, userId: 'frontend' })
  result.value = res.data.message
}
</script>