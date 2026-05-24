<script setup>
import { ref, onMounted } from 'vue'
import AdminSidebar from '@/components/AdminSidebar.vue'
import axios from 'axios'
import { CreateOutline, HeartOutline } from '@vicons/ionicons5'

const users = ref([])

async function adminUserList() {
  try{
    const userListData = await axios.get('/api/admin/users', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('adminToken')}`
      }
    })

    console.log(userListData.data)
    users.value = userListData.data.map((userList) => ({
      id: userList.id,
      name: userList.name,
      account: '@' + userList.account,
      avatar:  userList.avatar?.startsWith('/uploads')
        ? `http://localhost:3000${userList.avatar}`
        : userList.avatar,
      banner: userList.banner?.startsWith('/uploads')
        ? `http://localhost:3000${userList.banner}`
        : userList.banner,
      tweetsCount: userList.tweetsCount,
      followersCount: userList.followersCount,
      followingsCount: userList.followingsCount,
      getLikesCount: userList.getLikesCount
    }))
  }catch(error){
    console.error(error)
  }
}

onMounted(() => {
  adminUserList()
})

</script>

<template>
  <div class='adminUserPages'>
    <AdminSidebar />
    <div class='adminUser'>
      <p class='title'>
        使用者列表
      </p>
      <div class='userList'>
        <div
          v-for='user in users'
          :key='user.id'
          class='userCard'
        >
          <div class='bannerPages'>
            <img
              v-if='user.banner'
              :src='user.banner'
              style='width:100%; height:100%; object-fit:cover;'
            >
            <div
              v-else
              class='banner'
            />
          </div>
          <img
            class='avatar'
            :src='user.avatar'
          >
          <p class='name'>
            {{ user.name }}
          </p>
          <p class='account'>
            {{ user.account }}
          </p>
          <div class='stats'>
            <span><n-icon><CreateOutline /></n-icon> {{ user.tweetsCount }}</span>
            <span><n-icon><HeartOutline /></n-icon> {{ user.getLikesCount }}</span>
          </div>
          <div class='follows'>
            <span>{{ user.followingsCount }} 追隨中</span>
            <span>{{ user.followersCount }} 追隨者</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.adminUserPages {
  display: flex;
  height: 100vh;
  max-width: 1100px;
  margin: 0 auto;
}

.adminUser {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.title{
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 16px;
  color: #171725;
}

.userList{
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.userCard{
  border: 1px solid #eeeeee;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding-bottom: 16px;
}

.avatar{
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 3px solid white;
  background-color: #cccccc;
  margin-top: -50px;
  position: relative;
  z-index: 1;
  object-fit: cover;
}

.follows {
  display: flex;
  gap: 12px;
  font-size: 13px;
  color: #555555;
}

.name {
  font-weight: bold;
  font-size: 14px;
  color: #171725;
}

.account {
  font-size: 13px;
  color: #888888;
}

.stats {
  display: flex;
  gap: 12px;
  font-size: 13px;
  color: #555555;
}

.bannerPages {
  width: 100%;
  height: 80px;
  overflow: hidden;
  border-radius: 8px 8px 0 0;
}

.banner {
  width: 100%;
  height: 100%;
  background-color: #cccccc;
}

.banner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

</style>
