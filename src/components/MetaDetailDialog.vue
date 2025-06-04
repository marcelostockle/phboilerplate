<template>
  <div>
    <Toast />

    <!-- Dialog principal con ancho fijo y responsivo -->
    <Dialog v-model:visible="visibleProxy" :style="{ minWidth: '30vw', width: '900px', maxWidth: '90vw' }" modal>
      <!-- Imagen tipo banner en la parte superior -->
      <div v-if="getBannerUrl" class="w-full h-48 overflow-hidden rounded-t-xl mb-4">
        <img :src="getBannerUrl" alt="Banner" class="w-full h-full object-cover" />
      </div>

      <!-- Título del diálogo solo si hay contenido visible -->
      <template #header v-if="hayContenidoVisible">
        <span class="dialog-header">Detalle de {{ schemaName }}</span>
      </template>

      <!-- Mensaje si no hay documento seleccionado -->
      <div v-if="!document" class="p-6 text-center text-gray-500">
        Debes seleccionar un elemento para ver su detalle.
      </div>

      <!-- Contenido principal cuando hay documento -->
      <div v-else class="p-6 space-y-6">
        <!-- Sección de foto y títulos -->
        <div v-if="hasVisibleFields(headerSinBanner)" class="flex items-center justify-between mb-4">
          <div class="flex items-center justify-between">
            <div class="flex-1 flex space-x-4 items-center">
              <!-- Imagen tipo "title-photo" -->
              <div v-if="hasVisibleFields(groups['title-photo'])" class="flex-shrink-0">
                <template v-for="f in sortedBySorting(groups['title-photo'])" :key="f.key">
                  <div v-if="getValue(f.key)" class="flex flex-col max-w-xs">
                    <img v-if="esImagen(getValue(f.key))" :src="getValue(f.key)" alt="Imagen"
                      class="rounded shadow max-w-full max-h-40 object-contain mt-1" />
                    <span v-else class="text-base break-all mt-1">{{ getValue(f.key) }}</span>
                  </div>
                </template>
              </div>

              <!-- Títulos en columna: supertitle, title, subtitle -->
              <div class="flex flex-col">
                <template v-for="block in ['supertitle', 'title', 'subtitle']" :key="block">
                  <div v-if="hasVisibleFields(groups[block])" class="mb-1">
                    <template v-for="f in sortedBySorting(groups[block])" :key="f.key">
                      <div v-if="getValue(f.key)">
                        <span class="block font-medium text-lg" :class="{
                          'text-blue-400 text-xl': block === 'supertitle',
                          'text-black text-md': block === 'title',
                          'text-gray-500 text-xs': block === 'subtitle'
                        }">
                          {{ getValue(f.key) }}
                        </span>
                      </div>
                    </template>
                  </div>
                </template>
              </div>

            </div>
          </div>

          <!-- Botones de editar y eliminar -->
          <div class="flex gap-2">
            <Button icon="pi pi-pencil" text severity="warning" @click="emitEdit()" />
            <Button icon="pi pi-trash" text severity="danger" @click="emitDelete()" />
          </div>
        </div>

        <!-- Sección de campos simples -->
        <div v-if="hasVisibleFields(groups.fields)"
          class="grid grid-cols-2 gap-4 mb-4 bg-gray-100 p-4 rounded-lg shadow">
          <template v-for="f in sortedBySorting(groups.fields)" :key="f.key">
            <div v-if="getValue(f.key)" class="flex flex-col">
              <label class="font-semibold text-sm">{{ f.label }}</label>
              <span class="text-base">{{ getValue(f.key) }}</span>
            </div>
          </template>
        </div>

        <!-- Sección de contenido enriquecido (rich text) -->
        <div v-if="hasVisibleFields(groups.body)" class="space-y-2 mb-4">
          <template v-for="f in sortedBySorting(groups.body)" :key="f.key">
            <div v-if="getValue(f.key)">
              <label class="font-semibold text-sm">{{ f.label }}</label>
              <div class="prose">
                <div v-html="getValue(f.key)"></div>
              </div>
            </div>
          </template>
        </div>

        <!-- Tablas con datos anidados mejoradas -->
        <div v-for="f in groups.datatable" :key="f.key" class="mt-8"> 
          <div class="overflow-x-auto rounded-lg shadow border border-gray-200 bg-white">
            <DataTable :value="getValue(f.key)" stripedRows class="min-w-[400px]" tableStyle="min-width: 400px" :pt="{
              table: { class: 'w-full' },
              header: { class: 'bg-gray-800 font-bold' },  // <-- font-bold para negrita
              bodyRow: { class: 'hover:bg-blue-50 transition' }
            }">
              <template v-for="child in sortedBySorting(f.children)" :key="child.key">
          <Column :field="child.key" :header="child.label" headerClass="!bg-gray-300 !text-gray-800 font-extrabold border-b-2 border-gray-300">
            <template #body="slotProps">
              <span class="block px-2 py-1 text-gray-800">{{ slotProps.data[child.key] }}</span>
            </template>
          </Column>
              </template>
            </DataTable>
          </div>
        </div>
      </div>
    </Dialog>
  </div>
