import './assets/main.css';

import { createApp } from 'vue'
import App from './App.vue';
import router from './router';
import { initFirebase } from "./firebase";

const startApp = async () => {
  await initFirebase(); // Ensure Firebase is initialized before app starts
  const app = createApp(App);
  app.use(router);
  app.mount("#app");
};

startApp();