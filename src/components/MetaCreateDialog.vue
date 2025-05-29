<template>
  <div>
    <!-- Contenedor para los toasts de PrimeVue -->
    <Toast />

    <!-- Diálogo modal controlado por `visibleProxy` -->
    <Dialog v-model:visible="visibleProxy" :style="{ minWidth: '30vw' }" modal>
      <template #header>
        <!-- Título dinámico según el nombre del schema -->
        <span class="dialog-header">Crear {{ schemaName }}</span>
      </template>

      <!-- Formulario que solo se renderiza cuando ya está cargado el esquema -->
      <Form
        v-if="schema.length"
        :initial-values="formData"
        :resolver="resolver"
        @submit="onSubmit"
        class="p-6"
      >
        <!-- Campos básicos (no-array, no-advanced y sin createdAt) -->
        <div class="flex flex-wrap -mx-2">
          <template v-for="f in formFields" :key="f.key">
            <div class="px-2 w-full sm:w-1/2 mb-4">
              <!-- Cada campo usa FormField para captura de errores -->
              <FormField :name="f.key" v-slot="{ error }">
                <!-- Componente genérico que representa el input -->
                <DynamicField
                  :field="f"
                  :model-value="formData[f.key]"
                  :editable="f.editable"
                  @field-change="onFieldChange"
                  class="w-full p-2"
                />
                <!-- Mensaje de error si lo hay -->
                <Message v-if="error" severity="error" size="small">
                  {{ typeof error === 'object' && error.message ? error.message : error }}
                </Message>
              </FormField>
            </div>
          </template>
        </div>

        <!-- Sección de arrays dinámicos -->
        <div v-for="f in arrayFields" :key="f.key" class="mb-6">
          <label class="font-bold block mb-2">{{ f.label }}</label>
          <div v-for="(item, idx) in formData[f.key]" :key="idx" class="mb-4">
            <!-- Cada ítem del array va dentro de un Fieldset colapsable -->
            <Fieldset
              :legend="`Ítem ${idx + 1}`"
              toggleable
              :collapsed="false"
              class="p-4 border rounded"
            >
              <!-- Icono personalizado para expandir/colapsar -->
              <template #toggleicon="{ collapsed }">
                <i :class="collapsed ? 'pi pi-chevron-right' : 'pi pi-chevron-down'"></i>
              </template>

              <!-- Botones para reordenar o eliminar ítems -->
              <div class="flex justify-end mb-2">
                <Button
                  icon="pi pi-arrow-up"
                  small
                  text
                  @click="moveUp(f.key, idx)"
                  :disabled="idx === 0"
                />
                <Button
                  icon="pi pi-arrow-down"
                  small
                  text
                  @click="moveDown(f.key, idx)"
                  :disabled="idx === formData[f.key].length - 1"
                />
                <Button
                  icon="pi pi-trash"
                  small
                  text
                  severity="danger"
                  @click="removeItem(f.key, idx)"
                />
              </div>

              <!-- Campos internos del objeto del array -->
              <div v-for="child in f.children" :key="child.key" class="mb-3">
                <FormField :name="`${f.key}.${idx}.${child.key}`" v-slot="{ error }">
                  <DynamicField
                    :prefix="`${f.key}[${idx}]`"
                    :field="child"
                    :model-value="item[child.key]"
                    :editable="child.editable ?? f.editable"
                    @field-change="onFieldChange"
                    class="w-full p-2"
                  />
                  <Message v-if="error" severity="error" size="small">
                    {{ typeof error === 'object' && error.message ? error.message : error }}
                  </Message>
                </FormField>
              </div>
            </Fieldset>
          </div>

          <!-- Botón para agregar un nuevo ítem al array -->
          <Button icon="pi pi-plus" label="Agregar ítem" class="mt-2" @click="addItem(f)" />
        </div>

        <!-- Sección de campos avanzados (template = 'advanced') -->
        <Fieldset legend="Opciones avanzadas" toggleable collapsed class="mt-6 p-4">
          <div class="flex flex-wrap -mx-2">
            <template v-for="f in schemaAdvanced" :key="f.key">
              <div class="px-2 w-full sm:w-1/2 mb-4">
                <FormField :name="f.key" v-slot="{ error }">
                  <DynamicField
                    :field="f"
                    :model-value="formData[f.key]"
                    :editable="f.editable"
                    @field-change="onFieldChange"
                    class="w-full p-2"
                  />
                  <Message v-if="error" severity="error" size="small">
                    {{ typeof error === 'object' && error.message ? error.message : error }}
                  </Message>
                </FormField>
              </div>
            </template>
          </div>
        </Fieldset>

        <!-- Botones de acción del formulario -->
        <div class="flex justify-end gap-2 mt-6">
          <Button label="Cancelar" text severity="secondary" @click="visibleProxy = false" />
          <Button type="submit" label="Crear" severity="secondary" outlined />
        </div>
      </Form>

      <!-- Mensaje de carga mientras se obtiene el esquema -->
      <div v-else class="p-6 text-center text-gray-500">
        Cargando…
      </div>
    </Dialog>
  </div>
