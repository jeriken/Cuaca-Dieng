<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { renderBackground, renderOverlay } from '../../twibbon/render/index.js'
import { DEFAULT_VIEW, panView, zoomView } from '../../twibbon/photo.js'

const props = defineProps({
    scene: { type: Object, required: true },
    // Pan/zoom gestures only make sense when a photo is showing.
    interactive: { type: Boolean, default: false },
    label: { type: String, default: '' },
})
const emit = defineEmits(['update:view', 'interaction'])

const wrapper = ref(null)
const canvas = ref(null)
const displaySize = ref({ width: 0, height: 0 })
let frame = 0
let resizeObserver = null
// True while a finger/mouse/wheel gesture is moving the photo.
let gesturing = false
let wheelTimer = null

// The template layer is cached so dragging the photo only redraws the photo.
const overlay = { canvas: null, inputs: [] }

function overlayInputs(scene) {
    return [scene.template, scene.format, scene.W, scene.H, scene.safe, scene.data, scene.spot, scene.caption, scene.host, scene.assetsVersion]
}

function overlayLayer(scene) {
    const inputs = overlayInputs(scene)
    const stale = !overlay.canvas || inputs.some((value, i) => value !== overlay.inputs[i])
    if (stale) {
        if (!overlay.canvas) overlay.canvas = document.createElement('canvas')
        overlay.canvas.width = scene.W // also clears it
        overlay.canvas.height = scene.H
        renderOverlay(overlay.canvas.getContext('2d'), scene)
        overlay.inputs = inputs
    }
    return overlay.canvas
}

function draw() {
    frame = 0
    const el = canvas.value
    if (!el) return
    const scene = { ...props.scene, scale: 1 }
    if (el.width !== scene.W) el.width = scene.W
    if (el.height !== scene.H) el.height = scene.H
    const ctx = el.getContext('2d')
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    renderBackground(ctx, scene, { fast: gesturing })
    ctx.drawImage(overlayLayer(scene), 0, 0)
}

function setGesturing(value) {
    if (gesturing === value) return
    gesturing = value
    emit('interaction', value)
    // Redraw at full quality once the gesture ends.
    if (!value) scheduleDraw()
}

function scheduleDraw() {
    if (!frame) frame = requestAnimationFrame(draw)
}

// Fit the canvas inside the wrapper like object-fit: contain.
function fit() {
    const box = wrapper.value?.getBoundingClientRect()
    if (!box || !box.width || !box.height) return
    const ratio = props.scene.W / props.scene.H
    let width = box.width
    let height = width / ratio
    if (height > box.height) {
        height = box.height
        width = height * ratio
    }
    displaySize.value = { width: Math.floor(width), height: Math.floor(height) }
}

watch(() => props.scene, scheduleDraw)
watch(() => props.scene.W / props.scene.H, fit)

// ---------------------------------------------------------------------------
// Gestures: one pointer pans, two pointers pinch-zoom, wheel zooms at the cursor.

const pointers = new Map()
let pinch = null

function toCanvasPoint(event) {
    const rect = canvas.value.getBoundingClientRect()
    const k = props.scene.W / rect.width
    return { x: (event.clientX - rect.left) * k, y: (event.clientY - rect.top) * k }
}

function updateView(view) {
    emit('update:view', view)
}

function startPinch() {
    const [a, b] = [...pointers.values()]
    pinch = {
        view: props.scene.view,
        distance: Math.max(1, Math.hypot(a.x - b.x, a.y - b.y)),
        mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
    }
}

function onPointerDown(event) {
    if (!props.interactive || pointers.size >= 2) return
    try {
        canvas.value.setPointerCapture(event.pointerId)
    } catch {
        // The pointer may already be gone (very quick taps); dragging still works without capture.
    }
    pointers.set(event.pointerId, toCanvasPoint(event))
    if (pointers.size === 2) startPinch()
    setGesturing(true)
}

