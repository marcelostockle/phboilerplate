<template>
    <!-- Utiliza el componente Password de PrimeVue para ingresar contraseñas -->
    <Password
      v-model="password"
      :placeholder="placeholder"
      class="password-field"
    />
  </template>
  
  <script setup lang="ts">
  import { ref, watch, defineProps, defineEmits } from 'vue'
  import Password from 'primevue/password'
  
  const props = defineProps({
    modelValue: { type: String, default: '' },
    placeholder: { type: String, default: '' }
  })
  const emits = defineEmits(['update:modelValue'])
  
  const password = ref(props.modelValue)
  
  watch(() => props.modelValue, (newVal) => {
    password.value = newVal
  })
  watch(password, (newVal) => {
    emits('update:modelValue', newVal)
  })
  </script>
  
  <style scoped>
  .password-field {
    width: 100%;
  }
  </style>
  