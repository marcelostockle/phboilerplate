<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center">
    <div class="w-full max-w-4xl">
      <div class="card shadow-md rounded-2xl p-4 bg-white">
        <Menubar :model="menuItems" class="rounded-md text-black" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Menubar from 'primevue/menubar'

const router = useRouter()

const menuItems = ref([
  {
    label: 'Home',
    icon: 'pi pi-home',
    command: () => router.push('/')
  },
  {
    label: 'Login',
    icon: 'pi pi-sign-in',
    command: () => router.push('/login')
  },
  {
    label: 'Sign Up',
    icon: 'pi pi-user-plus',
    command: () => router.push('/signup')
  },
  {
    label: 'New Password',
    icon: 'pi pi-lock',
    command: () => router.push('/newpassword')
  },
  {
    label: 'Chart',
    icon: 'pi pi-chart-line',
    command: () => router.push('/chart')
  },
  {
    label: 'Prompt',
    icon: 'pi pi-comment',
    command: () => router.push('/promt')
  },
  {
    label: 'About',
    icon: 'pi pi-info-circle',
    command: () => router.push('/about')
  },
  {
    label: 'Profile',
    icon: 'pi pi-user',
    command: () => router.push('/profile')
  }
])
</script>

<style scoped>
.card {
  @apply bg-white p-6 rounded-xl shadow-lg;
}
.p-menuitem-text {
  @apply text-black hover:text-blue-600 font-medium;
}
</style>
