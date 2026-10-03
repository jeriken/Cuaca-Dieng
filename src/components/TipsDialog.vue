<script setup>
import BannerModal from './BannerModal.vue'
import { ICONS } from '../utils/icons.js'

defineProps(['open'])
const emit = defineEmits(['close'])

// Read top to bottom as one night: evening check → overnight wind → dawn
const steps = [
    {
        when: 'Pukul 22.00',
        title: 'Suhu di bawah 6°C',
        text: 'Jika malam sudah sedingin ini, embun es diprediksi muncul besok paginya.',
        icon: ICONS.moon,
        tone: 'bg-indigo-50 text-indigo-500 dark:bg-indigo-500/15 dark:text-indigo-300',
    },
    {
        when: 'Sepanjang malam',
        title: 'Perhatikan angin',
        text: 'Angin ikut menentukan terbentuk tidaknya embun es — malam yang tenang lebih mendukung.',
        icon: ICONS.wind,
        tone: 'bg-teal-50 text-teal-500 dark:bg-teal-500/15 dark:text-teal-300',
    },
    {
        when: 'Pukul 04.00–06.00',
        title: 'Waktu embun es',
        text: 'Embun es biasanya terbentuk di rentang pagi buta ini.',
        icon: ICONS.snowflake,
        tone: 'bg-sky-50 text-sky-500 dark:bg-sky-500/15 dark:text-sky-300',
    },
]
</script>

<template>
    <BannerModal :open="open" @close="emit('close')" title="Tips Embun Es" subtitle="Cara membaca peluang embun es di Dieng"
        :icon="ICONS.snowflake" banner="from-cyan-500 via-sky-500 to-indigo-500">
        <ol>
            <li v-for="(step, i) in steps" :key="step.title" class="flex gap-3">
                <!-- Icon + connector line down to the next step -->
                <div class="flex flex-col items-center">
                    <span class="w-9 h-9 shrink-0 rounded-xl flex items-center justify-center" :class="step.tone">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                            <path :d="step.icon" />
                        </svg>
                    </span>
                    <span v-if="i < steps.length - 1" class="flex-1 w-px my-1 bg-slate-200 dark:bg-white/10"></span>
                </div>
                <div :class="i < steps.length - 1 ? 'pb-4' : ''">
                    <p class="text-[10px] font-bold uppercase tracking-widest text-sky-500 dark:text-sky-400">{{ step.when }}</p>
                    <p class="text-sm font-semibold text-slate-800 dark:text-slate-100 mt-0.5">{{ step.title }}</p>
                    <p class="text-[13px] leading-relaxed text-slate-500 dark:text-slate-400 mt-0.5">{{ step.text }}</p>
                </div>
            </li>
        </ol>

        <button type="button" @click="emit('close')"
            class="press mt-5 w-full rounded-2xl bg-sky-500 hover:bg-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-sky-500/25 transition-colors">
            Paham
        </button>
    </BannerModal>
</template>
