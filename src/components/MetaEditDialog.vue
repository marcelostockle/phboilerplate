<template>
  <div>
    <!-- Toast container -->
    <Toast />
    <!-- Diálogo modal de edición -->
    <Dialog v-model:visible="visibleProxy" :style="{ minWidth: '30vw', width: '900px', maxWidth: '90vw'  }" modal>
      <template #header>
        <!-- Título del diálogo con el nombre del esquema -->
        <span class="dialog-header">Editar {{ schemaName }}</span>
      </template>
      <!-- Formulario reactivo con PrimeVue Forms -->
      <Form v-if="schema.length && Object.keys(formData).length" :initial-values="formData" :resolver="resolver"
        @submit="onSubmit" class="p-6">
        <!-- campos base (no-array, no-advanced) -->
        <div class="flex flex-wrap -mx-2">
          <template v-for="f in formFields" :key="f.key">
            <div class="px-2 w-full sm:w-1/2 mb-4 p-2">
              <!-- Campo individual con validación -->
              <FormField :name="f.key" v-slot="{ error }">
                <DynamicField :field="f" :model-value="formData[f.key]" :editable="f.editable"
                  @field-change="onFieldChange" class="w-full p-2" />
                <!-- Mensaje de error si existe -->
                <Message v-if="error" severity="error" size="small">
                  {{ typeof error === 'object' && error.message ? error.message : error }}
                </Message>
              </FormField>
            </div>
          </template>
        </div>

        <!-- Arrays dinámicos: se generan Fieldsets para cada ítem -->
        <div v-for="f in arrayFields" :key="f.key" class="mb-6">
          <label class="font-bold block mb-2">{{ f.label }}</label>
          <!-- Itera cada elemento del array -->
          <div v-for="(item, idx) in formData[f.key]" :key="idx" class="mb-4">
            <Fieldset :legend="`Ítem ${idx + 1}`" toggleable :collapsed="false" class="p-4 border rounded ">
              <!-- Icono personalizado para el toggle -->
              <template #toggleicon="{ collapsed }">
                <i :class="collapsed ? 'pi pi-chevron-right' : 'pi pi-chevron-down'"></i>
              </template>
              <!-- Botones de reordenar y eliminar -->
              <div class="flex justify-end mb-2">
                <Button icon="pi pi-arrow-up" small text @click="moveUp(f.key, idx)" :disabled="idx === 0" />
                <Button icon="pi pi-arrow-down" small text @click="moveDown(f.key, idx)"
                  :disabled="idx === formData[f.key].length - 1" />
                <Button icon="pi pi-trash" small text severity="danger" @click="removeItem(f.key, idx)" />
              </div>
              <!-- Campos internos de cada objeto del array -->
              <div v-for="child in f.children" :key="child.key" class="mb-3">
                <FormField :name="`${f.key}.${idx}.${child.key}`" v-slot="{ error }">
                  <DynamicField :prefix="`${f.key}[${idx}]`" :field="child" :model-value="item[child.key]"
                    :editable="child.editable ?? f.editable" @field-change="onFieldChange" class="w-full p-2" />
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

        <!-- Sección avanzada, colapsable -->
        <Fieldset legend="Opciones avanzadas" toggleable collapsed class="mt-6 p-4">
          <div class="flex flex-wrap -mx-2">
            <template v-for="f in schemaAdvanced" :key="f.key">
              <div class="px-2 w-full sm:w-1/2 mb-4">
                <FormField :name="f.key" v-slot="{ error }">
                  <DynamicField :field="f" :model-value="formData[f.key]" :editable="f.editable"
                    @field-change="onFieldChange" class="w-full p-2" />
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
          <Button type="submit" label="Aceptar" severity="secondary" outlined />
        </div>
      </Form>
      <!-- Mensaje de carga mientras no hay datos/esquema -->
      <div v-else class="p-6 text-center text-gray-500">
        Cargando…
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import {
  ref, watch, computed, onMounted, defineProps, defineEmits
} from 'vue'
import set from 'lodash.set' // Para modificar profundamente objetos
import { useToast } from 'primevue/usetoast' // Para mostrar toasts de feedback
import Toast from 'primevue/toast'  // Componente de notificaciones
import Dialog from 'primevue/dialog' // Diálogo modal
import Button from 'primevue/button' // Botones de PrimeVue
import Fieldset from 'primevue/fieldset' // Fieldset para agrupar campos
import Message from 'primevue/message' // Mensajes de error
import { Form, FormField } from '@primevue/forms' // Formulario reactivo de PrimeVue
import { z } from 'zod' // Zod para validación de esquemas
import { zodResolver } from '@primevue/forms/resolvers/zod' // Resolver de Zod para PrimeVue Forms
import DynamicField from '@/components/DynamicField.vue' // Componente para campos dinámicos
import dbService from '@/dbService' // Servicio para interactuar con la base de datos

