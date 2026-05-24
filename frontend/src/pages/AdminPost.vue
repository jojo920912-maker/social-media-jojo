<script setup>
import { ref, onMounted } from 'vue'
import AdminSidebar from '@/components/AdminSidebar.vue'
import axios from 'axios'
import { postsTime } from '@/utils/Time.js'
import { CloseOutline } from '@vicons/ionicons5'

const posts = ref([])

async function adminPostsData() {
  try {
    const adminApiData = await axios.get('/api/admin/tweets', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('adminToken')}`
      }
    })
    posts.value = adminApiData.data.map((admin) => ({
      id: admin.id,
      description: admin.description,
      createdAt: admin.createdAt,
      user: admin.user,
      avatar: admin.user.avatar?.startsWith('/uploads')
        ? `http://localhost:3000${admin.user.avatar}`
        : admin.user.avatar
    }))
  } catch(error) {
    console.error(error)
  }
}

async function deletePost(userPost) {
  try {
    await axios.delete(`/api/admin/tweets/${userPost}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('adminToken')}`
      }
    })
    posts.value = posts.value.filter((post) => post.id !== userPost)
  } catch(error) {
    console.error(error)
  }
}

onMounted(() => {
  adminPostsData()
})
</script>

<template>
  <div class='adminPages'>
    <AdminSidebar />
    <div class='adminPost'>
      <p class='title'>
        貼文審查
      </p>

      <div
        v-for='post in posts'
        :key='post.id'
        class='postRow'
      >
        <img
          v-if='post.avatar'
          class='avatar'
          :src='post.avatar'
        >
        <div
          v-else
          class='avatar'
        />
        <div class='postInfo'>
          <div class='userRow'>
            <span class='name'>{{ post.user.name }}</span>
            <span class='account'>@{{ post.user.account }}</span>
            <span class='time'>・{{ postsTime(post.createdAt) }}</span>
          </div>
          <p class='content'>
            {{ post.description }}
          </p>
        </div>
        <div
          class='delete'
          @click='deletePost(post.id)'
        >
          <n-icon><CloseOutline /></n-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.adminPages {
  display: flex;
  height: 100vh;
  max-width: 1100px;
  margin: 0 auto;
}

.adminPost {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  border-left: 1px solid #eeeeee;
  border-right: 1px solid #eeeeee;
}

.title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 16px;
  color: #171725;
}

.postRow {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  margin: 0 -16px;
  border-bottom: 1px solid #eeeeee;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #cccccc;
  flex-shrink: 0;
  object-fit: cover;
}

.postInfo {
  flex: 1;
}

.userRow {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
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

.time {
  font-size: 13px;
  color: #888888;
}

.content {
  font-size: 14px;
  color: #555555;
}

.delete {
  cursor: pointer;
  color: #ff6600;
  font-weight: bold;
  font-size: 16px;
}
</style>
