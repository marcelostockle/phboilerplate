<template>
  <div class="fixed inset-x-0 top-0 z-50 bg-white border-b border-gray-200">
    <Menubar :model="menuItems" class="justify-between p-2">
      <template #start>
        <div class="flex items-center space-x-2">
          <img :src="logoUrl" alt="Logo ph" class="h-10 object-contain" />
          <span class="text-xl font-semibold">
            PHBOILERPLATE<span class="text-primary"> APP</span>
          </span>
        </div>
      </template>
      <template #end>
        <div class="flex items-center space-x-2 relative">
          <!-- Campanita de notificaciones -->
          <button
            ref="bellRef"
            @click="toggleNotificationsMenu"
            :aria-label="notificationsEnabled ? 'Desactivar notificaciones' : 'Activar notificaciones'"
            class="flex items-center justify-center w-9 h-9 rounded-full transition-colors hover:bg-gray-200 relative"
            :title="notificationsEnabled ? 'Desactivar notificaciones' : 'Activar notificaciones'"
          >
            <i :class="['pi text-xl transition-colors duration-200', notificationsEnabled ? 'pi-bell text-blue-500' : 'pi-bell-slash text-gray-400']"></i>
            <!-- Badge de notificaciones no leídas -->
            <span v-if="notificationsCount > 0"
              class="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow">
              {{ notificationsCount }}
            </span>
          </button>
          <!-- Dropdown de notificaciones (solo no leídas) -->
          <Menu
            ref="notifMenuRef"
            :model="notificationMenuItems"
            :popup="true"
            class="w-80"
          >
            <template #item="{ item }">
              <div
                v-if="!item.isAction"
                class="flex flex-col py-2 px-2 cursor-pointer hover:bg-gray-100"
                @click="item.onClick"
              >
                <span class="font-semibold text-primary">{{ item.label }}</span>
                <span class="text-xs text-gray-500 truncate">
                  {{ item.body }}
                </span>
                <span class="text-[10px] text-gray-400">
                  {{ item.date }}
                </span>
              </div>
              <div v-else class="flex justify-center py-1">
                <button
                  @click.stop="goToAllNotifications"
                  class="text-blue-600 text-xs font-semibold hover:underline bg-transparent border-none cursor-pointer"
                  style="outline: none;"
                >
                  Ver todas las notificaciones
                </button>
              </div>
            </template>
            <template #empty>
              <div class="px-4 py-3 text-center text-gray-400">No tienes notificaciones</div>
            </template>
          </Menu>
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
import { watch } from 'vue'
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
      logoUrl: new URL('@/assets/planhumano.png', import.meta.url).href,
      notificationsCount: 0,
      notifications: [],
      unsubscribeNotif: null,
      unsubscribeNotifMenu: null,
      router: null,
    }
  },
  computed: {
    user() {
      const u = authService.state.user || {}
      return {
        displayName: u.displayName || 'Invitado',
        avatar: u.avatar || '',
        role: u.role || '',
        id: u.id || ''
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
    },
    notificationMenuItems() {
      // Solo no leídas
      const notRead = this.notifications.filter(n => n.estado === false)
      if (!notRead.length) {
        return [{ label: 'No tienes notificaciones', disabled: true }]
      }
      const items = notRead.slice(0, 10).map(n => {
        const title = n.contenido?.title || 'Sin título'
        const body = n.contenido?.body || 'Sin mensaje'
        const fecha = n.fechaEnviado?.seconds
          ? new Date(n.fechaEnviado.seconds * 1000).toLocaleString()
          : ''
        return {
          label: title,
          body,
          date: fecha,
          unread: true,
          icon: 'pi pi-circle-fill text-blue-400',
          onClick: async () => {
            await this.marcarLeida(n.id)
          }
        }
      })
      // Agrega al final el botón "Ver todas..."
      items.push({
        label: 'Ver todas las notificaciones',
        isAction: true,
        disabled: false,
        command: this.goToAllNotifications
      })
      return items
    }
  },
  created() {
    this.router = useRouter()
    watch(
      () => authService.state.user?.id,
      (newId) => {
        this.unsubscribeNotif && this.unsubscribeNotif()
        this.unsubscribeNotifMenu && this.unsubscribeNotifMenu()
        this.notificationsCount = 0
        this.notifications = []
        if (newId) {
          this.listenToUnreadNotifications(newId)
          this.listenToNotifications(newId)
        }
      },
      { immediate: true }
    )
  },
  async mounted() {
    const notif = localStorage.getItem('notificationsEnabled')
    this.notificationsEnabled = notif === 'true'
    if (this.user.id) {
      this.listenToUnreadNotifications(this.user.id)
      this.listenToNotifications(this.user.id)
    }
  },
  beforeUnmount() {
    this.unsubscribeNotif && this.unsubscribeNotif()
    this.unsubscribeNotifMenu && this.unsubscribeNotifMenu()
  },
  methods: {
    toggleUserMenu(event) {
      this.$refs.userMenuRef?.toggle(event)
    },
    async toggleNotifications() {
      if (!this.notificationsEnabled) {
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
        try {
          await notificationService.deleteCurrentUserToken()
          this.notificationsEnabled = false
          localStorage.setItem('notificationsEnabled', 'false')
          this.notificationsCount = 0
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
    },
    listenToUnreadNotifications(userId) {
      this.unsubscribeNotif = notificationService.subscribeToUnreadNotifications(
        userId,
        count => { this.notificationsCount = count }
      )
    },
    listenToNotifications(userId) {
      this.unsubscribeNotifMenu = notificationService.subscribeToNotifications(
        userId,
        list => { this.notifications = list }
      )
    },
    toggleNotificationsMenu(event) {
      this.$refs.notifMenuRef.toggle(event)
    },
    async marcarLeida(notificationId) {
      if (notificationId && this.user.id) {
        await notificationService.markNotificationAsRead(this.user.id, notificationId)
      }
    },
    goToAllNotifications() {
      this.router.push('/notifications') // Cambia la ruta si tu vista de todas las notificaciones es otra
    }
  }
}
</script>
