<template>
  <div class="min-h-screen flex items-center justify-center p-6">
    <Toast />

    <div class="bg-white rounded-2xl p-8 max-w-lg w-full shadow-lg relative animate-fade-in">
      <!-- Avatar -->
      <div class="relative flex justify-center mb-6">
        <transition name="fade">
          <!-- contenedor circular adaptable -->
          <div v-if="user.avatar" class="w-36 aspect-square overflow-hidden rounded-full border-4 border-white shadow-lg">
            <img
              :src="user.avatar"
              alt="Avatar usuario"
              class="w-full h-full object-cover"
            />
          </div>
          <!-- placeholder icon dentro del mismo contenedor -->
          <div v-else class="w-36 aspect-square flex items-center justify-center rounded-full border-4 border-white shadow-lg bg-gray-100">
            <i class="pi pi-user text-6xl text-gray-400"></i>
          </div>
        </transition>
        <!-- Botón flotante para cambiar foto -->
        <FileUpload
          mode="basic"
          name="avatar"
          accept="image/*"
          customUpload
          :auto="true"
          chooseLabel="Cambiar"
          class="absolute bottom-0 right-0 bg-sky-400 text-gray-200 rounded-full p-2 shadow hover:bg-sky-200 hover:text-gray-500 transition"
          @uploader="handleImageUpload"
          chooseIcon="pi pi-camera"
        />
      </div>

      <!-- Formulario -->
      <form @submit.prevent="updateProfile" class="space-y-4">
        <div>
          <label for="displayName" class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
          <InputText
            id="displayName"
            v-model="user.displayName"
            placeholder="Nombre de usuario"
            class="w-full p-3 rounded-lg text-black bg-gray-100 border border-gray-300 focus:ring-2 focus:ring-black-300"
          />
        </div>

        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
          <InputText
            id="email"
            v-model="user.email"
            disabled
            class="w-full p-3 rounded-lg bg-gray-500 cursor-not-allowed border border-gray-200"
          />
        </div>

        <Button
          label="Guardar Cambios"
          type="submit"
          :loading="loading"
          class="w-full py-3 rounded-full bg-blue-500 text-base font-semibold transform transition hover:scale-105"
        />
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import Toast from 'primevue/toast'
import FileUpload from 'primevue/fileupload'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import { getAuth } from 'firebase/auth'
import dbService from '@/dbService'

const toast = useToast()
const user = ref({ displayName: '', email: '', avatar: '' })
const loading = ref(false)
let userId = null

async function loadUser() {
  const auth = getAuth()
  const currentUser = auth.currentUser
  if (!currentUser) return

  userId = currentUser.uid
  user.value.displayName = currentUser.displayName || ''
  user.value.email = currentUser.email || ''

  const res = await dbService.fetchDocument('users', userId)
  if (res.success && res.data) {
    user.value.avatar = res.data.avatar || ''
    user.value.displayName = res.data.displayName || user.value.displayName
  }
}

async function updateProfile() {
  if (!userId) return
  loading.value = true
  try {
    const data = { displayName: user.value.displayName, avatar: user.value.avatar }
    const res = await dbService.createOrUpdateDocument(['users', userId], data)
    toast.add({ severity: res.success ? 'success' : 'error', summary: res.success ? '¡Éxito!' : 'Error', detail: res.success ? 'Perfil actualizado.' : 'No se pudo actualizar.', life: 3000 })
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Ocurrió un problema.', life: 3000 })
  } finally {
    loading.value = false
  }
}

async function handleImageUpload(event) {
  if (!userId) return
  loading.value = true
  try {
    const file = event.files[0]
    const path = `users/${userId}/avatar.jpg`
    const uploadRes = await dbService.uploadFile(path, file)
    if (!uploadRes.success) throw new Error()

    const urlRes = await dbService.getFileURL(path)
    if (!urlRes.success) throw new Error()

    user.value.avatar = urlRes.url
    await dbService.createOrUpdateDocument(['users', userId], { avatar: urlRes.url })
    toast.add({ severity: 'success', summary: '¡Foto actualizada!', detail: 'Avatar guardado.', life: 3000 })
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo subir la foto.', life: 3000 })
  } finally {
    loading.value = false
  }
}

onMounted(loadUser)
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.5s }
.fade-enter, .fade-leave-to { opacity: 0 }
.animate-fade-in { animation: fadeIn 0.5s ease-out }
@keyframes fadeIn { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: translateY(0) } }
</style>
