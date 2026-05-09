<script setup>
import { useDarkMode } from './composables/useDarkMode'

const { isDark } = useDarkMode()
</script>

<template>
  <div id="app">
    <router-view />
  </div>
</template>
