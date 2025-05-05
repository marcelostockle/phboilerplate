<template>
    <div class="card">
      <Menubar :model="menuItems">
        <!-- IZQUIERDA: Logo y nombre -->
        <template #start>
          <div class="row-flex">
            <img :src="logoUrl" alt="Logo PlanHumano" class="logo" />
            <span class="text-xl font-semibold">
              BOILERPLATE<span class="text-primary"> APP</span>
            </span>
          </div>
        </template>
  
        <!-- DERECHA: Avatar y nombre de usuario -->
        <template #end>
          <div class="row-flex" @click="toggleUserMenu">
            <Avatar :image="user.avatar" shape="circle" size="small" />
            <h3 class="text-sm font-semibold">{{ user.displayName }}</h3>
          </div>
        </template>
      </Menubar>
  
      <!-- Menú flotante del usuario -->
      <Menu ref="userMenuRef" :model="userMenuItems" popup />
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, watch } from 'vue'
  import Menubar from 'primevue/menubar'
  import Menu from 'primevue/menu'
  import Avatar from 'primevue/avatar'
  import { useRouter } from 'vue-router'
  import { getAuth } from 'firebase/auth'
  import dbService from '@/dbService'
  import authService from '@/authService'
  
  const logoUrl = new URL('@/assets/planhumano.png', import.meta.url).href
  const router = useRouter()
  
  const user = ref({
    displayName: 'Usuario',
    avatar: 'https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png',
    role: 'Rol'
  })
  
  // Referencia al menú emergente
  const userMenuRef = ref()
  
  // Ítems del menú principal
  const menuItems = ref([
    {
      label: 'Home',
      icon: 'pi pi-home',
      command: () => router.push('/')
    },
    {
      label: 'Perfil',
      icon: 'pi pi-user',
      command: () => router.push('/profile')
    },
    {
      label: 'Configuración',
      icon: 'pi pi-cog',
      command: () => router.push('/configuracion')
    }
  ])
  
  // Menú de usuario que aparece al hacer clic en avatar
  const userMenuItems = [
    {
      label: 'Perfil',
      icon: 'pi pi-id-card',
      command: () => router.push('/profile')
    },
    {
      separator: true
    },
    {
      label: 'Cerrar sesión',
      icon: 'pi pi-sign-out',
      command: async () => {
        await authService.logout()
        router.push('/login')
      }
    }
  ]
  
  // Mostrar el menú flotante al hacer clic en el avatar
  const toggleUserMenu = (event) => {
    userMenuRef.value.toggle(event)
  }
  
  onMounted(async () => {
    const auth = getAuth()
    const currentUser = auth.currentUser
    if (currentUser) {
      const uid = currentUser.uid
      const res = await dbService.fetchDocument('users', uid)
      if (res.success && res.data) {
        user.value = {
          displayName: res.data.displayName || currentUser.displayName,
          avatar: res.data.avatar || user.value.avatar,
          role: res.data.role || 'Usuario'
        }
      }
    }
  })
  
  // Reconstruir menú si cambia el estado de login
  watch(() => authService.state.isLoggedIn, async () => {
    const auth = getAuth()
    const currentUser = auth.currentUser
    if (currentUser) {
      const uid = currentUser.uid
      const res = await dbService.fetchDocument('users', uid)
      if (res.success && res.data) {
        user.value = {
          displayName: res.data.displayName || currentUser.displayName,
          avatar: res.data.avatar || user.value.avatar,
          role: res.data.role || 'Usuario'
        }
      }
    }
  })
  </script>
  
  <style scoped>
  .card {
    width: 100%;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1000;
    background: white;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .p-menubar {
    width: 100%;
    justify-content: space-between;
    border-radius: 0;
  }
  
  .logo {
    height: 2.5rem;
    object-fit: contain;
  }
  </style>
  