<script setup>
import LoginForm from '@/components/LoginForm.vue'
import { NButton, NSpace, useMessage } from 'naive-ui'
import axios from 'axios'
import { useRouter } from 'vue-router'
import logo from '@/assets/icon.png'

const name = '登入Zuno'
const router = useRouter()

const message = useMessage()

async function userLogin(account, password) {
  try {
    const { data } = await axios.post('/api/users/signin', {
      account,
      password
    })
    localStorage.setItem('token', data.token)
    localStorage.setItem('role', 'user')
    localStorage.setItem('user', JSON.stringify(data.user))
    message.success('登入成功')
    router.push('/')
  } catch(error) {
    message.error('登入失敗')
    console.error(error)
  }
}
</script>

<template>
  <div class='allLogin'>
    <div class='loginCard'>
      <img
        class='logo'
        :src='logo'
      >
      <LoginForm
        msg='登入頁面'
        :on-login='userLogin'
        :title='name'
      />
      <div class='button'>
        <n-space>
          <n-button
            text
            text-color='#0080FF'
            @click='router.push("/regist")'
          >
            註冊
          </n-button>
          <p>・</p>
          <n-button
            text
            text-color='#0080FF'
            @click='router.push("/admin-login")'
          >
            後台登入
          </n-button>
        </n-space>
      </div>
    </div>
  </div>
</template>

<style scoped>
.allLogin {
  display: flex;
  justify-content: center;
  align-items: start;
  height: 100vh;
  background-color: #ffffff;
}

.loginCard {
  width: 360px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-top: 40px;
}

.logo {
  width: 50px;
  height: 50px;
}

.button {
  width: 100%;
  display: flex;
  justify-content: flex-end;
}

</style>
