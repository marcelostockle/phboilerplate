<script>
import authService from '@/authService';
import router from '@/router';
import { RouterLink } from 'vue-router';
import PasswordField from '@/components/PasswordField.vue';
import ButtonLarge from '@/components/ButtonLarge.vue';
import PHHeader from '@/components/PHHeader.vue';

export default {
  components: { PasswordField, ButtonLarge, PHHeader, RouterLink },
  data() {
    return {
      email: "",
      message: "",
      pw: "",
      userSession: null,
    }
  },
  methods: {
    async submitForm() {
      this.userSession = await authService.loginUser(this.email, this.pw);
      if (this.userSession.success) {
        router.push({ name: "home" });
      } else {
        this.message = this.userSession.message;
      }
    },
    validateEmail(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    },
  },
}
</script>

<template>
  <div class="login-screen">
    <!-- Header -->
    <PHHeader>Entra con tu correo registrado</PHHeader>

    <!-- Form -->
    <form @submit.prevent="submitForm" class="form">
      <div class="form-group">
        <input type="email" id="email" v-model="email" placeholder="Correo Electrónico" required class="wide"/>
        <PasswordField v-model="pw" placeholder="Contraseña" style="margin-top:10px;"/>
      </div>
      <ButtonLarge type="submit">Iniciar Sesión</ButtonLarge>
    </form>

    <!-- Message -->
    <p v-if="message" class="message">{{ message }}</p>

    <!-- Links -->
    <div class="links">
      <RouterLink to="/newpassword">¿Olvidaste tu contraseña?</RouterLink>
      <RouterLink to="/signup">¿Nuevo en Plan DO? Regístrate</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.login-screen {
  height: 100vh;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: Arial, sans-serif;
  padding: 20px;
  text-align: center;
}

.form {
  width: 100%;
  max-width: 400px;
}

.form-group {
  margin-bottom: 20px;
}

.message {
  margin-top: 20px;
  font-size: 1rem;
}

.links {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
.wide {
  width: 100%;
}
</style>
