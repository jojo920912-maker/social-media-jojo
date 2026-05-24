<script setup>
import { NButton } from 'naive-ui'
import { ref, onMounted } from 'vue'
import PostCard from '@/components/PostCard.vue'
import { ArrowBack, CloseOutline, CameraOutline  } from '@vicons/ionicons5'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const user = JSON.parse(localStorage.getItem('user'))
const userId = user.id

const name = ref('')
const introduce = ref('')
const userFollow = ref(0)
const userFollowing = ref(0)
const userCount = ref(0)
const activeTab = ref('tweets')
const posts = ref([])

const editModal = ref(false)
const editName = ref('')
const editIntroduce = ref('')
const coverFile = ref(null)
const avatarFile = ref(null)
const coverPreview = ref('')
const avatarPreview = ref('')
const userAvatar = ref('')
const userCover = ref('')

async function userData() {
  try {
    const { data } = await axios.get(`/api/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    name.value = data.name
    introduce.value = data.introduction
    userFollow.value = data.followingsCount
    userFollowing.value = data.followersCount
    userCount.value = data.tweetsCount
    userAvatar.value = data.avatar?.startsWith('/uploads')
      ? `http://localhost:3000${data.avatar}`
      : data.avatar || ''
    userCover.value = data.banner?.startsWith('/uploads')
      ? `http://localhost:3000${data.banner}`
      : data.banner || ''
  } catch(error) {
    console.error(error)
  }
}

async function userTweets() {
  try {
    const { data } = await axios.get(`/api/users/${userId}/tweets`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    posts.value = data.map((post) => ({
      id: post.id,
      name: post.user.name,
      account: '@' + post.user.account,
      time: post.createdAt,
      content: post.description,
      likes: post.likesCount,
      comments: post.repliesCount,
      avatar: post.user.avatar?.startsWith('/uploads')
        ? `http://localhost:3000${post.user.avatar}`
        : post.user.avatar
    }))
  } catch(error) {
    console.error(error)
  }
}

async function userReplies() {
  try {
    const { data } = await axios.get(`/api/users/${userId}/replied_tweets`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    posts.value = data.map((post) => ({
      id: post.Tweet.id,
      name: post.Tweet.user.name,
      account: '@' + post.Tweet.user.account,
      time: post.replyCreatedAt,
      content: post.comment,
      likes: 0,
      comments: 0,
      replyTo: post.Tweet.user.account,
      avatar: post.Tweet.user.avatar?.startsWith('/uploads')  // ← 加這個判斷
        ? `http://localhost:3000${post.Tweet.user.avatar}`
        : post.Tweet.user.avatar
    }))
  } catch(error) {
    console.error(error)
  }
}

async function userLikes() {
  try {
    const { data } = await axios.get(`/api/users/${userId}/likes`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    posts.value = data
      .filter((post) => post.isLiked === true)
      .map((post) => ({
        id: post.id,
        name: post.user.name,
        account: '@' + post.user.account,
        time: post.createdAt,
        content: post.description,
        likes: post.likesCount,
        comments: post.repliesCount,
        isLiked: post.isLiked,
        avatar: post.user.avatar?.startsWith('/uploads')
          ? `http://localhost:3000${post.user.avatar}`
          : post.user.avatar
      }))
  } catch(error) {
    console.error(error)
  }
}

function switchTab(tab) {
  activeTab.value = tab
  if (tab === 'tweets') userTweets()
  else if (tab === 'replies') userReplies()
  else if (tab === 'likes') userLikes()
}

function openEditModal() {
  editName.value = name.value
  editIntroduce.value = introduce.value
  editModal.value = true
}

function handleCoverChange(event) {
  const file = event.target.files[0]
  if (file) {
    coverFile.value = file
    coverPreview.value = URL.createObjectURL(file)
  }
}

function handleAvatarChange(event) {
  const file = event.target.files[0]
  if (file) {
    avatarFile.value = file
    avatarPreview.value = URL.createObjectURL(file)
  }
}

async function saveProfile() {
  try {
    const formData = new FormData()
    formData.append('name', editName.value)
    formData.append('introduction', editIntroduce.value)
    if (coverFile.value) formData.append('banner', coverFile.value)
    if (avatarFile.value) formData.append('avatar', avatarFile.value)

    await axios.put(`/api/users/${userId}`, formData, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    name.value = editName.value
    introduce.value = editIntroduce.value
    if (coverFile.value) userCover.value = coverPreview.value
    if (avatarFile.value) userAvatar.value = avatarPreview.value
    editModal.value = false
    await userData()
    const updatedUser = JSON.parse(localStorage.getItem('user'))
    updatedUser.avatar = userAvatar.value
    localStorage.setItem('user', JSON.stringify(updatedUser))
    editModal.value = false
    window.location.reload()
  } catch(error) {
    console.error(error)
  }
}

onMounted(() => {
  userData()
  userTweets()
})

defineExpose({
  refreshUser: userData
})

</script>

<template>
  <div class='UserCard'>
    <header class='postTitle'>
      <n-icon
        style='cursor: pointer;'
        @click="router.push('/')"
      >
        <arrow-back />
      </n-icon>
      <div class='userPost'>
        <p class='userPostName'>
          {{ name }}
        </p>
        <p class='userPostCount'>
          {{ userCount }} 推文
        </p>
      </div>
    </header>

    <div
      class='Cover'
      :style='userCover ? `background-image: url(${userCover}); background-size: cover; background-position: center;` : ""'
    />

    <div class='photoAndBtn'>
      <img
        v-if='userAvatar'
        class='photo'
        :src='userAvatar'
      >
      <div
        v-else
        class='photo'
      />
      <div class='btn'>
        <n-button
          color='#ff6600'
          round
          strong
          text-color='#ffffff'
          @click='openEditModal'
        >
          編輯個人資料
        </n-button>
      </div>
    </div>

    <div class='UserName'>
      <p>{{ name }}</p>
    </div>

    <div class='UserIntroduce'>
      <p>{{ introduce }}</p>
    </div>

    <div class='follow'>
      <p
        style='cursor:pointer'
        @click="router.push('/user/follower')"
      >
        {{ userFollow }} 個追隨中
      </p>
      <p
        style='cursor:pointer'
        @click="router.push('/user/follower')"
      >
        {{ userFollowing }} 位追隨者
      </p>
    </div>

    <div class='tab'>
      <p
        :class='{ activeTab: activeTab === "tweets" }'
        @click='switchTab("tweets")'
      >
        推文
      </p>
      <p
        :class='{ activeTab: activeTab === "replies" }'
        @click='switchTab("replies")'
      >
        回覆
      </p>
      <p
        :class='{ activeTab: activeTab === "likes" }'
        @click='switchTab("likes")'
      >
        喜歡的內容
      </p>
    </div>

    <PostCard
      v-for='post in posts'
      :key='post.id'
      :post='post'
      @unliked='userLikes'
    />

    <n-modal v-model:show='editModal'>
      <div class='editModal'>
        <div class='editHeader'>
          <n-icon
            style='cursor:pointer'
            @click='editModal = false'
          >
            <CloseOutline />
          </n-icon>
          <p>編輯個人資料</p>
          <n-button
            color='#ff6600'
            round
            text-color='#ffffff'
            @click='saveProfile'
          >
            儲存
          </n-button>
        </div>

        <div
          class='coverIconsArea'
          :style='coverPreview ? `background-image: url(${coverPreview}); background-size: cover; background-position: center;` : ""'
        >
          <div class='coverArea'>
            <div class='coverIcons'>
              <label class='coverUploadIcon'>
                <n-icon><CameraOutline /></n-icon>
                <input
                  accept='image/*'
                  style='display:none'
                  type='file'
                  @change='handleCoverChange'
                >
              </label>
              <n-icon
                class='coverUploadIcon'
                @click='coverPreview = ""; coverFile = null'
              >
                <CloseOutline />
              </n-icon>
            </div>
          </div>
        </div>

        <div class='avatarArea'>
          <div class='avatarImg'>
            <img
              v-if='avatarPreview || userAvatar'
              :src='avatarPreview || userAvatar'
              style='width:100%; height:100%; border-radius:50%; object-fit:cover;'
            >
            <label class='uploadIcon'>
              <n-icon><CameraOutline /></n-icon>
              <input
                accept='image/*'
                style='display:none'
                type='file'
                @change='handleAvatarChange'
              >
            </label>
          </div>
        </div>

        <div class='editField'>
          <label>名稱</label>
          <input
            v-model='editName'
            maxlength='50'
            type='text'
          >
          <span class='charCount'>{{ editName.length }}/50</span>
        </div>

        <div class='editField'>
          <label>自我介紹</label>
          <textarea
            v-model='editIntroduce'
            maxlength='160'
          />
          <span class='charCount'>{{ editIntroduce.length }}/160</span>
        </div>
      </div>
    </n-modal>
  </div>
</template>

<style scoped>
.UserCard {
  width: 58%;
  overflow-y: auto;
  border-right: 1px solid #eeeeee;
  border-left: 1px solid #eeeeee;
  min-height: 100vh;
}

.postTitle {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 8px;
  margin-top: 16px;
  margin-left: 16px;
}

.postTitle .n-icon {
  font-size: 24px;
  color: #171725;
}

.userPostName {
  font-size: 18px;
  font-weight: bold;
  color: #171725;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  max-width: 200px;
}

.userPostCount {
  font-size: 14px;
  color: #171725;
}

.Cover {
  width: 100%;
  height: 150px;
  background-color: #cccccc;
  border-top: 1px solid #eeeeee;
}

.photoAndBtn {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 0 16px;
  margin-top: -40px;
}

.photo {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #aaaaaa;
  margin: 0 0 16px;
  border: 3px solid #ffffff;
  object-fit: cover;
}

.UserName {
  padding: 8px 16px 0 16px;
  font-size: 18px;
  font-weight: bold;
  color: #171725;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.UserIntroduce {
  padding: 4px 16px;
  font-size: 14px;
  color: #171725;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn {
  display: flex;
  justify-content: flex-end;
  padding: 0px 16px;
}

.follow {
  display: flex;
  gap: 16px;
  padding: 8px 16px;
  font-size: 14px;
  color: #171725;
}

.tab {
  display: flex;
  border-bottom: 2px solid #eeeeee;
  width: 100%;
}

.tab p {
  text-align: center;
  padding: 12px 54px;
  cursor: pointer;
  font-size: 16px;
  white-space: nowrap;
  color: #171725;
}

.tab p.activeTab {
  color: #ff6600;
  border-bottom: 2px solid #ff6600;
}

.editHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
}

.coverIconsArea {
  width: 100%;
  height: 150px;
  background-color: #cccccc;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.coverArea {
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
}

.avatarArea {
  margin-top: -40px;
  margin-left: 16px;
  margin-bottom: 8px;
}

.avatarImg {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #aaaaaa;
  border: 3px solid #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.coverIcons {
  display: flex;
  gap: 16px;
  align-items: center;
  position: relative;
  z-index: 1;
}

.coverUploadIcon {
  cursor: pointer;
  font-size: 20px;
  color: #ffffff;
}

.uploadIcon {
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translate(-50%, -50%);
  font-size: 20px;
  color: #ffffff;
  background: rgba(0,0,0,0.3);
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
}

.editField {
  display: flex;
  flex-direction: column;
  padding: 16px;
  border-bottom: 1px solid #eeeeee;
}

.editField label {
  font-size: 13px;
  color: #888888;
  margin-bottom: 4px;
}

.editField input,
.editField textarea {
  border: none;
  outline: none;
  font-size: 15px;
  resize: none;
}

.editField textarea {
  min-height: 80px;
}

.charCount {
  font-size: 12px;
  color: #888888;
  text-align: right;
  margin-top: 4px;
}
</style>

<style>
.editModal {
  background: #ffffff;
  border-radius: 8px;
  width: 634px;
  overflow: hidden;
  position: fixed;
  top: 76px;
  left: 265px;
}

@media (min-width: 1366px) {
  .editModal {
    left: 308px;
  }
}

@media (min-width: 1440px) {
  .editModal {
    left: 345px;
  }
}

@media (min-width: 1536px) {
  .editModal {
    left: 390px;
  }
}

@media (min-width: 1920px) {
  .editModal {
    left: 585px;
  }
}
</style>
