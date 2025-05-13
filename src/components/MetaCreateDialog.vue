<template>
  <div>
    <Toast />
    <Dialog v-model:visible="internalVisible" :style="{ minWidth: '30vw' }" modal>
      <template #header>
        <span class="dialog-header">Crear {{ schemaName }}</span>
      </template>

      <Form
        :initialValues="formData"
        :resolver="formResolver"
        @submit="onFormSubmit"
        class="p-6"
      >
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            v-for="field in schemaBase"
            :key="field.key"
            :name="field.key"
            v-slot="$f"
            class="field"
          >
            <label :for="field.key">{{ field.label }}*</label>
            <DynamicField
              :field="field"
              v-model="formData[field.key]"
              :editable="true"
              :id="field.key"
              class="w-full"
              :class="{ 'p-invalid': $f.invalid }"
            />
            <Message v-if="$f.invalid" severity="error" size="small">
              {{ $f.error?.message }}
            </Message>
          </FormField>
        </div>

        <Fieldset legend="Opciones avanzadas" toggleable collapsed class="mt-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              v-for="field in schemaAdvanced"
              :key="field.key"
              :name="field.key"
              v-slot="$f"
              class="field"
            >
              <label :for="field.key">{{ field.label }}*</label>
              <DynamicField
                :field="field"
                v-model="formData[field.key]"
                :editable="true"
                :id="field.key"
                class="w-full"
                :class="{ 'p-invalid': $f.invalid }"
              />
              <Message v-if="$f.invalid" severity="error" size="small">
                {{ $f.error?.message }}
              </Message>
            </FormField>
          </div>
        </Fieldset>

        <div class="flex justify-end gap-2 mt-6">
          <Button label="Cancelar" text severity="secondary" @click="internalVisible = false" />
          <Button type="submit" label="Crear" severity="secondary" outlined />
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
import DynamicField from '@/components/DynamicField.vue';
import dbService from '@/dbService';
import { z } from 'zod';
import { zodResolver } from '@primevue/forms/resolvers/zod';

const props = defineProps({
  schemaKey: { type: String, required: true },
  visible: { type: Boolean, required: true },
  pathArray: { type: Array, default: () => [] },
});
const emit = defineEmits(['update:visible', 'success']);

const toast = useToast();
const schema = ref([]);
const schemaName = ref('Nuevo objeto');
const formData = reactive({});

const internalVisible = computed({
  get: () => props.visible,
  set: v => emit('update:visible', v)
});

const schemaBase = computed(() => schema.value.filter(f => f.template !== 'advanced'));
const schemaAdvanced = computed(() => schema.value.filter(f => f.template === 'advanced'));

watch(
  () => props.visible,
  val => { if (val) initialize(); }
);

const initialize = () => {
  Object.keys(formData).forEach(k => delete formData[k]);
  schema.value.forEach(f => {
    formData[f.key] = f.type === 'array' ? [] : f.type === 'object' ? {} : null;
  });
};

const formResolver = computed(() => {
  const shape = {};
  schema.value.forEach(f => { shape[f.key] = z.string().min(1, { message: `${f.label} es requerido.` }); });
  return zodResolver(z.object(shape));
});

onMounted(async () => {
  const res = await dbService.fetchDocument('schemata', props.schemaKey);
  if (res.success) {
    schema.value = res.data.schema.filter(f => f.editable !== false);
    schemaName.value = res.data.name;
    initialize();
  } else {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el esquema.', life: 3000 });
  }
});

const onFormSubmit = async ({ valid }) => {
  if (!valid) return;
  try {
    formData.createdAt = new Date().toISOString();
    const res = await dbService.createOrUpdateDocument(props.pathArray, JSON.parse(JSON.stringify(formData)));
    if (res.success) {
      emit('success', formData);
      internalVisible.value = false;
      toast.add({ severity: 'success', summary: 'Éxito', detail: 'Documento creado.', life: 3000 });
    } else {
      toast.add({ severity: 'error', summary: 'Error', detail: res.message, life: 3000 });
    }
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: err.message, life: 3000 });
  }
};
</script>

<style>
.dialog-header { font-weight: 600; font-size: 1.25rem; }
.field label { display: block; margin-bottom: 0.25rem; font-weight: 500; }
</style>