// Props esperadas
const props = defineProps({
  schemaKey: { type: String, required: true },
  document: { type: Object, required: true },
  visible: { type: Boolean, required: true },
  pathArray: { type: Array, required: true }
})
// Eventos emitidos
const emit = defineEmits(['update:visible', 'update:document'])
const toast = useToast()

// Estado reactivo
const schema = ref([])
const schemaName = ref('')
const formData = ref({})

// Proxy para mostrar/ocultar diálogo
const visibleProxy = computed({
  get: () => props.visible,
  set: v => emit('update:visible', v)
})

// campos base (no-array, no-advanced)
const formFields = computed(() =>
  schema.value.filter(f => f.type !== 'array' && f.template !== 'advanced')
)
// sólo arrays
const arrayFields = computed(() =>
  schema.value.filter(f => f.type === 'array')
)
// avanzados
const schemaAdvanced = computed(() =>
  schema.value.filter(f => f.template === 'advanced')
)
// Carga inicial de documento
watch(() => props.document, doc => {
  if (!doc) return
  formData.value = JSON.parse(JSON.stringify(doc))
}, { immediate: true })

// Construye el Zod schema dinámico,
// y **solo** aplica nonempty() a los arrays con required=true.
const resolver = computed(() => {
  const shape = {}
  schema.value.forEach(f => {
    let v
    switch (f.type) {
      case 'array':
        // si no es required, lo dejamos opcional sin validar contenido
        if (!f.required) {
          v = z.any().optional()
        } else {
          // required array → nonempty + validación de cada objeto interno
          const childShape = {}
          f.children.forEach(c => {
            let cv = z.string().min(1, { message: `${c.label} es requerido.` })
            if (!c.required) cv = cv.optional()
            childShape[c.key] = cv
          })
          v = z.array(z.object(childShape))
            .nonempty({ message: `${f.label} debe tener al menos un ítem.` })
        }
        break

      case 'number':
        v = z.number({
          required_error: `${f.label} es requerido.`,
          invalid_type_error: `${f.label} debe ser número.`
        })
        if (!f.required) v = v.optional()
        break

      case 'date':
        v = z.preprocess(val => {
          if (typeof val === 'string' || typeof val === 'number') {
            const d = new Date(val)
            return isNaN(d.getTime()) ? val : d
          }
          return val
        }, z.date({
          required_error: `${f.label} es requerido.`,
          invalid_type_error: `${f.label} debe ser fecha.`
        }))
        if (!f.required) v = v.optional()
        break

      default:
        // strings solo obligatorios si f.required===true
        if (f.required) {
          v = z.string().min(1, { message: `${f.label} es requerido.` })
        } else {
          v = z.string().optional()
        }
    }
    shape[f.key] = v
  })

  return zodResolver(z.object(shape))
})
// Actualiza formData en cada cambio de campo
function onFieldChange(path, value) {
  set(formData.value, path, value)
}
// Envío del formulario (submit)
async function onSubmit({ valid }) {
  if (!valid) {
    toast.add({ severity: 'error', summary: 'Error de validación', detail: 'Revisa los campos marcados.' })
    return
  }
  const payload = JSON.parse(JSON.stringify(formData.value))
  const [col] = props.pathArray
  const res = payload.id
    ? await dbService.updateDocument(col, payload.id, payload)
    : await dbService.createOrUpdateDocument(props.pathArray, payload)
  if (res.success) {
    emit('update:document', payload)
    visibleProxy.value = false
    toast.add({ severity: 'success', summary: 'Guardado', detail: 'Se actualizó correctamente.' })
  }
}
// Funciones para manejar arrays dinámicos
function addItem(f) {
  const blank = {}
  f.children.forEach(c => { blank[c.key] = c.type === 'number' ? 0 : '' })
  formData.value[f.key].push(blank)
}
function removeItem(key, i) { formData.value[key].splice(i, 1) }
function moveUp(key, i) { if (i > 0) { const a = formData.value[key];[a[i - 1], a[i]] = [a[i], a[i - 1]] } }
function moveDown(key, i) { const a = formData.value[key]; if (i < a.length - 1) [a[i], a[i + 1]] = [a[i + 1], a[i]] }

// Fetch del esquema al montar el componente
onMounted(async () => {
  const res = await dbService.fetchDocument('schemata', props.schemaKey)
  if (res.success) {
    schema.value = res.data.schema.map(f => ({ ...f, editable: !['createdAt', 'updatedAt'].includes(f.key) }))
    schemaName.value = res.data.name
  }
})
</script>

<style>
.dialog-header {
  font-weight: 600;
  font-size: 1.25rem
}
</style>
