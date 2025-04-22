<template>
    <div class="p-6 max-w-xl mx-auto">
      <h1 class="text-2xl font-bold mb-4">Consulta al LLM</h1>
      <input
        v-model="prompt"
        class="border border-gray-300 p-2 rounded w-full mb-4"
        placeholder="Escribe tu prompt aquí..."
      />
      <button
        @click="sendPrompt"
        class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Enviar
      </button>
  
      <div v-if="loading" class="mt-4 text-gray-500">Consultando...</div>
  
      <div v-if="response" class="mt-4 bg-gray-100 p-4 rounded">
        <strong>Respuesta:</strong>
        <p>{{ response[0]?.generated_text }}</p>
      </div>
  
      <div v-if="error" class="mt-4 text-red-600">
        {{ error }}
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { getLLMResponse } from '@/callService';
  
  const prompt = ref('');
  const response = ref(null);
  const error = ref('');
  const loading = ref(false);
  
  const sendPrompt = async () => {
    error.value = '';
    response.value = null;
    loading.value = true;
  
    try {
      response.value = await getLLMResponse(prompt.value);
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };
  </script>
  