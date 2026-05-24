/* eslint-disable no-unused-vars */
import { createRouter, createWebHistory } from 'vue-router'
import Regist from '@/pages/Regist.vue'
import Index from '@/pages/Index.vue'
import Login from '@/pages/Login.vue'
import AdminLogin from '@/pages/AdminLogin.vue'
import UserPages from '@/pages/UserPages.vue'
import AdminPost from '@/pages/AdminPost.vue'
import AdminUser from '@/pages/AdminUser.vue'
import TweetPages from '@/pages/TweetPages.vue'
import Setting from '@/pages/Setting.vue'
import FollowPages from '@/pages/FollowPages.vue'
import NotFoundPages from '@/pages/NotFoundPages.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Index',
      component: Index,
      meta: { requiresAuth: true, role: 'user' }
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
    },
    {
      path: '/admin-login',
      name: 'admin-login',
      component: AdminLogin,
    },
    {
      path: '/admin/posts',
      name: 'AdminPost',
      component: AdminPost,
      meta: { requiresAuth: true, role: 'admin' }
    },
    {
      path: '/admin/users',
      name: 'AdminUser',
      component: AdminUser,
      meta: { requiresAuth: true, role: 'admin' }
    },
    {
      path: '/tweet/:id',
      name: 'TweetPages',
      component: TweetPages,
      meta: { requiresAuth: true, role: 'user' }
    },
    {
      path: '/UserPages',
      name: 'userPages',
      component: UserPages,
      meta: { requiresAuth: true, role: 'user' }
    },
    {
      path: '/user/follower',
      name: 'FollowPages',
      component: FollowPages,
      meta: { requiresAuth: true, role: 'user' }
    },
    {
      path: '/regist',
      name: 'Regist',
      component: Regist,
    },
    {
      path: '/setting',
      name: 'Setting',
      component: Setting,
      meta: { requiresAuth: true, role: 'user' }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: NotFoundPages,
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('@/views/AboutView.vue'),
    },
    {
      path: '/demo',
      name: 'demo',
      component: () => import('@/views/DemoView.vue'),
    },
  ],
})

router.beforeEach(async (to, from) => {
  const token = localStorage.getItem('token') || localStorage.getItem('adminToken')
  const role = localStorage.getItem('role')

  if (to.meta.requiresAuth && !token) {
    return role === 'admin' ? '/admin-login' : '/login'
  }

  if (to.meta.role && to.meta.role !== role) {
    return role === 'admin' ? '/admin/posts' : '/'
  }
})

export default router
