<template>
    <div class="layout">
        <header class="topbar">
            <SidebarMenu />
        </header>
    </div>
    <div class="container">
        <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="125" height="125" />

        <div class="wrapper">
            <HelloWorld msg="You did it!" />

            <nav>
                <RouterLink to="/">Home</RouterLink>
                <RouterLink to="/about">About</RouterLink>
            </nav>
        </div>
        <main class="content">
            <router-view />
        </main>
    </div>
</template>

<script setup>
import SidebarMenu from '@/components/SidebarMenu.vue'
import HelloWorld from '@/components/HelloWorld.vue'
import { RouterLink, RouterView } from 'vue-router'
</script>

<style scoped>
.layout {
    display: flex;
    flex-direction: column;
    max-height: 100%;
}
/* Aquí el cambio importante */
.container {
  display: flex;
  flex-direction: row;
  width: 100vw;        /* Ocupa 100% del ancho visible de la pantalla */
  margin: 0;           /* Asegúrate de que no tenga márgenes que lo centren */
  padding: 0;          /* Elimina posibles rellenos */
  box-sizing: border-box; /* Incluye padding y border dentro del ancho */
}
</style>