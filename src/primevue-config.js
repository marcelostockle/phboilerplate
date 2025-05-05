// primevue-config.js
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';

import Select from 'primevue/select';
import Dropdown from 'primevue/dropdown';
import MultiSelect from 'primevue/multiselect';
import AutoComplete from 'primevue/autocomplete';
import Button from 'primevue/button'; // Agregado para los botones
import ToastService from 'primevue/toastservice';
import Toast from 'primevue/toast';
export function setupPrimeVue(app) {
  app.use(PrimeVue, {
    theme: {
      preset: Aura, // Aura, Material, Lara, Nara
      options: {
        prefix: 'p',
        darkModeSelector: false,
        cssLayer: {
          name: 'primevue',
          order: 'theme, base, primevue'
        }
      }
    }
  });

  // Registro global de componentes de PrimeVue
  //app.component('Select', Select);
  //app.component('Dropdown', Dropdown);
  //app.component('MultiSelect', MultiSelect);
  //app.component('AutoComplete', AutoComplete);
  //app.component('Button', Button);
  //app.component('Toast', Toast);
}
