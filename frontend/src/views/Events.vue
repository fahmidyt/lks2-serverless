<template>
  <Navbar />
  <div class="container">
    <h2>Upcoming Events</h2>
    <div class="events">
      <EventCard v-for="ev in events" :key="ev.id" :event="ev" @buy="buyTicket" />
    </div>
  </div>
</template>

<script setup>
import api from '../api'
import EventCard from '../components/EventCard.vue'
import Navbar from '../components/Navbar.vue'

const events = ref([])

onMounted(async () => {
  const res = await api.get('/event')
  events.value = res.data
})

async function buyTicket(event) {
  await api.post('/ticket', { eventId: event.id })
  alert(`Ticket purchased for ${event.name}`)
}
</script>

<style scoped>
.container { max-width: 800px; margin: auto; }
.events { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem; }
</style>
