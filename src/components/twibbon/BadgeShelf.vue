<script setup>
import { BADGES } from '../../twibbon/config.js'
import { fmtTemp, toWib } from '../../twibbon/format.js'
import BadgeEmblem from './BadgeEmblem.vue'

defineProps({
    collection: { type: Object, required: true },
    // Badge the current reading would earn.
    current: { type: Object, default: null },
})

const collectedOn = (entry) => toWib(entry.time).format('D MMM YYYY')
</script>

<template>
    <div>
        <div class="flex items-baseline justify-between mb-3">
            <h3 class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Koleksi Lencana</h3>
            <span class="text-xs font-semibold text-slate-400 dark:text-slate-500">
                {{ Object.keys(collection.badges).length }}/{{ BADGES.length }}
            </span>
        </div>
        <ul class="grid grid-cols-1 gap-2">
            <li v-for="badge in BADGES" :key="badge.id"
                class="flex items-center gap-3 rounded-xl px-3 py-2 border transition-colors"
                :class="current?.id === badge.id
                    ? 'border-sky-200 bg-sky-50 dark:border-sky-500/30 dark:bg-sky-500/10'
                    : 'border-slate-100 bg-white dark:border-white/10 dark:bg-white/5'">
                <BadgeEmblem :badge="badge" :size="36" :muted="!collection.badges[badge.id] && current?.id !== badge.id" />
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-tight">{{ badge.name }}</p>
                    <p class="text-xs text-slate-400 dark:text-slate-500">{{ badge.rule }}</p>
                </div>
                <span v-if="collection.badges[badge.id]" class="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 text-right leading-tight">
                    Didapat<br>{{ collectedOn(collection.badges[badge.id]) }}
                </span>
                <span v-else-if="current?.id === badge.id" class="text-[11px] font-semibold text-sky-600 dark:text-sky-400 text-right leading-tight">
                    Bagikan untuk<br>mendapatkan
                </span>
            </li>
        </ul>
        <p v-if="collection.coldest" class="mt-3 text-xs text-slate-500 dark:text-slate-400">
            Rekor terdinginmu:
            <span class="font-display font-semibold text-slate-700 dark:text-slate-200">{{ fmtTemp(collection.coldest.temp) }}°C</span>
            · {{ collection.coldest.spot }}, {{ collectedOn(collection.coldest) }}
        </p>
    </div>
</template>
