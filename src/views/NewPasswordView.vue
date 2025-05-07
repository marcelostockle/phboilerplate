<template>
  <div class="h-screen w-screen flex flex-col items-center justify-center p-4">
    <div class="w-full max-w-xs bg-gradient-to-b from-blue-900 to-blue-600 rounded-lg shadow-lg p-8">
      <!-- Logo superior -->
      <div class="mb-8">
        <img src="@/assets/logo/planhumano.png" alt="Plan Humano" class="h-40 w-auto mx-auto" />
      </div>

      <!-- Instrucción -->
      <p class="text-center text-white mb-6 font-medium">Solicita una nueva contraseña</p>

      <!-- Formulario -->
      <form @submit.prevent="submitForm" class="space-y-4">
        <div>
          <label for="email" class="sr-only">Correo Electrónico</label>
          <input
            id="email"
            type="email"
            v-model="email"
            placeholder="Correo Electrónico"
            required
            class="w-full p-3 rounded-full bg-white text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>
        <button
          type="submit"
          class="w-full py-3 bg-blue-900 text-white font-semibold rounded-full hover:bg-blue-800 transition-colors"
        >
          Enviar solicitud
        </button>
      </form>

      <!-- Mensaje de resultado -->
      <p v-if="message" class="mt-4 text-sm text-red-300 text-center">{{ message }}</p>

      <!-- Enlace a login -->
      <div class="text-center mt-6">
        <RouterLink to="/login" class="text-white underline hover:text-blue-200">
          Volver al inicio
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import authService from '@/authService'

const router = useRouter()
const email = ref('')
const message = ref('')

const submitForm = async () => {
  const res = await authService.resetPassword(email.value)
  if (res.success) {
    router.push({ name: 'login' })
  } else {
    message.value = res.message
  }
}
</script>

<style scoped>
/* Ocultamos labels, pero los dejamos accesibles para lectores de pantalla */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0,0,0,0);
  white-space: nowrap;
  border: 0;
}
</style>