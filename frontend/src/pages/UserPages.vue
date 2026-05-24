<script setup>
import { ref, onMounted } from 'vue'
import LeftSidebar from '@/components/LeftSidebar.vue'
import rightSidebar from '@/components/RightSidebar.vue'
import UserProfile from '@/components/UserProfile.vue'
import axios from 'axios'

const recommendList = ref([])
const userData = ref(null)

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

function callUserData(){
  userData.value.refreshUser()
}

onMounted(() => {
  getRecommendList()
})

</script>

<template>
  <div class='UserPages'>
    <LeftSidebar />
    <UserProfile ref='userData' />
    <rightSidebar
      :recommend-list='recommendList'
      @follow-changed='callUserData'
    />
  </div>
</template>

<style scoped>

.UserPages {
  display: flex;
  width: 1100px;
  margin: 0 auto;
  min-height: 100vh;
  justify-content: space-between;
}

</style>
