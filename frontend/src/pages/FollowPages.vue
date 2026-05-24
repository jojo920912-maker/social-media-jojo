<script setup>
import { ref, onMounted } from 'vue'
import LeftSidebar from '@/components/LeftSidebar.vue'
import RightSidebar from '@/components/RightSidebar.vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { ArrowBack } from '@vicons/ionicons5'

const router = useRouter()
const user = JSON.parse(localStorage.getItem('user'))
const userId = user.id

const userName = ref('')
const userCount = ref(0)
const activeTab = ref('followers')
const followList = ref([])
const recommendList = ref([])

async function userData() {
  try {
    const { data } = await axios.get(`/api/users/${userId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    userName.value = data.name
    userCount.value = data.tweetsCount
  } catch(error) {
    console.error(error)
  }
}

async function followers() {
  try {
    const { data } = await axios.get(`/api/users/${userId}/followers`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    followList.value = data.map((item) => ({
      id: item.id,
      name: item.name,
      account: '@' + item.account,
      introduction: item.introduction,
      isFollowed: item.isFollowed
    }))
  } catch(error) {
    console.error(error)
  }
}

async function followings() {
  try {
    const { data } = await axios.get(`/api/users/${userId}/followings`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    followList.value = data.map((item) => ({
      id: item.id,
      name: item.name,
      account: '@' + item.account,
      introduction: item.introduction,
      isFollowed: item.isFollowed
    }))
  } catch(error) {
    console.error(error)
  }
}

async function toggleFollow(item) {
  try {
    if (item.isFollowed) {
      await axios.delete(`/api/followships/${item.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      item.isFollowed = false
    } else {
      await axios.post('/api/followships', { id: item.id }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      item.isFollowed = true
    }
  } catch(error) {
    console.error(error)
  }
}

async function topUsers() {
  try {
    const { data } = await axios.get('/api/users/top', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
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

function switchTab(tab) {
  activeTab.value = tab
  if (tab === 'followers') followers()
  else followings()
}

function refreshList() {
  switchTab(activeTab.value)
}

onMounted(() => {
  userData()
  followers()
  topUsers()
})
</script>

<template>
  <div class='followPages'>
    <LeftSidebar />
    <div class='content'>
      <div class='header'>
        <n-icon
          style='cursor:pointer'
          @click="router.push('/UserPages')"
        >
          <ArrowBack />
        </n-icon>
        <div>
          <p class='userName'>
            {{ userName }}
          </p>
          <p class='userCount'>
            {{ userCount }} 推文
          </p>
        </div>
      </div>

      <div class='tab'>
        <p
          :class='{ activeTab: activeTab === "followers" }'
          @click='switchTab("followers")'
        >
          追隨者
        </p>
        <p
          :class='{ activeTab: activeTab === "followings" }'
          @click='switchTab("followings")'
        >
          正在追隨
        </p>
      </div>

      <div
        v-for='item in followList'
        :key='item.id'
        class='userCard'
      >
        <div class='avatar' />
        <div class='userInfo'>
          <div class='userRow'>
            <div>
              <p class='name'>
                {{ item.name }}
              </p>
              <p class='account'>
                {{ item.account }}
              </p>
            </div>
            <n-button
              :bordered='!item.isFollowed'
              :color="item.isFollowed ? '#ff6600' : ''"
              round
              :text-color="item.isFollowed ? '#ffffff' : '#ff6600'"
              @click='toggleFollow(item)'
            >
              {{ item.isFollowed ? '正在跟隨' : '跟隨' }}
            </n-button>
          </div>
          <p class='introduction'>
            {{ item.introduction }}
          </p>
        </div>
      </div>
    </div>
    <RightSidebar
      :recommend-list='recommendList'
      @follow-changed='refreshList'
    />
  </div>
</template>

<style scoped>
.followPages {
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
  min-height: 100vh;
}

.header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-bottom: 1px solid #eeeeee;
}

.header .n-icon {
  font-size: 24px;
}

.userName {
  font-size: 18px;
  font-weight: bold;
}

.userCount {
  font-size: 14px;
  color: #888888;
}

.tab {
  display: flex;
  border-bottom: 2px solid #eeeeee;
}

.tab p {
  text-align: center;
  padding: 12px 54px;
  cursor: pointer;
  font-size: 16px;
  white-space: nowrap;
}

.activeTab {
  color: #ff6600;
  border-bottom: 2px solid #ff6600;
}

.userCard {
  display: flex;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid #eeeeee;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #cccccc;
  flex-shrink: 0;
  object-fit: cover;
}

.userInfo {
  flex: 1;
}

.userRow {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.name {
  font-weight: bold;
  font-size: 14px;
}

.account {
  font-size: 13px;
  color: #888888;
}

.introduction {
  font-size: 14px;
  color: #555555;
}
</style>
