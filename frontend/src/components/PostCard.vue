<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ChatbubbleOutline, HeartOutline, Heart } from '@vicons/ionicons5'
import { NIcon } from 'naive-ui'
import axios from 'axios'
import { postsTime } from '@/utils/Time.js'

const props = defineProps({
  post: {
    type: Object,
    required: true,
  }
})

const emit = defineEmits(['unliked'])

const router = useRouter()

const isLiked = ref(props.post.isLiked ?? false)
const likesCount = ref(props.post.likes ?? 0)

function goToTweet() {
  router.push(`/tweet/${props.post.id}`)
}

watch(() => props.post.isLiked, (newVal) => {
  isLiked.value = newVal ?? false
})

watch(() => props.post.likes, (newVal) => {
  likesCount.value = newVal ?? 0
})

async function toggleLike() {
  try {
    if (isLiked.value) {
      await axios.post(`/api/tweets/${props.post.id}/unlike`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      isLiked.value = false
      likesCount.value --
      emit('unliked')
    } else {
      await axios.post(`/api/tweets/${props.post.id}/like`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      isLiked.value = true
      likesCount.value ++
    }
  } catch(error) {
    console.error(error)
  }
}

</script>

<template>
  <div class='postCards'>
    <div class='userHeader'>
      <img
        v-if='post.avatar'
        class='avatar'
        :src='post.avatar'
      >
      <div
        v-else
        class='avatar'
      />
      <div class='user'>
        <span>{{ post.name }}</span>
        <span>{{ post.account }}</span>
        <span>{{ postsTime(post.time) }}</span>
      </div>
    </div>
    <p
      v-if='post.replyTo'
      class='replyTo'
    >
      回覆 <span class='mention'>@{{ post.replyTo }}</span>
    </p>

    <div
      class='post'
      @click='goToTweet'
    >
      <p>{{ post.content }}</p>
    </div>

    <div class='postActions'>
      <span @click.stop='goToTweet'>
        <n-icon><ChatbubbleOutline /></n-icon>
        {{ post.comments }}</span>
      <span @click.stop='toggleLike'>
        <n-icon :color="isLiked ? '#e0245e' : ''">
          <HeartOutline v-if='!isLiked' />
          <Heart v-else />
        </n-icon>
        {{ likesCount }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.postCards {
  border-bottom: 1px solid #eeeeee
}

.userHeader {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  margin-left: 16px;
  margin-top: 8px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #cccccc;
  flex-shrink: 0;
  object-fit: cover;
}

.user {
  display: flex;
  gap: 6px;
  align-items: center;
  font-size: 13px;
  color: #888888;
}

.post {
  margin-bottom: 8px;
  font-size: 14px;
  line-height: 1.5;
  padding-left: 50px;
  word-break: break-all;
  color: black;
}

.postActions {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #888888;
  padding-left: 50px;
  padding-bottom: 12px;
}

.replyTo {
  font-size: 13px;
  color: #888888;
  padding-left: 50px;
  margin-bottom: 4px;
}

.mention {
  color: #ff6600;
}

</style>

