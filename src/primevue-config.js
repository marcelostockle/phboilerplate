// primevue-config.js
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';

import Select from 'primevue/select';
import Dropdown from 'primevue/dropdown';
import MultiSelect from 'primevue/multiselect';
import AutoComplete from 'primevue/autocomplete';

export function setupPrimeVue(app) {
  app.use(PrimeVue, {
    theme: {
      preset: Aura, //Aura, Material, Lara, Nara
      options: {
        prefix: 'p',
        darkModeSelector: false,
        cssLayer: false
      }
    }
  });

  // Registro global de componentes de PrimeVue
  app.component('Select', Select);
  app.component('Dropdown', Dropdown);
  app.component('MultiSelect', MultiSelect);
  app.component('AutoComplete', AutoComplete);
}
