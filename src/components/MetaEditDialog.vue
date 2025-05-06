<script>
import DynamicField from '@/components/DynamicField.vue';
import { Button, Dialog, Toast } from 'primevue';
import { useToast } from 'primevue/usetoast';
import dbService from '@/dbService';

export default {
  name: 'MetaEditDialog',
  components: { DynamicField, Dialog, Button, Toast },
  props: {
    schemaKey: { type: String, required: true },
    document: Object,
    visible: { type: Boolean, required: true },
    pathArray: { type: Array, default: () => [] },
  },
  emits: ['update:visible', 'update:document'],
  data() {
    return {
      schema: [],
      schemaName: 'Objeto',
      formData: {}, // Create editable copy
      toast: useToast(),
    };
  },
  computed: {
    internalDoc: {
      get() { return this.document; },
      set(val) { console.log(val); this.$emit('update:document', val); }
    },
    internalVisible: {
      get() { return this.visible; },
      set(val) { this.$emit('update:visible', val); }
    }
  },
  watch: {
    document: {
      immediate: true,
      handler(newDoc) {
        if (newDoc) {
          this.formData = JSON.parse(JSON.stringify(newDoc)); // Deep copy
        } else {
          console.warn('document is undefined');
          this.formData = {};
        }
      }
    }
  },
  async created() {
    const res = await dbService.fetchDocument('schemata', this.schemaKey);
    if (res.success) {
      this.schema = res.data.schema.map(field => ({
        ...field,
        editable: !['createdAt', 'updatedAt', 'fechaCreacion', 'fechaModificacion'].includes(field.key)
      }));
      this.schemaName = res.data.name;
    } else {
      this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el esquema.', life: 3000 });
    }
  },
  methods: {
    async submitEdit() {
      try {
        const res = await dbService.createOrUpdateDocument(this.pathArray, this.formData);
        if (res.success) {
          this.internalDoc = this.formData;
          this.internalVisible = false;
          this.toast.add({ severity: 'success', summary: 'Éxito', detail: 'Documento guardado correctamente.', life: 3000 });
        } else {
          this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar el documento.', life: 3000 });
        }
      } catch (err) {
        console.error(err);
        this.toast.add({ severity: 'error', summary: 'Error', detail: 'Error inesperado al guardar.', life: 3000 });
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
        <span class="dialog-header">Editar {{ schemaName }}</span>
      </template>

      <DynamicField v-for="field in schema" :key="field.key" :field="field" :modelValue="formData"
        :editable="field.editable" />

      <template #footer>
        <Button label="Cancelar" text severity="secondary" @click="internalVisible = false" autofocus />
        <Button label="Aceptar" outlined severity="secondary" @click="submitEdit" autofocus />
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