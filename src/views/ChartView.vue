<template>
  <div class="chart-view">
    <h2>Generar Gráfico Personalizado</h2>
    <!-- Botón de PrimeVue para abrir el modal -->
    <Button label="Abrir Formulario" class="open-modal-btn" @click="showModal = true" />

    <!-- Modal de PrimeVue (Dialog) -->
    <Dialog v-model:visible="showModal" header="Formulario de Gráfico" :modal="true" :closable="true"
      :style="{ width: '500px', background: 'linear-gradient(to bottom, #021750, #03388d)' }">
      <form @submit.prevent="updateChart" class="chart-form">
        <div class="form-field">
          <label for="xData">Datos del eje X (separados por comas):</label>
          <input id="xData" type="text" v-model="xDataInput" placeholder="Enero, Febrero, Marzo, Abril, Mayo" />
        </div>
        <div class="form-field">
          <label for="yName">Nombre de la serie (Y):</label>
          <input id="yName" type="text" v-model="yName" placeholder="Ventas" />
        </div>
        <div class="form-field">
          <label for="yData">Datos del eje Y (separados por comas):</label>
          <input id="yData" type="text" v-model="yDataInput" placeholder="30, 40, 35, 50, 49" />
        </div>
        <div class="form-field">
          <label for="chartType">Tipo de gráfico:</label>
          <select id="chartType" v-model="chartType">
            <option value="bar">Barra</option>
            <option value="line">Línea</option>
            <option value="area">Área</option>
            <!-- Más opciones si es necesario -->
          </select>
        </div>
        <div class="form-field">
          <label for="title">Título del gráfico:</label>
          <input id="title" type="text" v-model="title" placeholder="Ventas Mensuales" />
        </div>
        <div class="form-field">
          <label for="xAxisTitle">Título del eje X:</label>
          <input id="xAxisTitle" type="text" v-model="xAxisTitle" placeholder="Meses" />
        </div>
        <div class="form-field">
          <label for="yAxisTitle">Título del eje Y:</label>
          <input id="yAxisTitle" type="text" v-model="yAxisTitle" placeholder="Ventas" />
        </div>
        <div class="form-field">
          <label for="height">Altura del gráfico:</label>
          <input id="height" type="number" v-model.number="height" placeholder="400" />
        </div>
        <Button label="Generar Gráfico" type="submit" class="submit-btn" />
      </form>
    </Dialog>

    <!-- Se muestra el gráfico solo cuando se ha generado la configuración -->
    <div v-if="chartConfig" class="chart-container">
      <ApexChart :options="chartConfig.options" :series="chartConfig.series" :type="chartConfig.type"
        :height="chartConfig.height" :style="{ width: '600px' }" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ApexChart from 'vue3-apexcharts'
import { generateChartConfig } from '@/chartService'

// Importa componentes de PrimeVue
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'

// Variables para el formulario
const xDataInput = ref('Enero, Febrero, Marzo, Abril, Mayo')
const yName = ref('Ventas')
const yDataInput = ref('30, 40, 35, 50, 49')
const chartType = ref('bar')
const title = ref('Ventas Mensuales')
const xAxisTitle = ref('Meses')
const yAxisTitle = ref('Ventas')
const height = ref(400)

// Variable reactiva para la configuración del gráfico
const chartConfig = ref(null)
// Variable para controlar la visibilidad del modal
const showModal = ref(false)

// Función para actualizar la configuración del gráfico
function updateChart() {
  // Convertir la cadena del eje X en un array de cadenas
  const xData = xDataInput.value.split(',').map(item => item.trim())
  // Convertir la cadena del eje Y en un array de números
  const yDataArray = yDataInput.value.split(',').map(item => Number(item.trim()))
  // Crear el objeto de la serie para el eje Y
  const yData = { name: yName.value, data: yDataArray }

  // Generar la configuración del gráfico usando el servicio
  chartConfig.value = generateChartConfig({
    xData,
    yData,
    chartType: chartType.value,
    title: title.value,
    xAxisTitle: xAxisTitle.value,
    yAxisTitle: yAxisTitle.value,
    height: height.value
  })

  // Cerrar el modal
  showModal.value = false
}
</script>

<style scoped>
.chart-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

/* Botón para abrir el modal */
.open-modal-btn {
  margin-bottom: 20px;
}

/* Modal Content */
.modal-content {
  background: linear-gradient(to bottom, #021750, #03388d);
}

/* Estilos del formulario en el modal */
.chart-form {
  display: grid;
  grid-template-columns: 1fr;
  gap: 15px;
  margin-bottom: 20px;
}

.form-field label {
  font-weight: bold;
  margin-bottom: 5px;
  display: block;
  color: aliceblue;
}

.form-field input,
.form-field select {
  width: 100%;
  padding: 8px;
  font-size: 1rem;
  box-sizing: border-box;
}

.submit-btn {
  margin-top: 10px;
}

/* Contenedor del gráfico */
.chart-container {
  margin-top: 30px;
}
</style>
