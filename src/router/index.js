import { createRouter, createWebHistory } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

import HomeView from '@/views/HomeView.vue'
import AboutView from '@/views/AboutView.vue'
import LoginView from '@/views/LoginView.vue'
import SignupView from '@/views/SignupView.vue'
import NewPasswordView from '@/views/NewPasswordView.vue'
import ChartView from '@/views/ChartView.vue'
import PromptView from '@/views/PromptView.vue'
import ProfileView from '@/views/ProfileView.vue'
import DesafiosView from '@/views/DesafiosView.vue'

const routes = [
  {
    path: '/',
    component: DefaultLayout,
    children: [
      { path: '', name: 'home', component: HomeView },
      { path: 'about', name: 'about', component: AboutView },
      { path: 'chart', name: 'chart', component: ChartView },
      { path: 'promt', name: 'promt', component: PromptView },
      { path: 'profile', name: 'profile', component: ProfileView },
      { path: 'desafios', name: 'desafios', component: DesafiosView },
    ]
  },
  // Rutas sin layout
  { path: '/login', name: 'login', component: LoginView },
  { path: '/signup', name: 'signup', component: SignupView },
  { path: '/newpassword', name: 'newpassword', component: NewPasswordView },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
