<script>
import DynamicField from '@/components/DynamicField.vue';
import { Button, Dialog } from 'primevue';
import dbService from '@/dbService';

export default {
  name: 'MetaEditDialog',
  components: { DynamicField, Dialog, Button },
  props: {
    schemaKey: {
      type: String,
      required: true,
    },
    document,
    visible: {
      type: Boolean,
      required: true,
    },
    pathArray: {
      type: Array,
      default: () => [],
    },
  },
  emits: ['update:visible', 'update:document'],
  computed: {
    internalDoc: {
      get() {
        return this.document;
      },
      set(val) {
        this.$emit('update:document', val);
      }
    },
    internalVisible: {
      get() {
        return this.visible;
      },
      set(val) {
        this.$emit('update:visible', val);
      }
    }
  },
  data() {
    return {
      schema: [],
      schemaName: 'Objeto',
      formData: { }, // Create editable copy
    }
  },
  watch: {
    document: {
      immediate: true,
      handler(newDoc) {
        this.formData = JSON.parse(JSON.stringify(newDoc)); // Deep copy to avoid reference issues
      }
    }
  },
  async created() {
    const res = await dbService.fetchDocument('schemata', this.schemaKey);
    if (res.success) {
      this.schema = res.data.schema;
      this.schemaName = res.data.name;
    } else {
      alert('No se puedo cargar el esquema requerido para mostrar este formulario.');
    }
  },
  methods: {
    submitEdit() {
      dbService.createOrUpdateDocument(this.pathArray, this.formData)
        .then(res => {
          if (res.success) {
            this.internalDoc = res.data;
            this.internalVisible = false;
          } else {
            alert('No se pudo guardar el documento.');
          }
        })
        .catch(err => {
          console.error(err);
          alert('Error al guardar el documento.');
        });
    }
  }
}
</script>

<template>
  <Dialog v-model:visible="internalVisible" :style="{ minWidth: '30vw' }">
    <template #header>
      <span class="dialog-header">Editar {{ schemaName }}</span>
    </template>
    <DynamicField
      v-for="field in schema"
      :key="field.key"
      :field="field"
      :modelValue="formData"
    />
    <template #footer>
      <Button label="Cancelar" text severity="secondary" @click="internalVisible = false" autofocus />
      <Button label="Aceptar" outlined severity="secondary" @click="submitEdit" autofocus />
    </template>
  </Dialog>
</template>

<style>
.dialog-header {
  font-weight: 600;
  font-size: 1.25rem;
}
</style>