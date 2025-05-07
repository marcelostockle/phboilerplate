<template>
  <div class="fixed inset-x-0 top-0 z-50 bg-white border-b border-gray-200">
    <Menubar :model="menuItems" class="justify-between p-2">
      <!-- IZQUIERDA: Logo y nombre -->
      <template #start>
        <div class="flex items-center space-x-2">
          <img :src="logoUrl" alt="Logo PlanHumano" class="h-10 object-contain" />
          <span class="text-xl font-semibold">
            BOILERPLATE<span class="text-primary"> APP</span>
          </span>
        </div>
      </template>

      <!-- DERECHA: Avatar y nombre de usuario -->
      <template #end>
        <button
          @click="toggleUserMenu"
          aria-label="Abrir menú de usuario"
          class="flex items-center space-x-2 hover:bg-gray-200 hover:text-gray-800 rounded p-1 transition-colors duration-200 focus:outline-none"
        >
          <!-- Avatar circular adaptable -->
          <div class="w-10 aspect-square overflow-hidden rounded-full">
            <img
              :src="user.avatar || defaultAvatar"
              alt="Avatar usuario"
              class="w-full h-full object-cover"
            />
          </div>
          <div class="text-left">
            <p class="text-sm font-semibold">{{ user.displayName }}</p>
            <p class="text-xs text-gray-500" v-if="user.role">{{ user.role }}</p>
          </div>
        </button>
      </template>
    </Menubar>

    <!-- Menú flotante del usuario -->
    <Menu
      ref="userMenuRef"
      :model="userMenuItems"
      popup
      class="mt-2"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import Menubar from 'primevue/menubar'
import Menu from 'primevue/menu'
import Avatar from 'primevue/avatar'
import authService from '@/authService'

const router = useRouter()
const userMenuRef = ref(null)
const defaultAvatar = 'https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png'
const logoUrl = new URL('@/assets/planhumano.png', import.meta.url).href
// Usuario reactivo desde authService
const user = computed(() => {
  const u = authService.state.user || {}
  return {
    displayName: u.displayName || 'Invitado',
    avatar: u.avatar || '',
    role: u.role || ''
  }
})

// Items principales
const menuItems = computed(() => [
  { label: 'Home', icon: 'pi pi-home', command: () => router.push('/') },
  { label: 'Perfil', icon: 'pi pi-user', command: () => router.push('/profile') },
  { label: 'Configuración', icon: 'pi pi-cog', command: () => router.push('/configuracion') }
])

// Menú de usuario
const userMenuItems = computed(() => [
  { label: 'Mi perfil', icon: 'pi pi-id-card', command: () => router.push('/profile') },
  { separator: true },
  {
    label: 'Cerrar sesión',
    icon: 'pi pi-sign-out',
    command: async () => {
      await authService.logout()
      router.push('/login')
    }
  }
])

function toggleUserMenu(event) {
  userMenuRef.value?.toggle(event)
}
</script>

<style scoped>
/* La barra ya está estilizada con Tailwind helpers */
</style>
