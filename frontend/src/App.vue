<script setup>
import { RouterView } from 'vue-router'
import { NMessageProvider, NDialogProvider } from 'naive-ui'

</script>

<template>
  <n-message-provider placement='bottom-right'>
    <n-dialog-provider>
      <RouterView />
    </n-dialog-provider>
  </n-message-provider>
</template>

<style>

#app {
  user-select: none;
  background-color: white;
}

input, textarea {
  user-select: text;
}

</style>
