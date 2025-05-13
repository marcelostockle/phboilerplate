<template>
  <div>
    <Toast />

    <Dialog v-model:visible="internalVisible" :style="{ minWidth: '30vw' }" modal>
      <template #header>
        <span class="dialog-header">Editar {{ schemaName }}</span>
      </template>

      <Form
        :key="formKey"
        :initialValues="formData"
        :resolver="formResolver"
        @submit="onFormSubmit"
        class="p-6"
      >
        <!-- Grid principal: 2 columnas en sm+ con separación uniforme -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          <!-- Creado (solo lectura) -->
          <div class="field mb-4">
            <label for="createdAt" class="block text-sm font-medium text-gray-700 mb-1">Creado</label>
            <DatePicker
              id="createdAt"
              v-model="formData.createdAt"
              showIcon
              disabled
              class="w-full"
              dateFormat="yy-mm-dd"
            />
          </div>

          <!-- Título -->
          <FormField name="titulo" v-slot="$f" class="field mb-4">
            <label for="titulo" class="block text-sm font-medium text-gray-700 mb-1">Título*</label>
            <DynamicField
              :field="schemaBase.find(f => f.key === 'titulo')"
              v-model="formData.titulo"
              :editable="true"
              :id="'titulo'"
              class="w-full"
              :class="{ 'p-invalid': $f.invalid }"
            />
            <Message v-if="$f.invalid" severity="error" size="small">{{ $f.error?.message }}</Message>
          </FormField>

          <!-- Instrucciones (ocupa dos columnas) -->
          <FormField
            name="instrucciones"
            v-slot="$f"
            class="field mb-4 sm:col-span-2"
          >
            <label for="instrucciones" class="block text-sm font-medium text-gray-700 mb-1">Instrucciones*</label>
            <Textarea
              id="instrucciones"
              v-model="formData.instrucciones"
              rows="4"
              class="w-full"
              :class="{ 'p-invalid': $f.invalid }"
            />
            <Message v-if="$f.invalid" severity="error" size="small">{{ $f.error?.message }}</Message>
          </FormField>
        </div>

        <!-- Sección de Opciones avanzadas -->
        <Fieldset legend="Opciones avanzadas" toggleable collapsed class="mt-6 p-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <FormField
              v-for="field in schemaAdvanced"
              :key="field.key"
              :name="field.key"
              v-slot="$f"
              class="field mb-4"
            >
              <label :for="field.key" class="block text-sm font-medium text-gray-700 mb-1">
                {{ field.label }}*
              </label>
              <DynamicField
                :field="field"
                v-model="formData[field.key]"
                :editable="field.editable"
                :id="field.key"
                class="w-full"
                :class="{ 'p-invalid': $f.invalid }"
              />
              <Message v-if="$f.invalid" severity="error" size="small">{{ $f.error?.message }}</Message>
            </FormField>
          </div>
        </Fieldset>

        <!-- Botones de acción -->
        <div class="flex justify-end gap-2 mt-6">
          <Button label="Cancelar" text severity="secondary" @click="internalVisible = false" />
          <Button type="submit" label="Aceptar" severity="secondary" outlined />
        </div>
      </Form>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { Form, FormField } from '@primevue/forms';
import Message from 'primevue/message';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Fieldset from 'primevue/fieldset';
import Toast from 'primevue/toast';
import DatePicker from 'primevue/datepicker';
import Textarea from 'primevue/textarea';
import DynamicField from '@/components/DynamicField.vue';
import dbService from '@/dbService';
import { z } from 'zod';
import { zodResolver } from '@primevue/forms/resolvers/zod';

// Props & emits
const props = defineProps({
  schemaKey: { type: String, required: true },
  document: Object,
  visible: { type: Boolean, required: true },
  pathArray: { type: Array, default: () => [] }
});
const emit = defineEmits(['update:visible', 'update:document']);

// Estado local
const toast = useToast();
const schema = ref([]);
const schemaName = ref('Objeto');
const formData = reactive({});
const formKey = ref(0);

const internalVisible = computed({
  get: () => props.visible,
  set: v => emit('update:visible', v)
});
const internalDoc = computed({
  get: () => props.document,
  set: v => emit('update:document', v)
});

const schemaBase = computed(() => schema.value.filter(f => f.template !== 'advanced'));
const schemaAdvanced = computed(() => schema.value.filter(f => f.template === 'advanced'));

// Reconstruye formData al cambiar document y convierte fechas
watch(() => props.document, doc => {
  if (doc) {
    Object.keys(formData).forEach(k => delete formData[k]);
    Object.assign(formData, JSON.parse(JSON.stringify(doc)));
    schema.value.forEach(f => {
      if (f.type === 'date' && formData[f.key]) {
        formData[f.key] = new Date(formData[f.key]);
      }
    });
    formKey.value++;
  }
}, { immediate: true });

// Resolver Zod adaptado a tipos
const formResolver = computed(() => {
  const shape = {};
  schema.value.forEach(f => {
    if (f.type === 'date') {
      shape[f.key] = z.date({ required_error: `${f.label} es requerido.`, invalid_type_error: `${f.label} debe ser una fecha válida.` });
    }
    else if (f.type === 'number') {
      shape[f.key] = z.number({ required_error: `${f.label} es requerido.`, invalid_type_error: `${f.label} debe ser un número.` });
    }
    else {
      shape[f.key] = z.string({ required_error: `${f.label} es requerido.` }).min(1, { message: `${f.label} es requerido.` });
    }
  });
  return zodResolver(z.object(shape));
});

// Carga esquema onMount
onMounted(async () => {
  const res = await dbService.fetchDocument('schemata', props.schemaKey);
  if (res.success) {
    schema.value = res.data.schema.map(field => ({
      ...field,
      editable: !['createdAt', 'updatedAt'].includes(field.key)
    }));
    schemaName.value = res.data.name;
  } else {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el esquema.', life: 3000 });
  }
});

// Manejo de envío
const onFormSubmit = async ({ valid }) => {
  if (!valid) return;
  try {
    const payload = JSON.parse(JSON.stringify(formData));
    if (payload.id) {
      const [collectionName] = props.pathArray;
      const res = await dbService.updateDocument(collectionName, payload.id, payload);
      if (res.success) {
        internalDoc.value = payload;
        internalVisible.value = false;
        toast.add({ severity: 'success', summary: 'Éxito', detail: 'Documento actualizado.', life: 3000 });
      } else {
        toast.add({ severity: 'error', summary: 'Error', detail: res.message || res.code, life: 3000 });
      }
    } else {
      const res = await dbService.createOrUpdateDocument(props.pathArray, payload);
      if (res.success) {
        payload.id = res.id;
        internalDoc.value = payload;
        internalVisible.value = false;
        toast.add({ severity: 'success', summary: 'Éxito', detail: 'Documento creado.', life: 3000 });
      } else {
        toast.add({ severity: 'error', summary: 'Error', detail: res.message || res.code, life: 3000 });
      }
    }
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: `Error inesperado: ${err.message}`, life: 3000 });
  }
};
</script>

<style>
.dialog-header { font-weight: 600; font-size: 1.25rem; }
.field label { display: block; margin-bottom: 0.25rem; font-weight: 500; }
</style>