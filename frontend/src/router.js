import { createRouter, createWebHistory } from 'vue-router'
import Login from './views/Login.vue'
import Events from './views/Events.vue'
import Ticket from './views/Ticket.vue'
import Upload from './views/Upload.vue'

const routes = [
  { path: '/', redirect: '/events' },
  { path: '/login', component: Login },
  { path: '/events', component: Events },
  { path: '/ticket', component: Ticket },
  { path: '/upload', component: Upload }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router