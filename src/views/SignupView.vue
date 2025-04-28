<script>
  import authService from '@/authService';
  import PasswordField from '@/components/PasswordField.vue';
  import router from '@/router';
  import ButtonLarge from '@/components/ButtonLarge.vue';
  import PHHeader from '@/components/PHHeader.vue';

  export default {
    components: { PasswordField, ButtonLarge, PHHeader },
    data() {
      return {
        email: "",
        pw: "",
        confirmPw: "",
        userSession: null,
        message: "",
      }
    },
    methods: {
      async submitForm() {
        if (this.pw !== this.confirmPw) {
          this.message = "Las contraseñas no coinciden.";
          return;
        }
        this.userSession = await authService.registerUser(this.email, this.pw);
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
    <PHHeader>Crea tu cuenta</PHHeader>

    <!-- Form -->
    <form @submit.prevent="submitForm" class="form">
      <div class="form-group">
        <input type="email" id="email" v-model="email" placeholder="Correo Electrónico" required class="wide"/>
        <PasswordField v-model="pw" placeholder="Contraseña" style="margin-top:10px;"/>
        <PasswordField v-model="confirmPw" placeholder="Confirme su contraseña" style="margin-top:10px;"/>
      </div>
      <ButtonLarge type="submit">Registrarse</ButtonLarge>
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
.wide {
  width: 100%;
}
</style>
