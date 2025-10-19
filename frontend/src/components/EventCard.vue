<template>
  <div class="card">
    <h3>{{ event.name }}</h3>
    <p>{{ new Date(event.date).toLocaleString() }}</p>
    <p>{{ event.location }}</p>
    <p>\${{ event.price }}</p>
    <button @click="$emit('buy', event)">Buy Ticket</button>
  </div>
</template>

<script setup>
defineProps({ event: Object })
</script>

<style scoped>
.card { border: 1px solid #ddd; padding: 1rem; border-radius: 8px; }
button { background: #2c3e50; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; }
</style>