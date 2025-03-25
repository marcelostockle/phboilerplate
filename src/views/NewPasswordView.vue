<script>
  import authService from '@/authService';
  import router from '@/router';
  import ButtonLarge from '@/components/ButtonLarge.vue';
  import PHHeader from '@/components/PHHeader.vue';

  export default {
    components: { ButtonLarge, PHHeader },
    data() {
      return {
        email: "",
        message: "",
      }
    },
    methods: {
      async submitForm() {
        const response = await authService.resetPassword(this.email);
        if (response.success) {
          router.push({ name: "login" });
        } else {
          this.message = response.message;
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
    <PHHeader>Solicita una nueva contraseña</PHHeader>

    <!-- Form -->
    <form @submit.prevent="submitForm" class="form">
      <div class="form-group">
        <input type="email" id="email" v-model="email" placeholder="Correo Electrónico" required />
      </div>
      <ButtonLarge type="submit">Enviar solicitud</ButtonLarge>
    </form>

    <!-- Message -->
    <p v-if="message" class="message">{{ message }}</p>
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
</style>
