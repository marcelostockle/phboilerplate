// main.js

// Estilos globales
import './assets/main.css';            // Tus estilos principales
import 'primeicons/primeicons.css';    // Íconos de Prime
import '@/assets/tailwind.css';        // Tailwind CSS

// PrimeVue Services & Forms
import ToastService from 'primevue/toastservice';      // Servicio de Toasts
import { Form, FormField } from '@primevue/forms';     // Forms API

// Core de Vue
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

// Inicialización de Firebase
import { initFirebase } from './firebase/firebase'; // Asegúrate de que la ruta sea correcta
import authService from './services/authService'
import notificationService from './services/notificationService'

// Importa la configuración de PrimeVue (Dialog, Button, Message, etc.)
import { setupPrimeVue } from './primevue-config';

// Registro del Service Worker para Firebase Messaging
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/firebase-messaging-sw.js')
    .then((registration) => {
      console.log('Service Worker registered', registration);
    })
    .catch((err) => {
      console.error('Service Worker registration failed', err);
    });
}

const startApp = async () => {

  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('Service Worker registrado correctamente');
    } catch (e) {
      console.error('Error al registrar Service Worker:', e);
    }
  }

  // Aseguramos que Firebase esté inicializado antes de montar la app
  await initFirebase();
  await authService.ensureAuthReady()
  if (authService.state.isLoggedIn) {
    notificationService.requestPermissionAndSaveToken().catch(e => console.error('FCM', e))
  }

  const app = createApp(App);

  // Router
  app.use(router);

  // PrimeVue toast service
  app.use(ToastService);

  // PrimeVue Forms API
  // Registra el plugin para que <Form> y <FormField> funcionen
  app.component(Form);
  app.component(FormField);

  // Configuración adicional de PrimeVue (componentes globales)
  setupPrimeVue(app);

  // Montamos la aplicación en #app
  app.mount('#app');
};

startApp();
