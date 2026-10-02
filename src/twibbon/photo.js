// Photo loading and pan/zoom math. A view is { zoom, cx, cy }: the zoom on top of
// "cover" fit, and the photo point (0..1) shown at the canvas centre. That keeps the
// framing stable when switching between story, feed and square sizes.

const MAX_EDGE = 2560 // enough for 1080px output with room to zoom, light on phone memory
export const MAX_ZOOM = 4

export const DEFAULT_VIEW = Object.freeze({ zoom: 1, cx: 0.5, cy: 0.5 })

export async function loadPhoto(file) {
    const url = URL.createObjectURL(file)
    try {
        const img = new Image()
        img.src = url
        await img.decode()
        const scale = Math.min(1, MAX_EDGE / Math.max(img.naturalWidth, img.naturalHeight))
        const width = Math.max(1, Math.round(img.naturalWidth * scale))
        const height = Math.max(1, Math.round(img.naturalHeight * scale))

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, width, height)
        return { source: canvas, width, height }
    } finally {
        URL.revokeObjectURL(url)
    }
}

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

const scaleFor = (photo, W, H, zoom) => Math.max(W / photo.width, H / photo.height) * zoom

export function clampView(view, photo, W, H) {
    const zoom = clamp(view.zoom, 1, MAX_ZOOM)
    const s = scaleFor(photo, W, H, zoom)
    const halfW = W / (2 * photo.width * s)
    const halfH = H / (2 * photo.height * s)
    return {
        zoom,
        cx: clamp(view.cx, halfW, 1 - halfW),
        cy: clamp(view.cy, halfH, 1 - halfH),
    }
}

export function panView(view, photo, W, H, dx, dy) {
    const s = scaleFor(photo, W, H, view.zoom)
    return clampView({
        zoom: view.zoom,
        cx: view.cx - dx / (photo.width * s),
        cy: view.cy - dy / (photo.height * s),
    }, photo, W, H)
}

// Zoom while keeping the photo point under canvas point (px, py) in place.
export function zoomView(view, photo, W, H, zoom, px = W / 2, py = H / 2) {
    const next = clamp(zoom, 1, MAX_ZOOM)
    const s1 = scaleFor(photo, W, H, view.zoom)
    const s2 = scaleFor(photo, W, H, next)
    const u = view.cx + (px - W / 2) / (photo.width * s1)
    const v = view.cy + (py - H / 2) / (photo.height * s1)
    return clampView({
        zoom: next,
        cx: u - (px - W / 2) / (photo.width * s2),
        cy: v - (py - H / 2) / (photo.height * s2),
    }, photo, W, H)
}

export function photoRect(view, photo, W, H) {
    const s = scaleFor(photo, W, H, view.zoom)
    const w = photo.width * s
    const h = photo.height * s
    return { x: W / 2 - view.cx * w, y: H / 2 - view.cy * h, w, h }
}
