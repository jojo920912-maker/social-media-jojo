<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import LeftSidebar from '@/components/LeftSidebar.vue'
import RightSidebar from '@/components/RightSidebar.vue'
import axios from 'axios'
import router from '@/router'
import { ArrowBack, CloseOutline, ChatbubbleOutline, HeartOutline, Heart } from '@vicons/ionicons5'
import { postsTime } from '@/utils/Time.js'

const route = useRoute()
const tweet = ref(null)
const reply = ref([])
const recommendList = ref([])
const replyContent = ref('')
const replyModal = ref(false)
const replySubmitted = ref(false)
const replyOverLimit = computed(() => replyContent.value.length > 140)
const liked = ref(false)
const likesCount = ref(0)

const user = JSON.parse(localStorage.getItem('user'))

const userAvatar = user.avatar?.startsWith('/uploads')
  ? `http://localhost:3000${user.avatar}`
  : user.avatar

async function getTweet() {
  try {
    const { data } = await axios.get(`/api/tweets/${route.params.id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    tweet.value = data
    liked.value = data.isLiked ?? false
    likesCount.value = data.likesCount ?? 0
  } catch(error) {
    console.error(error)
  }
}

async function getReply() {
  try{
    const { data } = await axios.get(`/api/tweets/${route.params.id}/replies`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    reply.value = data
  }catch(error){
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

function back(){
  router.back()
}

async function submitReply() {
  replySubmitted.value = true
  if (replyContent.value.trim() === '' || replyOverLimit.value) return
  try{
    await axios.post(`/api/tweets/${route.params.id}/replies`,
      { comment: replyContent.value },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    )
    replyContent.value = ''
    replyModal.value = false
    replySubmitted.value = false
    getReply()
    getTweet()
  }catch(error){
    console.error(error)
  }
}

async function toggleLike() {
  try {
    if (liked.value) {
      await axios.post(`/api/tweets/${route.params.id}/unlike`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      liked.value = false
      likesCount.value--
    } else {
      await axios.post(`/api/tweets/${route.params.id}/like`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      liked.value = true
      likesCount.value++
    }
  } catch(error) {
    console.error(error)
  }
}

onMounted(() => {
  getTweet()
  getReply()
  getRecommendList()
})
</script>

<template>
  <div class='tweetPages'>
    <LeftSidebar />
    <div class='content'>
      <div class='header'>
        <n-icon
          class='back'
          @click='back'
        >
          <ArrowBack />
        </n-icon>
        <p class='title'>
          推文
        </p>
      </div>

      <div
        v-if='tweet'
        class='tweet'
      >
        <div class='tweetUser'>
          <img
            v-if='tweet.user.avatar'
            class='avatar'
            :src='tweet.user.avatar?.startsWith("/uploads") ? `http://localhost:3000${tweet.user.avatar}` : tweet.user.avatar'
          >
          <div
            v-else
            class='avatar'
          />
          <div>
            <p class='name'>
              {{ tweet.user.name }}
            </p>
            <p class='account'>
              @{{ tweet.user.account }}
            </p>
          </div>
        </div>
        <p class='tweetContent'>
          {{ tweet.description }}
        </p>
        <p class='tweetTime'>
          {{ postsTime(tweet.createdAt) }}
        </p>
        <div class='tweetStats'>
          <span>{{ tweet.repliesCount }} 回覆</span>
          <span>{{ likesCount }} 喜歡</span>
        </div>
      </div>

      <div class='tweetActions'>
        <n-icon
          style='cursor: pointer;'
          @click='replyModal = true'
        >
          <ChatbubbleOutline />
        </n-icon>
        <n-icon
          :color="liked ? '#e0245e' : ''"
          style='cursor: pointer;'
          @click='toggleLike'
        >
          <HeartOutline v-if='!liked' />
          <Heart v-else />
        </n-icon>
      </div>

      <n-modal v-model:show='replyModal'>
        <div class='replyModal'>
          <div class='modalHeader'>
            <n-icon @click='replyModal = false'>
              <CloseOutline />
            </n-icon>
          </div>

          <div
            v-if='tweet'
            class='originalTweet'
          >
            <div class='tweetUserWithLine'>
              <div class='leftLine'>
                <div class='avatar' />
                <div class='verticalLine' />
              </div>
              <div>
                <p class='name'>
                  {{ tweet.user.name }}
                </p>
                <p class='account'>
                  @{{ tweet.user.account }}
                </p>
                <p>{{ tweet.description }}</p>
                <p class='reply'>
                  回覆給 <span class='mention'>@{{ tweet.user.account }}</span>
                </p>
              </div>
            </div>
          </div>
          <div class='replyInputArea'>
            <img
              v-if='userAvatar'
              class='avatar'
              :src='userAvatar'
            >
            <div
              v-else
              class='avatar'
            />
            <textarea
              v-model='replyContent'
              class='replyText'
              placeholder='推你的回覆'
            />
          </div>

          <div class='replyBtnArea'>
            <span
              v-if='replySubmitted && replyOverLimit'
              class='errorMsg'
            >字數不可超過 140 字</span>
            <span
              v-else-if='replySubmitted && replyContent.trim() === ""'
              class='errorMsg'
            >內容不可空白</span>
            <n-button
              color='#ff6600'
              round
              text-color='#ffffff'
              @click='submitReply'
            >
              回覆
            </n-button>
          </div>
        </div>
      </n-modal>

      <div
        v-for='replies in reply'
        :key='replies.id'
        class='replyCard'
      >
        <img
          v-if='replies.user.avatar'
          class='avatar'
          :src='replies.user.avatar?.startsWith("/uploads") ? `http://localhost:3000${replies.user.avatar}` : replies.user.avatar'
        >
        <div
          v-else
          class='avatar'
        />
        <div>
          <div class='replyUser'>
            <p class='name'>
              {{ replies.user.name }}
            </p>
            <p class='account'>
              @{{ replies.user.account }}
            </p>
          </div>
          <p class='replyToUser'>
            回覆 <span class='mention'>@{{ tweet.user.account }}</span>
          </p>
          <p>{{ replies.comment }}</p>
        </div>
      </div>
    </div>
    <RightSidebar :recommend-list='recommendList' />
  </div>
</template>

<style scoped>
.tweetPages {
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
  padding: 16px;
}

.header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  padding-top: 0;
  border-bottom: 1px solid #eeeeee;
}

.back {
  cursor: pointer;
  font-size: 20px;
}

.title {
  font-size: 18px;
  font-weight: bold;
}

.tweet {
  padding: 16px;
  border-bottom: 1px solid #eeeeee;
}

.tweetUser {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #cccccc;
  flex-shrink: 0;
  object-fit: cover;
}

.name {
  font-weight: bold;
  font-size: 14px;
}

.account {
  font-size: 13px;
  color: #888888;
}

.tweetContent {
  font-size: 16px;
  margin-bottom: 8px;
  word-break: break-all;
}

.tweetTime {
  font-size: 13px;
  color: #888888;
  margin-bottom: 8px;
}

.tweetStats {
  display: flex;
  gap: 16px;
  font-size: 14px;
  border-top: 1px solid #eeeeee;
  padding-top: 8px;
}

.tweetActions {
  display: flex;
  gap: 24px;
  padding: 8px 16px;
  border-bottom: 1px solid #eeeeee;
  font-size: 20px;
}

.replyCard {
  display: flex;
  gap: 10px;
  padding: 16px;
  border-bottom: 1px solid #eeeeee;
}

.replyModal {
  background: #ffffff;
  border-radius: 8px;
  padding: 20px;
  width: 634px;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-right: 500px;
  margin-top: 60px;
}

.modalHeader {
  display: flex;
  justify-content: flex-start;
  cursor: pointer;
  font-size: 20px;
}

.reply{
  font-size: 13px;
  color: #888888;
  margin-top: 8px;
}

.replyInputArea {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.replyBtnArea {
  display: flex;
  justify-content: flex-end;
}

.replyInputArea input {
  border: none;
  outline: none;
  flex: 1;
  font-size: 15px;
}

.replyText{
  border: none;
  outline: none;
  flex: 1;
  font-size: 15px;
  resize: none;
  min-height: 120px;
  width: 100%;
}

.replyUser{
  display: flex;
  align-items: center;
  gap: 8px;
}

.replyToUser{
  font-size: 13px;
  color: #888888;
  margin-bottom: 4px;
}

.tweetUserWithLine {
  display: flex;
  gap: 10px;
}

.mention {
  color: #ff6600;
  cursor: pointer;
}

.leftLine {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.verticalLine {
  width: 2px;
  flex: 1;
  min-height: 100px;
  background-color: #B5B5BE;
  margin-top: 8px;
}

.errorMsg {
  font-size: 13px;
  color: #ff6600;
  align-self: center;
  margin-right: 12px;
}
</style>
