import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'

const ws = new WebSocket('wss://your-ws-id.execute-api.us-east-1.amazonaws.com/prod')

ws.onopen = () => console.log('WebSocket connected')
ws.onmessage = e => {
  const data = JSON.parse(e.data)
  alert(`📢 ${data.message}`)
}

createApp(App).use(router).mount('#app')