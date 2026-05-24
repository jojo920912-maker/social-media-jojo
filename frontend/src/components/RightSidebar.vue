<script setup>
import { NButton } from 'naive-ui'
import axios from 'axios'

const props = defineProps({
  recommendList: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['followChanged'])

async function toggleFollow(user) {
  try {
    if (user.isFollowed) {
      await axios.delete(`/api/followships/${user.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      user.isFollowed = false
    } else {
      await axios.post('/api/followships', { id: user.id }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      user.isFollowed = true
    }
    emit('followChanged')
  } catch(error) {
    console.error(error)
  }
}

function getButtonStyle(user) {
  if (user.isFollowed === true) {
    return {}
  }
  return { border: '1px solid #ff6600' }
}

</script>

<template>
  <div class='sidebarRight'>
    <p class='title'>
      推薦跟隨
    </p>

    <div class='divider' />
    <div
      v-for='user in props.recommendList'
      :key='user.id'
      class='user-row'
    >
      <img
        v-if='user.avatar'
        class='avatar'
        :src='user.avatar'
      >
      <div
        v-else
        class='avatar'
      />
      <div class='user-info'>
        <p class='name'>
          {{ user.name }}
        </p>
        <p class='account'>
          {{ user.account }}
        </p>
      </div>
      <n-button
        :color="user.isFollowed ? '#ff6600' : '#ffffff'"
        round
        size='small'
        strong
        :style='getButtonStyle(user)'
        :text-color="user.isFollowed ? '#ffffff' : '#ff6600'"
        @click='toggleFollow(user)'
      >
        {{ user.isFollowed ? '正在跟隨' : '跟隨' }}
      </n-button>
    </div>
  </div>
</template>

<style scoped>
.sidebarRight {
  width: 25%;
  background-color: #F1F1F5;
  min-height: 10vh;
  height: fit-content;
  margin-top: 8px;
  border-radius: 16px;
  position: sticky;
  top: 8px;
}

.title {
  font-size: 18px;
  font-weight: bold;
  padding-left: 18px;
  padding-bottom: 16px;
  padding-top: 16px;
  color: #000000;
}

.divider {
  border-bottom: 2px solid #E2E2EA;
  margin-bottom: 16px;
}

.user-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  margin-left: 18px;
  margin-right: 18px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #cccccc;
  flex-shrink: 0;
  object-fit: cover;
}

.user-info {
  flex: 1;
}

.name {
  font-size: 14px;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100px;
  color: #000000;
}

.account {
  font-size: 12px;
  color: #888888;
}
</style>

