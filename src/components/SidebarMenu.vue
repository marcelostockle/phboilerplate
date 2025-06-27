<template>
  <div class="fixed inset-x-0 top-0 z-50 bg-white border-b border-gray-200">
    <Menubar :model="menuItems" class="justify-between p-2">
      <template #start>
        <div class="flex items-center space-x-2">
          <img :src="logoUrl" alt="Logo Hex" class="h-10 object-contain" />
          <span class="text-xl font-semibold">
            PSICOHEX<span class="text-primary"> APP</span>
          </span>
        </div>
      </template>
      <template #end>
        <div class="flex items-center space-x-2">
          <!-- Campanita de notificaciones -->
          <button
            @click="toggleNotifications"
            :aria-label="notificationsEnabled ? 'Desactivar notificaciones' : 'Activar notificaciones'"
            class="flex items-center justify-center w-9 h-9 rounded-full transition-colors hover:bg-gray-200"
            :title="notificationsEnabled ? 'Desactivar notificaciones' : 'Activar notificaciones'"
          >
            <i
              :class="[
                'pi text-xl transition-colors duration-200',
                notificationsEnabled ? 'pi-bell text-blue-500' : 'pi-bell-slash text-gray-400'
              ]"
            ></i>
          </button>
          <!-- Menú de usuario -->
          <button
            @click="toggleUserMenu"
            aria-label="Abrir menú de usuario"
            class="flex items-center space-x-2 hover:bg-gray-200 hover:text-gray-800 rounded p-1 transition-colors duration-200 focus:outline-none"
          >
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
        </div>
      </template>
    </Menubar>
    <Menu ref="userMenuRef" :model="userMenuItems" popup class="mt-2" />
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Menubar from 'primevue/menubar'
import Menu from 'primevue/menu'
import authService from '@/services/authService.js'
import notificationService from '@/services/notificationService'

export default {
  name: 'SidebarMenu',
  components: { Menubar, Menu },
  data() {
    return {
      notificationsEnabled: false,
      defaultAvatar: 'https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png',
      logoUrl: new URL('@/assets/logoHex.png', import.meta.url).href,
      userMenuRef: null, // Lo usaremos como ref
    }
  },
  computed: {
    user() {
      const u = authService.state.user || {}
      return {
        displayName: u.displayName || 'Invitado',
        avatar: u.avatar || '',
        role: u.role || ''
      }
    },
    menuItems() {
      return [
        { label: 'Home', icon: 'pi pi-home', command: () => this.router.push('/') },
        { label: 'Pacientes', icon: 'pi pi-users', command: () => this.router.push('/patients') },
        { label: 'Citas', icon: 'pi pi-calendar', command: () => this.router.push('/appointments') },
        { label: 'Facturación', icon: 'pi pi-dollar', command: () => this.router.push('/billing') },
        { label: 'Reportes', icon: 'pi pi-chart-bar', command: () => this.router.push('/reports') },
        { label: 'Mensajes', icon: 'pi pi-envelope', command: () => this.router.push('/message') },
        { separator: true },
        { label: 'Configuración', icon: 'pi pi-cog', command: () => this.router.push('/settings') },
        { label: 'Ayuda', icon: 'pi pi-question-circle', command: () => this.router.push('/help') }
      ]
    },
    userMenuItems() {
      return [
        { label: 'Mi perfil', icon: 'pi pi-id-card', command: () => this.router.push('/profile') },
        { separator: true },
        {
          label: 'Cerrar sesión',
          icon: 'pi pi-sign-out',
          command: async () => {
            await authService.logoutUser()
            this.router.push('/login')
          }
        }
      ]
    }
  },
  created() {
    this.router = useRouter()
  },
  mounted() {
    // Sincroniza con localStorage
    const notif = localStorage.getItem('notificationsEnabled')
    this.notificationsEnabled = notif === 'true'
  },
  methods: {
    toggleUserMenu(event) {
      // Si tienes Menu como ref con string
      this.$refs.userMenuRef?.toggle(event)
    },
    async toggleNotifications() {
      if (!this.notificationsEnabled) {
        // ACTIVAR
        try {
          await notificationService.requestPermissionAndSaveToken()
          this.notificationsEnabled = true
          localStorage.setItem('notificationsEnabled', 'true')
          this.$toast?.add?.({
            severity: 'success',
            summary: 'Activado',
            detail: 'Notificaciones activadas'
          })
        } catch (e) {
          this.notificationsEnabled = false
          localStorage.setItem('notificationsEnabled', 'false')
          this.$toast?.add?.({
            severity: 'error',
            summary: 'Permiso denegado',
            detail: e.message || 'No se pudo activar notificaciones'
          })
        }
      } else {
        // DESACTIVAR
        try {
          await notificationService.deleteCurrentUserToken()
          this.notificationsEnabled = false
          localStorage.setItem('notificationsEnabled', 'false')
          this.$toast?.add?.({
            severity: 'info',
            summary: 'Desactivado',
            detail: 'Notificaciones desactivadas y token eliminado'
          })
        } catch (e) {
          this.$toast?.add?.({
            severity: 'warn',
            summary: 'Advertencia',
            detail: e.message || 'No se pudo eliminar el token del servidor'
          })
        }
      }
    }
  }
}
</script>
