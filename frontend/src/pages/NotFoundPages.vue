<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<template>
  <div style='display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh;'>
    <p style='font-size:48px; font-weight:bold;'>
      404
    </p>
    <p style='font-size:18px; color:#888888;'>
      頁面不存在
    </p>
    <n-button
      color='#ff6600'
      round
      text-color='#ffffff'
      @click="router.push('/login')"
    >
      回首頁
    </n-button>
  </div>
</template>
