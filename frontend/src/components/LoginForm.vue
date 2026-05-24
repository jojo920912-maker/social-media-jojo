<script setup>
import { ref } from 'vue'
import { NInput, NButton } from 'naive-ui'

const account = ref('')
const password = ref('')

const errorMsg = ref({
  account: '',
  password: ''
})

const props = defineProps({
  msg: { type: String, required: true },
  title: { type: String, required: true },
  onLogin: { type: Function, default: () => {} }
})

function validate() {
  let valid = true
  errorMsg.value = { account: '', password: '' }

  if (!account.value.trim()) {
    errorMsg.value.account = '帳號不能空白'
    valid = false
  }
  if (!password.value.trim()) {
    errorMsg.value.password = '密碼不能空白'
    valid = false
  }

  return valid
}

function handleLogin() {
  if (!validate()) return
  props.onLogin(account.value, password.value)
}
</script>

<template>
  <div class='loginPages'>
    <p class='title'>
      {{ title }}
    </p>

    <div class='inputGroup'>
      <label class='accountSecret'>帳號</label>
      <n-input
        v-model:value='account'
        class='customInput'
        placeholder='請輸入帳號'
        type='text'
      />
      <span
        v-if='errorMsg.account'
        class='error'
      >{{ errorMsg.account }}</span>
    </div>

    <div class='inputGroup'>
      <label class='accountSecret'>密碼</label>
      <n-input
        v-model:value='password'
        class='customInput'
        placeholder='請輸入密碼'
        type='password'
      />
      <span
        v-if='errorMsg.password'
        class='error'
      >{{ errorMsg.password }}</span>
    </div>

    <n-button
      color='#ff6600'
      round
      strong
      style='width: 100%;'
      text-color='#ffffff'
      @click='handleLogin'
    >
      登入
    </n-button>
  </div>
</template>

<style scoped>
.loginPages {
  width: 360px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.title {
  font-size: 20px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 8px;
  color: #1C1C1C;
}

.inputGroup {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.accountSecret {
  font-size: 13px;
  color: #888888;
}

.customInput {
  width: 100%;
}

.error {
  font-size: 13px;
  color: #ff6600;
  margin-top: 2px;
}
</style>
