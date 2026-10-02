<script setup>
import { computed } from 'vue'
import { ICON_PATHS } from '../../twibbon/render/draw.js'

const props = defineProps({
    badge: { type: Object, required: true },
    size: { type: Number, default: 40 },
    muted: { type: Boolean, default: false },
})

// Unique per instance: a shared id inside a hidden (display: none) copy breaks the gradient.
const instance = Math.random().toString(36).slice(2, 8)
const gradientId = computed(() => `emblem-${props.badge.id}-${instance}`)
const icon = computed(() => ICON_PATHS[props.badge.icon] ?? [])
</script>

<template>
    <svg :width="size" :height="size" viewBox="0 0 48 48" aria-hidden="true" :class="muted ? 'opacity-40 grayscale' : ''">
        <defs>
            <linearGradient :id="gradientId" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" :stop-color="badge.color" />
                <stop offset="1" :stop-color="badge.color2" />
            </linearGradient>
        </defs>
        <path d="M24 3.5 41.8 13.75v20.5L24 44.5 6.2 34.25v-20.5z" :fill="`url(#${gradientId})`"
            stroke="rgba(255,255,255,0.6)" stroke-width="2" stroke-linejoin="round" />
        <g transform="translate(12 12)" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path v-for="(d, i) in icon" :key="i" :d="d" />
        </g>
    </svg>
</template>