</template>


<script setup>
// Importaciones necesarias desde Vue y PrimeVue
import { ref, computed, watch, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import Toast from 'primevue/toast'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import DynamicField from '@/components/DynamicField.vue'
import dbService from '@/dbService'

// Definición de props recibidas por el componente
const props = defineProps({
  schemaKey: { type: String, required: true }, // Clave para buscar el esquema
  document: { type: Object, required: false, default: null }, // Documento a mostrar
  visible: { type: Boolean, required: true }, // Estado de visibilidad del diálogo
  pathArray: { type: Array, required: true } // Ruta completa del documento
})

// Definición de eventos emitidos por el componente
const emit = defineEmits(['update:visible', 'edit-request', 'delete-request'])
const toast = useToast() // Toast para mostrar mensajes de error

// Refs para almacenar esquema y grupos organizados
const schema = ref([])
const schemaName = ref('')
const groups = ref({
  header: [],
  'title-photo': [],
  supertitle: [],
  title: [],
  subtitle: [],
  fields: [],
  body: [],
  datatable: []
})

// Computed para manejar el v-model del diálogo
const visibleProxy = computed({
  get: () => props.visible,
  set: v => emit('update:visible', v)
})

// Agrupa campos del esquema según su plantilla (template)
function agrupaCampos() {
  groups.value = {
    header: [],
    'title-photo': [],
    supertitle: [],
    title: [],
    subtitle: [],
    fields: [],
    body: [],
    datatable: []
  }

  schema.value.forEach(f => {
    const tpl = f.template || 'fields'
    if (tpl in groups.value) {
      groups.value[tpl].push(f)
    }
  })
}

// Ordena un arreglo de campos según la propiedad "template-sorting"
function sortedBySorting(arr) {
  return arr.slice().sort((a, b) => {
    const sa = parseInt(a['template-sorting'] || '0', 10)
    const sb = parseInt(b['template-sorting'] || '0', 10)
    return sa - sb
  })
}

// Devuelve el valor de un campo según su key
function getValue(key) {
  if (!props.document) return ''
  return props.document[key]
}

// Verifica si una URL corresponde a una imagen
function esImagen(url) {
  return typeof url === 'string' && url.match(/\.(jpeg|jpg|gif|png|webp)(\?.*)?$/i)
}

// Verifica si un grupo de campos contiene al menos un valor visible
function hasVisibleFields(group) {
  return sortedBySorting(group).some(f => getValue(f.key))
}

// Computed que evalúa si hay algún grupo con contenido visible
const hayContenidoVisible = computed(() =>
  ['header', 'title-photo', 'supertitle', 'title', 'subtitle', 'fields', 'body'].some(key =>
    hasVisibleFields(groups.value[key])
  )
)

// Computed que obtiene la URL del banner si existe
const getBannerUrl = computed(() => {
  const bannerField = groups.value.header.find(f => f.key.toLowerCase().includes('banner') && esImagen(getValue(f.key)))
  return bannerField ? getValue(bannerField.key) : null
})

// Computed que devuelve los campos del header excluyendo el banner
const headerSinBanner = computed(() =>
  sortedBySorting(groups.value.header).filter(f => f.key.toLowerCase() !== 'banner')
)

// Lógica que se ejecuta al montar el componente: carga el esquema desde la base de datos
onMounted(async () => {
  const res = await dbService.fetchDocument('schemata', props.schemaKey)
  if (res.success) {
    schema.value = res.data.schema.map(f => ({
      ...f,
      editable: !['createdAt', 'updatedAt'].includes(f.key) // Evita editar campos internos
    }))
    schemaName.value = res.data.name
    agrupaCampos()
  } else {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo cargar el esquema.'
    })
  }
})

// Watch que imprime el documento cada vez que cambia (debug)
watch(
  () => props.document,
  doc => {
    console.log('[watch] Document recibido:', doc)
  }
)

// Emitir petición de edición
function emitEdit() {
  if (props.document) emit('edit-request', props.document)
}

// Emitir petición de eliminación
function emitDelete() {
  if (props.document) emit('delete-request', props.document)
}
</script>

<style>
.dialog-header {
  font-weight: 600;
  font-size: 1.25rem;
}
</style>
