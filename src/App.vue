<script setup>
import { useDarkMode } from './composables/useDarkMode'
import UpdateToast from './components/UpdateToast.vue'

const { isDark } = useDarkMode()
</script>

<template>
  <div id="app">
    <router-view />
    <UpdateToast />
  </div>
</template>