</template>

<script setup>
// Importaciones de Vue y utilidades
import {
  ref, watch, computed, onMounted, defineProps, defineEmits
} from 'vue'
import set from 'lodash.set'

// PrimeVue
import { useToast } from 'primevue/usetoast'
import Toast from 'primevue/toast'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Fieldset from 'primevue/fieldset'
import Message from 'primevue/message'

// PrimeVue Forms y Zod
import { Form, FormField } from '@primevue/forms'
import { z } from 'zod'
import { zodResolver } from '@primevue/forms/resolvers/zod'

// Componente dinámico y servicio de DB
import DynamicField from '@/components/DynamicField.vue'
import dbService from '@/dbService'

// Props y eventos
const props = defineProps({
  schemaKey: { type: String, required: true },
  visible:   { type: Boolean, required: true },
  pathArray: { type: Array,   required: true }
})
const emit  = defineEmits(['update:visible','create:document'])
const toast = useToast()

// Estado reactivo
const schema     = ref([]) // Esquema cargado desde Firestore
const schemaName = ref('') // Nombre legible del esquema
const formData   = ref({}) // Valores del formulario

// Proxy para abrir/cerrar el diálogo desde parent
const visibleProxy = computed({
  get: () => props.visible,
  set: v  => emit('update:visible', v)
})

// Filtra los campos base (excluye arrays, createdAt y advanced)
const formFields = computed(() =>
  schema.value.filter(f => f.type !== 'array' && f.key !== 'createdAt' && f.template!=='advanced')
)
const arrayFields    = computed(() => schema.value.filter(f => f.type === 'array'))
const schemaAdvanced = computed(() => schema.value.filter(f => f.template === 'advanced'))

// Inicializa formData cuando está disponible el esquema
watch(formFields, () => {
  const obj = {}
  schema.value.forEach(f => {
    obj[f.key] = f.type === 'array' ? [] : ''
  })
  formData.value = obj
}, { immediate: true })

// Construye dinámicamente el Zod schema para validación
const resolver = computed(() => {
  const shape = {}
  schema.value.forEach(f => {
    let v
    switch (f.type) {
      case 'array':
        if (f.required) {
          // required array → nonempty + validar cada objeto hijo
          const childShape = {}
          f.children.forEach(c => {
            let cv = z.string().min(1, { message: `${c.label} es requerido.` })
            if (!c.required) cv = cv.optional()
            childShape[c.key] = cv
          })
          v = z.array(z.object(childShape))
                .nonempty({ message: `${f.label} debe tener al menos un ítem.` })
        } else {
          // no requerido → opcional sin contenido
          v = z.array(z.object({})).optional()
        }
        break

      case 'number':
        v = z.number({
          required_error:     `${f.label} es requerido.`,
          invalid_type_error: `${f.label} debe ser número.`
        })
        if (!f.required) v = v.optional()
        break

      case 'date':
        // createdAt se asigna internamente, no hay input de usuario
        v = z.date().optional()
        break

      default:
        // strings: solo obligatorios si f.required===true
        v = f.required
          ? z.string().min(1, { message: `${f.label} es requerido.` })
          : z.string().optional()
    }
    shape[f.key] = v
  })
  return zodResolver(z.object(shape))
})

// Maneja cambios en cualquier campo (vectorizado por lodash.set)
function onFieldChange(path, value) {
  set(formData.value, path, value)
}

// Envío del formulario
async function onSubmit({ valid }) {
  if (!valid) {
    toast.add({ severity:'error', summary:'Error de validación', detail:'Revisa los campos.' })
    return
  }
  // Asigna la fecha de creación justo antes de guardar
  formData.value.createdAt = new Date()

  const payload = JSON.parse(JSON.stringify(formData.value))
  const [col]   = props.pathArray
  const res     = await dbService.createOrUpdateDocument(props.pathArray, payload)
  if (res.success) {
    emit('create:document', payload)
    visibleProxy.value = false
    toast.add({ severity:'success', summary:'Creado', detail:'Se creó correctamente.' })
  }
}

// Funciones para manipular arrays dinámicos
function addItem(f) {
  const blank = {}
  f.children.forEach(c => { blank[c.key] = c.type==='number' ? 0 : '' })
  formData.value[f.key].push(blank)
}
function removeItem(key, i)    { formData.value[key].splice(i, 1) }
function moveUp(key, i)        { if (i>0) { const a=formData.value[key]; [a[i-1],a[i]]=[a[i],a[i-1]] } }
function moveDown(key, i)      { const a=formData.value[key]; if (i<a.length-1) [a[i],a[i+1]]=[a[i+1],a[i]] }

// Al montar, carga el schema desde Firestore
onMounted(async () => {
  const res = await dbService.fetchDocument('schemata', props.schemaKey)
  if (res.success) {
    schema.value     = res.data.schema.map(f => ({
      ...f,
      editable: !['createdAt','updatedAt'].includes(f.key)
    }))
    schemaName.value = res.data.name
  }
})
</script>

<style>
.dialog-header {
  font-weight: 600;
  font-size: 1.25rem;
}
</style>
