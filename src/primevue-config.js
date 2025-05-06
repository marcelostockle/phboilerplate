// primevue-config.js
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';


export function setupPrimeVue(app) {
  app.use(PrimeVue, {
    theme: {
      preset: Aura, // Aura, Material, Lara, Nara
      options: {
        prefix: 'p',
        darkModeSelector: false,
        cssLayer: true
      }
    }
  });

}
