import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import SignupView from '@/views/SignupView.vue'
import NewPasswordView from '@/views/NewPasswordView.vue'
import ChartView from '@/views/ChartView.vue'
import PromptView from '@/views/PromptView.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/signup',
      name: 'signup',
      component: SignupView,
    },
    {
      path: '/newpassword',
      name: 'newpassword',
      component: NewPasswordView,
    },
    {
      path: '/chart',
      name: 'chart',
      component: ChartView,
    },
    {
      path: '/promt',
      name: 'promt',
      component: PromptView,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
  ],
})

export default router
