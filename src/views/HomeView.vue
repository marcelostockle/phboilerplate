<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center">
    <div class="w-full max-w-4xl">
      <div class="card shadow-md rounded-2xl p-4 bg-white">
        <Menubar :model="menuItems" class="rounded-md text-black" />
      </div>
    </div>
  </div>
  <div class="bg-white text-black p-4">
    ¡Tailwind funciona!
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import Menubar from 'primevue/menubar'
import authService from '@/authService' // ⚡ Asegúrate que el import sea correcto según tu ruta

const router = useRouter()

const menuItems = ref([])

// Función para construir el menú dinámicamente
const buildMenu = () => {
  const items = [
    { label: 'Home', icon: 'pi pi-home', command: () => router.push('/') },
    { label: 'Login', icon: 'pi pi-sign-in', command: () => router.push('/login') },
    { label: 'Sign Up', icon: 'pi pi-user-plus', command: () => router.push('/signup') },
    { label: 'New Password', icon: 'pi pi-lock', command: () => router.push('/newpassword') },
    { label: 'Chart', icon: 'pi pi-chart-line', command: () => router.push('/chart') },
    { label: 'Prompt', icon: 'pi pi-comment', command: () => router.push('/promt') },
    { label: 'About', icon: 'pi pi-info-circle', command: () => router.push('/about') },
    { label: 'Profile', icon: 'pi pi-user', command: () => router.push('/profile') }
  ]

  if (authService.state.isLoggedIn) {
    // Si está logueado, agregamos opción de "Cerrar sesión"
    items.push({
      label: 'Cerrar Sesión',
      icon: 'pi pi-sign-out',
      command: async () => {
        await authService.logoutUser()
        router.push('/login') // Redirigir a login después de logout
      }
    })
  }

  menuItems.value = items
}

// Inicializar menú al cargar
buildMenu()

// Actualizar menú si cambia el estado de login
watch(() => authService.state.isLoggedIn, () => {
  buildMenu()
})
</script>

<style scoped>
.card {
  @apply bg-white p-6 rounded-xl shadow-lg;
}
.p-menuitem-text {
  @apply text-black hover:text-blue-600 font-medium;
}
</style>
