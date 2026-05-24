<script setup>
import { computed, ref } from 'vue'
import { NButton } from 'naive-ui'
import axios from 'axios'

const content = ref('')
const showModel = ref(false)
const user = JSON.parse(localStorage.getItem('user'))
const avatar = user.avatar?.startsWith('/uploads')
  ? `http://localhost:3000${user.avatar}`
  : user.avatar

const emit = defineEmits(['postSuccess'])

const props = defineProps({
  userPostsToken: {
    type: String,
    default: ''
  }
})

async function userPost() {
  if(wordEmpty.value) return
  try{
    await axios.post('/api/tweets',
      { description: content.value },
      {
        headers: {
          Authorization: `Bearer ${props.userPostsToken}`
        }
      }
    )
    emit('postSuccess')
    content.value = ''
    showModel.value = false
  }catch(error){
    console.error(error)
  }
}

const wordCount = computed(() => content.value.length)
const wordOverLimit = computed(() => wordCount.value > 140)
const wordEmpty = computed(() => content.value.trim() === '')
</script>

<template>
  <div class='posts'>
    <p class='title'>
      首頁
    </p>

    <div class='input'>
      <img
        v-if='avatar'
        class='avatar'
        :src='avatar'
      >
      <div
        v-else
        class='avatar'
      />
      <input
        v-model='content'
        class='inputWord'
        placeholder='有什麼新鮮事？'
        @click='showModel = true'
      >
    </div>

    <div class='button'>
      <n-button
        color='#ff6600'
        round
        strong
        text-color='#ffffff'
        @click='showModel = true'
      >
        推文
      </n-button>
      <n-modal
        v-model:show='showModel'
        :auto-focus='false'
        transform-origin='center'
      >
        <div class='PostAMessage'>
          <div class='PostHeader'>
            <span @click='showModel = false'>✕</span>
          </div>
          <hr class='divider'>
          <div class='PostInput'>
            <img
              v-if='avatar'
              class='avatar'
              :src='avatar'
            >
            <div
              v-else
              class='avatar'
            />
            <textarea
              v-model='content'
              class='post'
              placeholder='有什麼新鮮事？'
            />
          </div>
          <div class='PostBtn'>
            <span :class="wordOverLimit ? 'errorMsg' : 'wordCount'">{{ wordCount }} / 140</span>
            <span
              v-if='wordOverLimit'
              class='errorMsg'
            >字數不可超過 140 字</span>
            <span
              v-if='wordEmpty'
              class='errorMsg'
            >內容不可空白</span>
            <n-button
              color='#ff6600'
              round
              strong
              text-color='#ffffff'
              @click='userPost'
            >
              推文
            </n-button>
          </div>
        </div>
      </n-modal>
    </div>
  </div>
</template>

<style scoped>
.posts {
  border-bottom: 10px solid #E6ECF0;
  padding: 16px 0 8px 0;
  margin-bottom: 20px;
}

.title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 16px;
  padding-left: 16px;
  padding-bottom: 16px;
  border-bottom: 4px solid #E6ECF0;
  color: #000000;
}

.input {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: 16px;
}

.inputWord {
  flex: 1;
  border: none;
  outline: none;
  font-size: 15px;
  color: #333;
}

.button {
  display: flex;
  justify-content: flex-end;
  margin: 0;
  padding-right: 20px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #cccccc;
  flex-shrink: 0;
  object-fit: cover;
}

.PostHeader {
  display: flex;
  justify-content: flex-start;
  padding-left: 18px;
  font-size: 20px;
  color: #ff6600;
  cursor: pointer;
}

.divider {
  border: none;
  border-top: 1px solid #eeeeee;
}

.post {
  flex: 1;
  border: none;
  outline: none;
  font-size: 15px;
  min-height: 80px;
}

.PostBtn {
  padding: 16px;
  padding-bottom: 16px;
  display: flex;
  justify-content: flex-end;
}

.PostInput{
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 20px;
  padding-left: 10px;
}

.errorMsg {
  font-size: 13px;
  color: #ff6600;
  align-self: center;
  margin-right: 12px;
}

.wordCount {
  font-size: 13px;
  color: #888888;
  align-self: center;
  margin-right: 12px;
}

textarea {
  resize: none;
}
</style>

<style>
.PostAMessage {
  background: #ffffff;
  border-radius: 8px;
  padding: 12px;
  width: 634px;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 60px;
  left: 265px;
}

@media (max-width: 768px) {
  .PostAMessage {
    width: 90vw;
    left: 5vw;
    top: 60px;
  }
}

@media (min-width: 1366px) {
  .PostAMessage {
    left: 308px;
  }
}

@media (min-width: 1440px) {
  .PostAMessage {
    left: 345px;
  }
}

@media (min-width: 1536px) {
  .PostAMessage {
    left: 390px;
  }
}

@media (min-width: 1920px) {
  .PostAMessage {
    left: 580px;
  }
}

</style>