function onPointerMove(event) {
    if (!pointers.has(event.pointerId)) return
    const previous = pointers.get(event.pointerId)
    const point = toCanvasPoint(event)
    pointers.set(event.pointerId, point)
    const { photo, view, W, H } = props.scene
    if (!photo) return

    if (pointers.size === 1) {
        updateView(panView(view, photo, W, H, point.x - previous.x, point.y - previous.y))
    } else if (pinch) {
        // Measure from the pinch start so the gesture never drifts.
        const [a, b] = [...pointers.values()]
        const distance = Math.hypot(a.x - b.x, a.y - b.y)
        const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
        const zoomed = zoomView(pinch.view, photo, W, H, pinch.view.zoom * (distance / pinch.distance), pinch.mid.x, pinch.mid.y)
        updateView(panView(zoomed, photo, W, H, mid.x - pinch.mid.x, mid.y - pinch.mid.y))
    }
}

function onPointerEnd(event) {
    if (!pointers.delete(event.pointerId)) return
    // A remaining finger keeps panning from its last tracked position.
    pinch = null
    if (!pointers.size) setGesturing(false)
}

function onWheel(event) {
    if (!props.interactive || !props.scene.photo) return
    event.preventDefault()
    const { photo, view, W, H } = props.scene
    const point = toCanvasPoint(event)
    const factor = Math.exp(-event.deltaY * (event.ctrlKey ? 0.01 : 0.0015))
    setGesturing(true)
    clearTimeout(wheelTimer)
    wheelTimer = setTimeout(() => setGesturing(false), 180)
    updateView(zoomView(view, photo, W, H, view.zoom * factor, point.x, point.y))
}

function onKeydown(event) {
    if (!props.interactive || !props.scene.photo) return
    const { photo, view, W, H } = props.scene
    const step = event.shiftKey ? 120 : 40
    const moves = { ArrowLeft: [step, 0], ArrowRight: [-step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] }
    if (moves[event.key]) {
        updateView(panView(view, photo, W, H, ...moves[event.key]))
    } else if (event.key === '+' || event.key === '=') {
        updateView(zoomView(view, photo, W, H, view.zoom * 1.15))
    } else if (event.key === '-') {
        updateView(zoomView(view, photo, W, H, view.zoom / 1.15))
    } else if (event.key === '0') {
        updateView({ ...DEFAULT_VIEW })
    } else {
        return
    }
    event.preventDefault()
}

function resetView() {
    if (props.interactive) updateView({ ...DEFAULT_VIEW })
}

onMounted(() => {
    draw()
    fit()
    resizeObserver = new ResizeObserver(fit)
    resizeObserver.observe(wrapper.value)
    canvas.value.addEventListener('wheel', onWheel, { passive: false })
})

onBeforeUnmount(() => {
    cancelAnimationFrame(frame)
    clearTimeout(wheelTimer)
    resizeObserver?.disconnect()
    canvas.value?.removeEventListener('wheel', onWheel)
})

// Export needs the exact current state at full quality, not the next animation frame.
defineExpose({
    flush() {
        if (frame) cancelAnimationFrame(frame)
        gesturing = false
        draw()
        return canvas.value
    },
})
</script>

<template>
    <div ref="wrapper" class="relative w-full h-full flex items-center justify-center">
        <canvas ref="canvas" role="img" :aria-label="label"
            :tabindex="interactive ? 0 : -1"
            :style="{ width: `${displaySize.width}px`, height: `${displaySize.height}px` }"
            :class="[
                'block rounded-2xl shadow-2xl shadow-slate-900/20 dark:shadow-black/40 select-none outline-none focus-visible:ring-4 focus-visible:ring-sky-400/60',
                scene.template.transparent ? 'twibbon-checker' : '',
                interactive ? 'touch-none cursor-grab active:cursor-grabbing' : '',
            ]"
            @pointerdown="onPointerDown" @pointermove="onPointerMove"
            @pointerup="onPointerEnd" @pointercancel="onPointerEnd" @lostpointercapture="onPointerEnd"
            @dblclick="resetView" @keydown="onKeydown" />
        <slot />
    </div>
</template>

<style scoped>
.twibbon-checker {
    background: repeating-conic-gradient(#334155 0 25%, #1e293b 0 50%) 0 0 / 24px 24px;
}
</style>
