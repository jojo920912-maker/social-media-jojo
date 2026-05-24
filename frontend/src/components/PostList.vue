<script setup>
import PostCard from '@/components/PostCard.vue'
import PostInput from '@/components/PostInput.vue'

defineProps({
  posts: {
    type: Array,
    default: () => []
  },
  token: {
    type: String,
    default: ''
  }
})

defineEmits(['postSuccess'])
</script>

<template>
  <div class='postPages'>
    <PostInput
      :user-posts-token='token'
      @post-success='$emit("postSuccess")'
    />
    <PostCard
      v-for='post in posts'
      :key='post.id'
      :post='post'
    />
  </div>
</template>

<style scoped>

.postPages{
  width: 58%;
  overflow-y: auto;
  border-left: 1px solid #eeeeee;
  border-right: 1px solid #eeeeee;
}

</style>
