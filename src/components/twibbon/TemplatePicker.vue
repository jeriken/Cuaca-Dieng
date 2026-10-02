<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { canvasSize, renderScene } from '../../twibbon/render/index.js'

const props = defineProps({
    templates: { type: Array, required: true },
    modelValue: { type: String, required: true },
    // Scene of the current preview; each thumbnail swaps in its own template.
    scene: { type: Object, required: true },
    format: { type: Object, required: true },
    // Skip re-rendering while the photo is being dragged.
    paused: { type: Boolean, default: false },
})
defineEmits(['update:modelValue'])

const THUMB_HEIGHT = 132
const canvases = ref({})
let timer = null

function renderThumbnails() {
    timer = null
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
    for (const template of props.templates) {
        const el = canvases.value[template.id]
        if (!el) continue
        const { width, height } = canvasSize(template, props.format)
        const scale = (THUMB_HEIGHT * pixelRatio) / height
        el.width = Math.round(width * scale)
        el.height = Math.round(height * scale)
        el.style.width = `${el.width / pixelRatio}px`
        el.style.height = `${THUMB_HEIGHT}px`
        const ctx = el.getContext('2d')
        ctx.setTransform(scale, 0, 0, scale, 0, 0)
        renderScene(ctx, {
            ...props.scene,
            template,
            format: template.size ? 'sticker' : props.format.id,
            W: width,
            H: height,
            safe: template.safe ?? props.format.safe,
            scale,
        })
    }
}

function scheduleThumbnails() {
    if (props.paused) return
    clearTimeout(timer)
    timer = setTimeout(renderThumbnails, 120)
}

watch(() => [props.scene, props.format], scheduleThumbnails)
watch(() => props.paused, (paused) => { if (!paused) scheduleThumbnails() })
onMounted(renderThumbnails)
onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
    <div class="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x" role="radiogroup" aria-label="Pilih desain">
        <button v-for="template in templates" :key="template.id" type="button" role="radio"
            :aria-checked="modelValue === template.id"
            class="group shrink-0 snap-start flex flex-col items-center gap-1.5 rounded-2xl p-1.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            :class="modelValue === template.id ? 'bg-sky-50 dark:bg-sky-500/10' : 'hover:bg-slate-100 dark:hover:bg-white/5'"
            @click="$emit('update:modelValue', template.id)">
            <div class="h-[132px] flex items-center justify-center">
                <canvas :ref="el => { if (el) canvases[template.id] = el }"
                    class="block rounded-xl ring-2 transition-all"
                    :class="[
                        modelValue === template.id ? 'ring-sky-500 shadow-lg shadow-sky-500/20' : 'ring-transparent group-hover:ring-slate-300 dark:group-hover:ring-white/20',
                        template.transparent ? 'thumb-checker' : 'bg-slate-200 dark:bg-white/10',
                    ]" />
            </div>
            <span class="text-xs font-semibold leading-none"
                :class="modelValue === template.id ? 'text-sky-600 dark:text-sky-400' : 'text-slate-600 dark:text-slate-300'">
                {{ template.name }}
            </span>
            <span class="text-[10px] leading-none text-slate-400 dark:text-slate-500">{{ template.hint }}</span>
        </button>
    </div>
</template>

<style scoped>
.thumb-checker {
    background: repeating-conic-gradient(#334155 0 25%, #1e293b 0 50%) 0 0 / 12px 12px;
}
</style>
