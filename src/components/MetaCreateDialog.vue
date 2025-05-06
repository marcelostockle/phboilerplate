<script>
import DynamicField from '@/components/DynamicField.vue';
import { Button, Dialog, Toast } from 'primevue';
import { useToast } from 'primevue/usetoast';
import dbService from '@/dbService';

export default {
  name: 'MetaCreateDialog',
  components: { DynamicField, Dialog, Button, Toast },
  props: {
    schemaKey: { type: String, required: true },
    visible: { type: Boolean, required: true },
    pathArray: { type: Array, default: () => [] },
  },
  emits: ['update:visible', 'success'],
  data() {
    return {
      schema: [],
      schemaName: 'Nuevo objeto',
      formData: {},
      toast: useToast(),
    };
  },
  computed: {
    internalVisible: {
      get() { return this.visible; },
      set(val) { this.$emit('update:visible', val); }
    }
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        this.initializeFormData();
      }
    }
  },
  async created() {
    const res = await dbService.fetchDocument('schemata', this.schemaKey);
    if (res.success) {
      this.schema = res.data.schema.filter(field => field.editable !== false);
      this.schemaName = res.data.name || 'Nuevo objeto';
      this.initializeFormData();
    } else {
      this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el esquema.', life: 3000 });
    }
  },
  methods: {
    initializeFormData() {
      this.formData = {};
      this.schema.forEach(field => {
        if (field.type === 'array') {
          this.formData[field.key] = [];
        } else if (field.type === 'object') {
          this.formData[field.key] = {};
        } else {
          this.formData[field.key] = null;
        }
      });
    },
    async submitCreate() {
      try {
        this.formData.createdAt = new Date().toISOString();

        const res = await dbService.createOrUpdateDocument(this.pathArray, this.formData);
        if (res.success) {
          this.$emit('success', this.formData);
          this.internalVisible = false;
          this.toast.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Documento creado correctamente.',
            life: 3000
          });
        } else {
          this.toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo crear el documento.',
            life: 3000
          });
        }
      } catch (err) {
        console.error(err);
        this.toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error inesperado al crear.',
          life: 3000
        });
      }
    }
  }
}
</script>

<template>
  <div>
    <Toast />
    <Dialog v-model:visible="internalVisible" :style="{ minWidth: '30vw' }" modal>
      <template #header>
        <span class="dialog-header">Crear {{ schemaName }}</span>
      </template>

      <DynamicField v-for="field in schema" :key="field.key" :field="field" :modelValue="formData"
        :editable="true" />

      <template #footer>
        <Button label="Cancelar" text severity="secondary" @click="internalVisible = false" autofocus />
        <Button label="Crear" outlined severity="secondary" @click="submitCreate" autofocus />
      </template>
    </Dialog>
  </div>
</template>

<style>
.dialog-header {
  font-weight: 600;
  font-size: 1.25rem;
}
</style>