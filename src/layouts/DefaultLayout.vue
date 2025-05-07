<template>
    <div class="default-layout flex flex-col h-screen">
      <!-- Barra superior fija -->
      <header class="topbar fixed inset-x-0 top-0 z-50">
        <SidebarMenu />
      </header>
  
      <!-- Contenedor principal centrado -->
      <main class="container">
        <section class="content">
          <router-view />
        </section>
      </main>
    </div>
  </template>
  
  <script setup>
  import SidebarMenu from '@/components/SidebarMenu.vue'
  </script>
  
  <style scoped>
  .default-layout {
    display: flex;
    flex-direction: column;
    height: 100vh;
  }
  
  .topbar {
    position: fixed;
    top: 0;
    width: 100%;
    z-index: 1000;
  }
  
  .container {
    /* Deja espacio para la barra fija */
    margin-top: 4rem;
    /* Ocupa todo el espacio restante y centra contenido */
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100vw;
    box-sizing: border-box;
  }
  
  .content {
    /* Limita ancho máximo y centra internamente */
    width: 100%;
    max-width: 800px;
    padding: 1rem;
    box-sizing: border-box;
  }
  </style>
  