<script setup>
import { ref, onMounted  } from 'vue'
import axios from 'axios'
import PostList from '@/components/PostList.vue'
import leftSideBar from '@/components/LeftSidebar.vue'
import rightSidebar from '@/components/RightSidebar.vue'

const token = localStorage.getItem('token')

const posts = ref([])

async function postsApi() {
  try{

    const dataApi = await axios.get('/api/tweets', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    posts.value = dataApi.data.map((post) => ({
      id: post.id,
      name: post.user.name,
      account: '@' + post.user.account,
      content: post.description,
      likes: post.likesCount,
      comments: post.repliesCount,
      time: post.createdAt,
      isLiked: post.isLiked,
      avatar: post.user.avatar?.startsWith('/uploads')
        ? `http://localhost:3000${post.user.avatar}`
        : post.user.avatar
    }))
  }catch(error){
    console.error(error)
  }
}

onMounted(() => {
  postsApi()
})

const recommendList = ref([])

async function RightSideBarAuthApi() {
  try {

    const RightSideBarApiResponse = await axios.get('/api/users/top',{
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })

    recommendList.value = RightSideBarApiResponse.data.map((responses) => ({
      id: responses.id,
      name: responses.name,
      account: '@' + responses.account,
      avatar: responses.avatar?.startsWith('/uploads')
        ? `http://localhost:3000${responses.avatar}`
        : responses.avatar,
      introduction: responses.introduction,
      followersCount: responses.followersCount,
      isFollowed: responses.isFollowed
    }))

  }catch(error){
    console.error(error)
  }
}

onMounted(() => {
  RightSideBarAuthApi()
})

</script>

<template>
  <div class='indexPages'>
    <leftSideBar />
    <PostList
      :posts='posts'
      :token='token'
      @post-success='postsApi'
    />
    <rightSidebar :recommend-list='recommendList' />
  </div>
</template>

<style scoped>

.indexPages {
  display: flex;
  width: 1100px;
  margin: 0 auto;
  min-height: 100vh;
  justify-content: space-between;
}

</style>
