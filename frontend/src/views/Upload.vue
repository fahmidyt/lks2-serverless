<template>
  <Navbar />
  <div class="container">
    <h2>Upload Event Media</h2>
    <input type="file" @change="onFile" />
    <button @click="upload" :disabled="!file">Upload</button>
    <p v-if="msg">{{ msg }}</p>
  </div>
</template>

<script setup>
import api from '../api'
const file = ref(null)
const msg = ref('')

function onFile(e) {
  file.value = e.target.files[0]
}

async function upload() {
  const base64 = await toBase64(file.value)
  await api.put(`/payment/${file.value.name}`, base64)
  msg.value = 'Uploaded successfully!'
}

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
</script>
