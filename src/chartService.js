// chartService.js

/**
 * Genera la configuración para un gráfico ApexChart.
 *
 * @param {Object} config - Objeto de configuración.
 * @param {Array} config.xData - Datos para el eje X (categorías).
 * @param {Object|Array} config.yData - Datos para el eje Y. Puede ser:
 *   - Un objeto { name: 'Serie 1', data: [...] } para una única serie, o
 *   - Un array de objetos para múltiples series.
 * @param {String} [config.chartType='line'] - Tipo de gráfico ('line', 'bar', etc.).
 * @param {String} [config.title=''] - Título del gráfico.
 * @param {String} [config.xAxisTitle=''] - Título del eje X.
 * @param {String} [config.yAxisTitle=''] - Título del eje Y.
 * @param {Number|String} [config.height=400] - Altura del gráfico.
 *
 * @returns {Object} Objeto con { options, series, type, height } para ApexCharts.
 */
export function generateChartConfig({
    xData,
    yData,
    chartType = 'line',
    title = '',
    xAxisTitle = '',
    yAxisTitle = '',
    height = 400
  }) {
    // Si yData es un objeto único, lo convertimos en un array de series.
    const series = Array.isArray(yData) ? yData : [yData];
  
    const options = {
      chart: {
        id: 'custom-chart'
      },
      title: {
        text: title,
        align: 'center',
        style: {
          color: '#333',
          fontSize: '18px'
        }
      },
      xaxis: {
        categories: xData,
        title: {
          text: xAxisTitle,
          style: {
            color: '#333'
          }
        },
        labels: {
          style: {
            colors: '#333',
            fontSize: '14px'
          }
        }
      },
      yaxis: {
        title: {
          text: yAxisTitle,
          style: {
            color: '#333'
          }
        },
        labels: {
          style: {
            colors: '#333',
            fontSize: '14px'
          }
        }
      },
      theme: {
        mode: 'light'
      }
    };
  
    return {
      options,
      series,
      type: chartType,
      height
    };
  }
  