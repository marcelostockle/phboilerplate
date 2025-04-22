<template>
  <div class="logo-container">
    <img src="@/assets/logo/LG4.png" alt="Plan Humano" class="logo" />
  </div>

  <h1>Plan Humano</h1>
  <h2 style="margin-bottom: 20px;">
    <slot>Plan Humano</slot>
  </h2>
</template>

<style scoped>
.logo-container {
  margin-bottom: 20px;
}

.logo {
  width: 100px;
  height: 100px;
  border-radius: 50%;
}
</style>