<script setup>
import { ref, onMounted } from 'vue'
import LeftSidebar from '@/components/LeftSidebar.vue'
import RightSidebar from '@/components/RightSidebar.vue'
import axios from 'axios'

const user = JSON.parse(localStorage.getItem('user'))
const userId = user.id

const account = ref('')
const name = ref('')
const email = ref('')
const password = ref('')
const passwordConfirm = ref('')
const recommendList = ref([])

const errorMsg = ref({
  account: '',
  name: '',
  email: '',
  password: ''
})

function validate() {
  let valid = true
  errorMsg.value = { account: '', name: '', email: '', password: '' }

  if (!account.value.trim()) {
    errorMsg.value.account = '帳號不能空白'
    valid = false
  }
  if (!name.value.trim()) {
    errorMsg.value.name = '名稱不能空白'
    valid = false
  }
  if (!email.value.trim()) {
    errorMsg.value.email = 'Email 不能空白'
    valid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errorMsg.value.email = 'Email 格式不正確'
    valid = false
  }
  if (password.value && password.value !== passwordConfirm.value) {
    errorMsg.value.password = '兩次密碼不一致'
    valid = false
  }

  return valid
}

async function getUserData() {
  try {
    const { data } = await axios.get(`/api/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    account.value = data.account
    name.value = data.name
    email.value = data.email
  } catch(error) {
    console.error(error)
  }
}

async function saveSetting() {
  if (!validate()) return
  try {
    const formData = new FormData()
    formData.append('account', account.value)
    formData.append('name', name.value)
    formData.append('email', email.value)
    if (password.value) {
      formData.append('password', password.value)
      formData.append('checkPassword', passwordConfirm.value)
    }
    await axios.put(`/api/users/${userId}`, formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    alert('儲存成功！')
  } catch(error) {
    console.error(error)
  }
}

async function getRecommendList() {
  try {
    const { data } = await axios.get('/api/users/top', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    recommendList.value = data.map((user) => ({
      id: user.id,
      name: user.name,
      account: '@' + user.account,
      avatar: user.avatar?.startsWith('/uploads')
        ? `http://localhost:3000${user.avatar}`
        : user.avatar,
      isFollowed: user.isFollowed
    }))
  } catch(error) {
    console.error(error)
  }
}

onMounted(() => {
  getUserData()
  getRecommendList()
})
</script>

<template>
  <div class='settingPages'>
    <LeftSidebar />
    <div class='content'>
      <p class='title'>
        帳戶設定
      </p>

      <div class='settingInput'>
        <label>帳號</label>
        <input
          v-model='account'
          type='text'
        >
        <span
          v-if='errorMsg.account'
          class='error'
        >{{ errorMsg.account }}</span>
      </div>

      <div class='settingInput'>
        <label>名稱</label>
        <input
          v-model='name'
          type='text'
        >
        <span
          v-if='errorMsg.name'
          class='error'
        >{{ errorMsg.name }}</span>
      </div>

      <div class='settingInput'>
        <label>Email</label>
        <input
          v-model='email'
          type='email'
        >
        <span
          v-if='errorMsg.email'
          class='error'
        >{{ errorMsg.email }}</span>
      </div>

      <div class='settingInput'>
        <label>密碼</label>
        <input
          v-model='password'
          placeholder='請設定密碼'
          type='password'
        >
      </div>

      <div class='settingInput'>
        <label>密碼確認</label>
        <input
          v-model='passwordConfirm'
          placeholder='請再次輸入密碼'
          type='password'
        >
        <span
          v-if='errorMsg.password'
          class='error'
        >{{ errorMsg.password }}</span>
      </div>

      <div class='btnArea'>
        <n-button
          color='#ff6600'
          round
          text-color='#ffffff'
          @click='saveSetting'
        >
          儲存
        </n-button>
      </div>
    </div>
    <RightSidebar :recommend-list='recommendList' />
  </div>
</template>

<style scoped>
.settingPages {
  display: flex;
  width: 1100px;
  margin: 0 auto;
  min-height: 100vh;
  justify-content: space-between;
}

.content {
  width: 58%;
  border-left: 1px solid #eeeeee;
  border-right: 1px solid #eeeeee;
  padding: 24px;
}

.title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eeeeee;
  color: #171725;
}

.settingInput {
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
}

.settingInput label {
  font-size: 13px;
  color: #888888;
  margin-bottom: 4px;
}

.settingInput input {
  border: none;
  border-bottom: 1px solid #cccccc;
  outline: none;
  font-size: 15px;
  padding: 8px 0;
  background: transparent;
}

.btnArea {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
}

.error {
  font-size: 13px;
  color: #ff6600;
  margin-top: 4px;
}
</style>
