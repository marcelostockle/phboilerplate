<template>
  <div class="profile-screen flex items-center justify-center min-h-screen bg-gradient-to-tr from-pink-400 to-pink-300 p-6">
    <Toast />

    <div class="profile-card animate-fade-in relative">
      
      <!-- Avatar -->
      <div class="avatar-container relative">
        <transition name="fade">
          <Avatar
            v-if="editableUser.avatar"
            :image="editableUser.avatar"
            shape="circle"
            class="avatar-custom border-4 border-white shadow-lg"
          />
          <Avatar
            v-else
            icon="pi pi-user"
            shape="circle"
            class="avatar-custom border-4 border-white shadow-lg text-gray-400 bg-gray-100"
          />
        </transition>

        <!-- Botón flotante para cambiar foto -->
        <div class="camera-button absolute bottom-0 right-0">
          <FileUpload
            mode="basic"
            name="avatar"
            accept="image/*"
            customUpload
            :auto="true"
            chooseLabel=""
            class="p-button-rounded p-button-primary p-button-sm p-2"
            @uploader="handleImageUpload"
            :chooseIcon="'pi pi-camera'"
          />
        </div>
      </div>

      <!-- Formulario -->
      <form class="form" @submit.prevent="updateProfile">
        <div class="form-group">
          <label for="displayName" class="label">Nombre</label>
          <InputText 
            id="displayName"
            v-model="editableUser.displayName"
            placeholder="Nombre de usuario"
            class="w-full p-3 rounded-lg"
          />
        </div>

        <div class="form-group">
          <label for="email" class="label">Correo Electrónico</label>
          <InputText 
            id="email"
            v-model="editableUser.email"
            placeholder="Correo Electrónico"
            class="w-full p-3 rounded-lg bg-gray-100 cursor-not-allowed"
            disabled
          />
        </div>

        <Button 
          label="Guardar Cambios" 
          type="submit"
          class="w-full mt-4 p-button-success p-button-rounded font-semibold text-base transition-all hover:scale-105"
          :loading="loading"
        />
      </form>

    </div>

  </div>
</template>

<script>
import Fieldset from 'primevue/fieldset';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Avatar from 'primevue/avatar';
import FileUpload from 'primevue/fileupload';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';

import { getAuth } from 'firebase/auth';
import dbService from '@/dbService'; // Ajusta la ruta si es necesario

export default {
  components: { Fieldset, Button, InputText, Avatar, FileUpload, Toast },
  data() {
    return {
      editableUser: { displayName: '', email: '', avatar: '' },
      userId: '',
      loading: false,
      toast: null
    };
  },
  mounted() {
    this.toast = useToast();
    this.loadUserData();
  },
  methods: {
    async loadUserData() {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (currentUser) {
        this.userId = currentUser.uid;
        this.editableUser.displayName = currentUser.displayName || '';
        this.editableUser.email = currentUser.email || '';

        const response = await dbService.fetchDocument('users', this.userId);
        if (response.success && response.data) {
          if (response.data.avatar) {
            this.editableUser.avatar = response.data.avatar;
          }
          if (response.data.displayName) {
            this.editableUser.displayName = response.data.displayName;
          }
        }
      }
    },
    async updateProfile() {
      if (!this.userId) return;
      this.loading = true;
      try {
        const updateData = { 
          displayName: this.editableUser.displayName, 
          avatar: this.editableUser.avatar 
        };
        const res = await dbService.createOrUpdateDocument(['users', this.userId], updateData);
        if (res.success) {
          this.toast.add({ severity: 'success', summary: 'Éxito', detail: 'Perfil actualizado.', life: 3000 });
        } else {
          this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar.', life: 3000 });
        }
      } catch (error) {
        console.error(error);
        this.toast.add({ severity: 'error', summary: 'Error', detail: 'Ocurrió un problema.', life: 3000 });
      } finally {
        this.loading = false;
      }
    },
    async handleImageUpload(event) {
      const file = event.files?.[0];
      if (!file || !this.userId) return;
      this.loading = true;
      try {
        const path = `users/${this.userId}/avatar.jpg`;
        const uploadRes = await dbService.uploadFile(path, file);
        if (!uploadRes.success) throw new Error('Error al subir imagen');

        const urlRes = await dbService.getFileURL(path);
        if (!urlRes.success) throw new Error('Error al obtener URL de imagen');

        this.editableUser.avatar = urlRes.url;
        await dbService.createOrUpdateDocument(['users', this.userId], { avatar: urlRes.url });

        this.toast.add({ severity: 'success', summary: 'Foto Actualizada', detail: 'Tu avatar fue actualizado.', life: 3000 });
      } catch (error) {
        console.error(error);
        this.toast.add({ severity: 'error', summary: 'Error', detail: 'Error al subir la foto.', life: 3000 });
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
/* Animación de fade */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}

/* Animación general de fade-in */
.animate-fade-in {
  animation: fadeIn 0.7s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}



.profile-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 40px 30px;
  width: 100%;
  max-width: 600px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  text-align: center;
  position: relative;
}

.avatar-container {
  margin-bottom: 20px;
  position: relative;
  display: inline-block;
}

.avatar-custom {
  width: 150px;
  height: 150px;
  font-size: 3rem;
  object-fit: cover;
}

/* Botón flotante */
.camera-button {
  bottom: 0;
  right: 0;
}

/* Formulario */
.form {
  width: 100%;
}

.form-group {
  text-align: left;
  margin-bottom: 20px;
}

.label {
  font-size: 0.9rem;
  color: #6b7280;
  margin-bottom: 8px;
  display: block;
}

/* Botón primario */
.p-button {
  transition: transform 0.3s ease, background-color 0.3s ease;
}

.p-button:hover {
  transform: scale(1.05);
}
</style>
