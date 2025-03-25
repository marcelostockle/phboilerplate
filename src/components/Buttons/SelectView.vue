<template>
    <div>
      <h1>Ejemplo de Uso de Select como Librería</h1>

      <!-- Usando PrimeVue Dropdown -->
      <Select
        v-model="selectedItem2"
        :options="optionsList"
        placeholder="Selecciona una opción"
        selectVariant="dropdown"
      />
  
      <!-- Usando PrimeVue MultiSelect -->
      <Select
        v-model="selectedItem3"
        :options="optionsList"
        placeholder="Selecciona una o varias opciones"
        selectVariant="multiselect"
      />
  
      <!-- Usando PrimeVue AutoComplete -->
      <Select
        v-model="selectedItem4"
        :options="optionsList"
        placeholder="Empieza a escribir..."
        selectVariant="autocomplete"
      />
  
      <!-- Usando el select personalizado con flechas -->
      <Select
        v-model="selectedItem5"
        selectVariant="arrowSelect"
      />
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue'
  import Select from '@/components/Buttons/Select.vue' // Ajusta la ruta según tu estructura
  
  const selectedItem1 = ref(null)
  const selectedItem2 = ref(null)
  const selectedItem3 = ref(null)
  const selectedItem4 = ref(null)
  const selectedItem5 = ref(null)
  
  const optionsList = ref([
    { label: 'Opción A', value: 'a' },
    { label: 'Opción B', value: 'b' },
    { label: 'Opción C', value: 'c' }
  ])
  </script>
  