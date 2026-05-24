<script setup>
import { ref, onMounted } from 'vue'
import { fetchHello } from '@/api/demo.js'

const message = ref('Loading...')
const error = ref('')

onMounted(async () => {
  try {
    const data = await fetchHello()
    message.value = data.message
  } catch (e) {
    error.value = e.message
    message.value = ''
  }
})
</script>

<template>
  <div class='demo'>
    <h1>API Demo</h1>
    <p>This page demonstrates how to call the backend API using fetch.</p>

    <div
      v-if='message'
      class='success'
    >
      <p>Backend says:</p>
      <h2>{{ message }}</h2>
    </div>

    <div
      v-if='error'
      class='error'
    >
      <p>Error: {{ error }}</p>
      <p>Make sure the backend is running (npm start)</p>
    </div>

    <div class='info'>
      <h3>How it works</h3>
      <p>Check <code>src/api/demo.js</code> — it uses native <code>fetch</code> to call <code>/api/hello</code>.</p>
      <p>
        API docs: <a
          href='http://localhost:3000/docs'
          target='_blank'
        >http://localhost:3000/docs</a>
      </p>
    </div>
  </div>
</template>

<style scoped>
.demo {
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  font-family: sans-serif;
}
.success {
  background: #d4edda;
  border: 1px solid #c3e6cb;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  color: #155724;
}
.success h2 {
  margin: 0.5rem 0 0;
}
.error {
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  color: #721c24;
}
.info {
  background: #e2e3e5;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  color: #383d41;
}
.info h3 {
  margin-top: 0;
}
code {
  background: #d6d8db;
  padding: 0.15rem 0.4rem;
  border-radius: 3px;
  font-size: 0.9rem;
}
</style>
