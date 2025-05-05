<script>
import dbService from '@/dbService';
import MetaEditDialog from '@/components/MetaEditDialog.vue';
import MetaCreateDialog from '@/components/MetaCreateDialog.vue';
import Button from 'primevue/button'; 
import ProgressSpinner from 'primevue/progressspinner'; 

export default {
  components: {
    MetaEditDialog,
    MetaCreateDialog,
    Button,            // Incluido si se usa localmente
    ProgressSpinner    // Indicador de carga
  },
  data() {
    return {
      desafios: [],
      selected: null,
      loading: true,
      dVisible: false,
      cVisible: false,
      nuevoDesafio: {}
    };
  },
  computed: {
    pathArray() {
      return this.selected?.id ? ['desafios', this.selected.id] : ['desafios'];
    }
  },
  async mounted() {
    try {
      const res = await dbService.fetchCollection('desafios');
      if (res.success) {
        this.desafios = res.data;
      } else {
        console.error('Error fetching desafios:', res.message);
      }
    } catch (error) {
      console.error('Error fetching desafios:', error);
    } finally {
      this.loading = false;
    }
  },
  methods: {
    selectDesafio(index) {
      this.selected = this.desafios[index];
      this.dVisible = true;
    },
    abrirCrearDesafio() {
      this.nuevoDesafio = {};
      this.cVisible = true;
    },
    actualizarLista(nuevoDoc) {
      const exists = this.desafios.find(d => d.id === nuevoDoc.id);
      if (!exists) {
        this.desafios.push(nuevoDoc);
      } else {
        Object.assign(exists, nuevoDoc); // Opcional: actualizar si ya existe
      }
    }
  }
};
</script>

<template>
  <!-- Dialogos -->
  <MetaEditDialog
    schemaKey="desafios"
    v-model:visible="dVisible"
    v-model:document="selected"
    :pathArray="pathArray"
  />

  <MetaCreateDialog
    schemaKey="desafios"
    v-model:visible="cVisible"
    v-model:document="nuevoDesafio"
    :pathArray="['desafios']"
    @creado="actualizarLista"
  />

  <!-- Vista principal -->
  <div class="desafios-view p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Desafíos</h1>
      <Button
        label="Nuevo desafío"
        icon="pi pi-plus"
        iconPos="left"
        @click="abrirCrearDesafio"
        severity="primary"
        aria-label="Crear un nuevo desafío"
        class="p-button-raised p-button-rounded"
      />
    </div>

    <!-- Cargando -->
    <div v-if="loading" class="flex justify-center items-center py-10">
      <ProgressSpinner style="width: 40px; height: 40px" strokeWidth="4" />
    </div>

    <!-- Lista -->
    <ul v-else class="space-y-2">
      <li
        v-for="(desafio, i) in desafios"
        :key="desafio.id"
        @click="selectDesafio(i)"
        class="p-4 bg-white shadow hover:bg-gray-100 cursor-pointer rounded transition-all"
      >
        {{ desafio.titulo }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
/* Puedes agregar estilos personalizados si deseas */
</style>
