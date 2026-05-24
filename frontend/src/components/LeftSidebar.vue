<script setup>
import { NButton } from 'naive-ui'
import { HomeOutline, LogOutOutline, PersonOutline, SettingsOutline } from '@vicons/ionicons5'
import { useRouter } from 'vue-router'
import logo from '@/assets/icon.png'

const router = useRouter()

function logout(){
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}
</script>

<template>
  <div class='sidebarPages'>
    <img
      class='photo'
      :src='logo'
    >

    <div class='menu'>
      <RouterLink
        class='menu-item'
        to='/'
      >
        <n-icon class='wordIcon'>
          <HomeOutline />
        </n-icon>
        首頁
      </RouterLink>

      <RouterLink
        class='menu-item'
        to='/UserPages'
      >
        <n-icon class='wordIcon'>
          <PersonOutline />
        </n-icon>
        個人資料
      </RouterLink>

      <RouterLink
        class='menu-item'
        to='/setting'
      >
        <n-icon class='wordIcon'>
          <SettingsOutline />
        </n-icon>
        設定
      </RouterLink>
    </div>

    <n-button
      class='pushBtn'
      color='#ff6600'
      round
      strong
      text-color='#ffffff'
    >
      推文
    </n-button>

    <div
      class='loginOut'
      @click='logout'
    >
      <n-icon><LogOutOutline /></n-icon>
      <p>登出</p>
    </div>
  </div>
</template>

<style scoped>
.sidebarPages {
  width: 16%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
}

.photo {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background-color: transparent;
  margin-bottom: 10px;
  margin-left: 6px;
  margin-top: 10px;
  object-fit: cover;
}

.menu {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 16px;
  width: 100%;
  padding: 8px 12px;
  border-radius: 8px;
  color: #171725;
  text-decoration: none;
  box-sizing: border-box;
}

.menu-item:hover {
  background-color: #f5f5f5;
}

.menu-item.router-link-active {
  color: #ff6600;
}

.pushBtn {
  margin-top: 24px;
  width: 100%;
}

.loginOut {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  margin-top: auto;
  color: #171725;
}

.wordIcon {
  padding-right: 20px;
}
</style>
