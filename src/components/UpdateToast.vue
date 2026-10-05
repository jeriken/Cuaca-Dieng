<script setup>
import { ref } from 'vue'
import { useAppUpdate } from '../composables/useAppUpdate.js'

const { needRefresh, refresh, dismiss } = useAppUpdate()
const reloading = ref(false)

const onRefresh = () => {
    reloading.value = true
    refresh()
}
</script>

<template>
    <transition enter-active-class="transition duration-300 ease-out"
        enter-from-class="translate-y-4 opacity-0" enter-to-class="translate-y-0 opacity-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="translate-y-0 opacity-100" leave-to-class="translate-y-4 opacity-0">
        <div v-if="needRefresh" role="status" aria-live="polite"
            class="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-sm rounded-2xl shadow-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#162032] p-3 flex items-center gap-3"
            style="margin-bottom: env(safe-area-inset-bottom)">
            <div class="w-9 h-9 shrink-0 rounded-xl flex items-center justify-center bg-sky-50 dark:bg-sky-500/10 text-sky-500">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :class="{ 'animate-spin': reloading }">
                    <path d="M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6" />
                </svg>
            </div>
            <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-slate-800 dark:text-slate-100">Versi baru tersedia</p>
                <p class="text-xs text-slate-500 dark:text-slate-400">Muat ulang untuk melihat pembaruan.</p>
            </div>
            <button type="button" @click="dismiss" :disabled="reloading"
                class="press px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                Nanti
            </button>
            <button type="button" @click="onRefresh" :disabled="reloading"
                class="press px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-sky-500 hover:bg-sky-600 disabled:opacity-70 transition-colors">
                Muat ulang
            </button>
        </div>
    </transition>
</template>
