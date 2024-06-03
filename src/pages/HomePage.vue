<script setup>
import Main from '../components/Main.vue'
import Header from '../components/Header.vue'
import Highlight from '../components/Highlight.vue'
</script>

<template>
    <div class="grid grid-cols-11">
        <div class="col-span-11 md:col-span-3 md:h-screen md:sticky top-0 bg-stone-50 pb-8">
            <Main />
        </div>
        <div class="col-span-11 md:col-span-8 bg-stone-100 p-8">
            <Header />
            <Highlight />
        </div>
    </div>
</template>