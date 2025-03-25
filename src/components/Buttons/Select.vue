<template>
  <div class="custom-select">
    <!-- Si el tipo NO es 'arrowSelect', se renderiza el componente seleccionado dinámicamente -->
    <template v-if="selectVariant !== 'arrowSelect'">
      <component
        :is="currentComponent"
        v-model="localValue"
        :options="options"
        :placeholder="placeholder"
        v-bind="componentProps"
      >
        <!-- Slot para personalizar la opción (opcional) -->
        <slot name="option" />
        <!-- Slot para personalizar el valor seleccionado (opcional) -->
        <slot name="value" />
      </component>
    </template>

    <!-- Si el tipo es 'arrowSelect', se renderiza un select personalizado con flechas -->
    <template v-else>
      <div class="arrow-select">
        <button @click="prevOption" class="arrow-button arrow-button-left">
          <span>&#10094;</span>
        </button>
        <div class="arrow-label-container">
          <span class="arrow-select-label">
            {{ arrowSelectOptions[arrowSelectIndex].label }}
          </span>
        </div>
        <button @click="nextOption" class="arrow-button arrow-button-right">
          <span>&#10095;</span>
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, defineProps, defineEmits } from 'vue'

// Importar selectores de las librerías
import VueSelect from 'vue3-select-component'
import Dropdown from 'primevue/dropdown'
import MultiSelect from 'primevue/multiselect'
import AutoComplete from 'primevue/autocomplete'

/*
  Props:
  - modelValue: valor para v-model.
  - options: arreglo de opciones a mostrar.
  - selectVariant: determina qué componente se usará.
      Valores sugeridos:
        'vueSelect' (por defecto),
        'dropdown',
        'multiselect',
        'autocomplete',
        'arrowSelect' (personalizado con flechas).
  - placeholder: texto a mostrar cuando no hay selección.
  - componentProps: objeto de propiedades adicionales que se pasarán al componente.
*/
const props = defineProps({
  modelValue: {
    type: [String, Number, Array, Object],
    default: null
  },
  options: {
    type: Array,
    default: () => []
  },
  selectVariant: {
    type: String,
    default: 'vueSelect'
  },
  placeholder: {
    type: String,
    default: ''
  },
  componentProps: {
    type: Object,
    default: () => ({})
  }
})

// Emite para actualizar el modelo (v-model)
const emits = defineEmits(['update:modelValue'])

// Variable local para sincronizar el v-model
const localValue = ref(props.modelValue)
watch(() => props.modelValue, (newVal) => {
  localValue.value = newVal
})
watch(localValue, (newVal) => {
  emits('update:modelValue', newVal)
})

// Computed para seleccionar el componente a usar según selectVariant
const currentComponent = computed(() => {
  switch (props.selectVariant) {
    case 'dropdown':
      return Dropdown
    case 'multiselect':
      return MultiSelect
    case 'autocomplete':
      return AutoComplete
    default:
      return VueSelect
  }
})

/* --- Para el select personalizado con flechas (arrowSelect) --- */
const arrowSelectOptions = ref([
  { label: "Abierto", value: "abierto" },
  { label: "Cerrado", value: "cerrado" },
  { label: "Pendiente", value: "pendiente" }
])
const arrowSelectIndex = ref(0)

function nextOption() {
  arrowSelectIndex.value = (arrowSelectIndex.value + 1) % arrowSelectOptions.value.length
}

function prevOption() {
  arrowSelectIndex.value = (arrowSelectIndex.value - 1 + arrowSelectOptions.value.length) % arrowSelectOptions.value.length
}
</script>

<style scoped>
.custom-select {
  width: 100%;
}

/* Estilos para el select personalizado con flechas */
.arrow-select {
  display: inline-flex;
  align-items: center;
  background-color: #0d3972;
  border-radius: 20px;
  padding: 6px 16px;
}

.arrow-button {
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  font-size: 1.4em;
  font-weight: bold;
  margin: 0 8px;
}

.arrow-label-container {
  /* El fondo ya lo tiene el contenedor principal */
}

.arrow-select-label {
  color: white;
  font-weight: bold;
  font-size: 1rem;
}
</style>
