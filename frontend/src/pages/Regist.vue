<script setup>
import { ref } from 'vue'
import { NInput, NButton, useMessage } from 'naive-ui'
import axios from 'axios'
import { useRouter } from 'vue-router'
import logo from '@/assets/icon.png'

const router = useRouter()

const account = ref('')
const userName = ref('')
const userEmail = ref('')
const password = ref('')
const passwordConfirm = ref('')

const errorMsg = ref({
  account: '',
  name: '',
  email: '',
  password: '',
  passwordConfirm: ''
})

const message = useMessage()

function validate() {
  let valid = true
  errorMsg.value = { account: '', name: '', email: '', password: '', passwordConfirm: '' }

  if (!account.value.trim()) {
    errorMsg.value.account = '帳號不能空白'
    valid = false
  }
  if (!userName.value.trim()) {
    errorMsg.value.name = '名稱不能空白'
    valid = false
  }
  if (!userEmail.value.trim()) {
    errorMsg.value.email = 'Email 不能空白'
    valid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail.value)) {
    errorMsg.value.email = 'Email 格式不正確'
    valid = false
  }
  if (!password.value.trim()) {
    errorMsg.value.password = '密碼不能空白'
    valid = false
  }
  if (!passwordConfirm.value.trim()) {
    errorMsg.value.passwordConfirm = '密碼確認不能空白'
    valid = false
  } else if (password.value !== passwordConfirm.value) {
    errorMsg.value.passwordConfirm = '兩次密碼不一致'
    valid = false
  }

  return valid
}

async function register() {
  if (!validate()) return
  try {
    await axios.post('/api/users', {
      account: account.value,
      name: userName.value,
      email: userEmail.value,
      password: password.value,
      checkPassword: passwordConfirm.value
    })
    message.success('註冊成功')
    router.push('/login')
  } catch(error) {
    message.error('註冊失敗')
    console.error(error)
  }
}

function cancel() {
  router.push('/login')
}
</script>

<template>
  <div class='allRegist'>
    <div class='registCard'>
      <img
        class='logo'
        :src='logo'
      >
      <p class='title'>
        建立你的帳號
      </p>

      <div class='inputGroup'>
        <label class='inputLabel'>帳號</label>
        <n-input
          v-model:value='account'
          placeholder='請輸入帳號'
          type='text'
        />
        <span
          v-if='errorMsg.account'
          class='error'
        >{{ errorMsg.account }}</span>
      </div>

      <div class='inputGroup'>
        <label class='inputLabel'>名稱</label>
        <n-input
          v-model:value='userName'
          placeholder='請輸入使用者名稱'
          type='text'
        />
        <span
          v-if='errorMsg.name'
          class='error'
        >{{ errorMsg.name }}</span>
      </div>

      <div class='inputGroup'>
        <label class='inputLabel'>Email</label>
        <n-input
          v-model:value='userEmail'
          placeholder='請輸入Email'
          type='text'
        />
        <span
          v-if='errorMsg.email'
          class='error'
        >{{ errorMsg.email }}</span>
      </div>

      <div class='inputGroup'>
        <label class='inputLabel'>密碼</label>
        <n-input
          v-model:value='password'
          placeholder='請設定密碼'
          type='password'
        />
        <span
          v-if='errorMsg.password'
          class='error'
        >{{ errorMsg.password }}</span>
      </div>

      <div class='inputGroup'>
        <label class='inputLabel'>密碼確認</label>
        <n-input
          v-model:value='passwordConfirm'
          placeholder='請再次輸入密碼'
          type='password'
        />
        <span
          v-if='errorMsg.passwordConfirm'
          class='error'
        >{{ errorMsg.passwordConfirm }}</span>
      </div>

      <n-button
        color='#ff6600'
        round
        strong
        style='width: 100%;'
        text-color='#ffffff'
        @click='register'
      >
        註冊
      </n-button>

      <n-button
        style='width: 100%; text-align: center;'
        text
        text-color='#0080FF'
        @click='cancel'
      >
        取消
      </n-button>
    </div>
  </div>
</template>

<style scoped>
.allRegist {
  display: flex;
  justify-content: center;
  align-items: start;
  min-height: 100vh;
  background-color: #ffffff;
}

.registCard {
  width: 360px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 40px 0;
}

.logo {
  width: 50px;
  height: 50px;
}

.title {
  font-size: 20px;
  font-weight: bold;
  text-align: center;
  color: #171725;
}

.inputGroup {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
}

.inputLabel {
  font-size: 13px;
  color: #888888;
}

.error {
  font-size: 13px;
  color: #ff6600;
  margin-top: 2px;
}
</style>
