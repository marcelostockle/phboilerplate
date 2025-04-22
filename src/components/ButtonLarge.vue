<script>
export default {
  inheritAttrs: false,
  emits: ['click'],
  props: {
    type: {
      type: String,
      default: 'button',
    }
  },
};
</script>

<template>
  <button :type="type" v-bind="$attrs" @click="$emit('click', $event)">
    <slot>Submit</slot>
  </button>
</template>

<style scoped>
button {
  width: 100%;
  padding: 12px;
  font-size: 1rem;
  border: none;
  border-radius: 25px;
  background-color: #072463;
  color: #ffffff;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #1d4ed8;
}
</style>