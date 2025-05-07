<template>
  <div class="h-screen w-screen flex flex-col items-center justify-center  p-4">
    <div class="w-full max-w-xs bg-gradient-to-b from-blue-900 to-blue-600 rounded-lg shadow-lg p-8">
      <!-- Logo superior -->
      <div class="mb-8">
        <img src="@/assets/logo/planhumano.png" alt="Plan Humano" class="h-40 w-auto mx-auto" />
      </div>

      <!-- Instrucción -->
      <p class="text-center text-white mb-6 font-medium">Crea tu cuenta</p>

      <!-- Formulario -->
      <form @submit.prevent="submitForm" class="space-y-4">
        <!-- Email -->
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

        <!-- Contraseña -->
        <div>
          <label for="password" class="sr-only">Contraseña</label>
          <input
            id="password"
            type="password"
            v-model="pw"
            placeholder="Contraseña"
            required
            class="w-full p-3 rounded-full bg-white text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        <!-- Confirmar Contraseña -->
        <div>
          <label for="confirmPassword" class="sr-only">Confirmar Contraseña</label>
          <input
            id="confirmPassword"
            type="password"
            v-model="confirmPw"
            placeholder="Confirmar Contraseña"
            required
            class="w-full p-3 rounded-full bg-white text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        <!-- Botón de registro -->
        <button
          type="submit"
          class="w-full py-3 bg-blue-900 text-white font-semibold rounded-full hover:bg-blue-800 transition-colors"
        >
          Registrarse
        </button>
      </form>

      <!-- Mensaje de error -->
      <p v-if="message" class="mt-4 text-sm text-red-300 text-center">{{ message }}</p>

      <!-- Enlace a login -->
      <div class="text-center mt-6">
        <RouterLink to="/login" class="text-white underline hover:text-blue-200">
          ¿Ya tienes una cuenta? Inicia Sesión
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
const pw = ref('')
const confirmPw = ref('')
const message = ref('')

const submitForm = async () => {
  if (pw.value !== confirmPw.value) {
    message.value = 'Las contraseñas no coinciden.'
    return
  }
  const res = await authService.registerUser(email.value, pw.value)
  if (res.success) {
    router.push({ name: 'home' })
  } else {
    message.value = res.message
  }
}
</script>

<style scoped>
/* Ocultamos labels pero mantenemos accesibilidad */
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
