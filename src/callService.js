import axios from 'axios';

// URL de tu función de Firebase
const FUNCTION_URL = 'https://southamerica-west1-ekdromoi-nuxt.cloudfunctions.net/callLLM';

export async function getLLMResponse(prompt) {
  if (!prompt) {
    throw new Error('El campo "prompt" no puede estar vacío.');
  }

  try {
    const response = await axios.post(FUNCTION_URL, { prompt });
    
    // Validación por si no hay respuesta
    if (!response.data || !response.data.output) {
      throw new Error('Respuesta inválida del modelo.');
    }

    return response.data.output;
  } catch (error) {
    console.error("Error en getLLMResponse:", error.response?.data || error.message);
    throw new Error('No se pudo obtener respuesta del modelo.');
  }
}
