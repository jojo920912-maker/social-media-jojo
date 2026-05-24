<script setup>
import { LogOutOutline, DocumentTextOutline, PeopleOutline } from '@vicons/ionicons5'
import { useRouter } from 'vue-router'
import logo from '@/assets/icon.png'

const router = useRouter()

function logout(){
  localStorage.removeItem('token')
  localStorage.removeItem('role')
  localStorage.removeItem('user')
  router.push('/admin-login')
}

</script>

<template>
  <div class='adminSidebar'>
    <img
      class='logo'
      :src='logo'
    >

    <div class='menu'>
      <div class='menuItem'>
        <RouterLink to='/admin/posts'>
          <n-icon><DocumentTextOutline /></n-icon>
          <p>推文清單</p>
        </RouterLink>
      </div>
      <div class='menuItem'>
        <RouterLink to='/admin/users'>
          <n-icon><PeopleOutline /></n-icon>
          <p>使用者列表</p>
        </RouterLink>
      </div>
    </div>

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
.adminSidebar {
  width: 200px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 16px;
}

.logo {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-bottom: 24px;
  object-fit: cover;
}

.menu {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
}

.menuItem {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 15px;
  color: #171725;
}

.loginOut {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  margin-top: auto;
  color: #171725;
}

.menuItem a{
  display: flex;
  align-items: center;
  gap: 8px;
  color: inherit;
  text-decoration: none;
}

:deep(a.router-link-exact-active) {
  color: #ff6600;
  font-weight: bold;
}

</style>
