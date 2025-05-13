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
import { initFirebase } from './firebase';

// Importa la configuración de PrimeVue (Dialog, Button, Message, etc.)
import { setupPrimeVue } from './primevue-config';

const startApp = async () => {
  // Aseguramos que Firebase esté inicializado antes de montar la app
  await initFirebase();

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
