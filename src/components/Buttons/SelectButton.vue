<template>
    <section class="select-catalog">
      <h1>Catálogo de Select Buttons</h1>
      
      <!-- Select Único (vue3-select-component) -->
      <div class="select-section">
        <h2>Select Único</h2>
        <VueSelect
          v-model="selected"
          :options="options"
          placeholder="Seleccione una opción"
        />
      </div>
      
      <!-- Select Múltiple (vue3-select-component) -->
      <div class="select-section">
        <h2>Select Múltiple</h2>
        <VueSelect
          v-model="selectedMultiple"
          :is-multi="true"
          :options="options"
          placeholder="Seleccione una o varias opciones"
        />
      </div>
      
      <!-- Select Deshabilitado (vue3-select-component) -->
      <div class="select-section">
        <h2>Select Deshabilitado</h2>
        <VueSelect
          v-model="selectedDisabled"
          :options="options"
          placeholder="Select deshabilitado"
          disabled
        />
      </div>
      
      <!-- Select con Búsqueda (vue3-select-component) -->
      <div class="select-section">
        <h2>Select con Búsqueda</h2>
        <VueSelect
          v-model="selectedSearch"
          :options="options"
          placeholder="Buscar..."
          :filterable="true"
        />
      </div>
  
      <!-- Select tipo flechas (Personalizado) -->
      <div class="select-section">
        <h2>Select tipo flechas</h2>
        <div class="arrow-select">
          <!-- Flecha Izquierda -->
          <button @click="prevOption" class="arrow-button arrow-button-left">
            <span>&#10094;</span>
          </button>
  
          <!-- Contenedor con el fondo (solo para el texto) -->
          <div class="arrow-label-container">
            <span class="arrow-select-label">
              {{ arrowSelectOptions[arrowSelectIndex].label }}
            </span>
          </div>
  
          <!-- Flecha Derecha -->
          <button @click="nextOption" class="arrow-button arrow-button-right">
            <span>&#10095;</span>
          </button>
        </div>
      </div>
    </section>
  </template>
  
  <script setup lang="ts">
  import { ref } from "vue";
  import VueSelect from "vue3-select-component";
  
  // Opciones para los selects de vue3-select-component
  const options = [
    { label: 'Opción #1', value: 'option_1' },
    { label: 'Opción #2', value: 'option_2' },
    { label: 'Opción #3', value: 'option_3' }
  ];
  
  // Modelos para cada tipo de select de vue3-select-component
  const selected = ref("");
  const selectedMultiple = ref([]);
  const selectedDisabled = ref("option_2");
  const selectedSearch = ref("");
  
  // Opciones para el Select tipo flechas
  const arrowSelectOptions = [
    { label: "Abierto", value: "abierto" },
    { label: "Cerrado", value: "cerrado" },
    { label: "Pendiente", value: "pendiente" }
  ];
  const arrowSelectIndex = ref(0);
  
  // Métodos para cambiar de opción en el Select tipo flechas
  function nextOption() {
    arrowSelectIndex.value = (arrowSelectIndex.value + 1) % arrowSelectOptions.length;
  }
  
  function prevOption() {
    arrowSelectIndex.value =
      (arrowSelectIndex.value - 1 + arrowSelectOptions.length) % arrowSelectOptions.length;
  }
  </script>
  
  <style scoped>
  .select-catalog {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }
  
  .select-section {
    margin-bottom: 30px;
  }
  
  .select-section h2 {
    font-size: 1.2em;
    margin-bottom: 10px;
  }
  
  /* Contenedor general para las flechas y el texto */
  .arrow-select {
    display: inline-flex;
    align-items: center;
    /* Ajusta el espaciado horizontal como desees */
  }
  
  /* Flechas sin fondo */
  .arrow-button {
    background: none;
    border: none;
    color: #0d3972;
    cursor: pointer;
    font-size: 1.4em;
    font-weight: bold;
    margin: 0 8px;
  }
  
  /* Contenedor con el fondo “pastilla” */
  .arrow-label-container {
    background-color: #0d3972; /* color de fondo */
    border-radius: 20px;
    padding: 6px 16px;
  }
  
  /* Texto dentro de la “pastilla” */
  .arrow-select-label {
    color: white;
    font-weight: bold;
    font-size: 1rem;
  }
  </style>
  