import { photoRect } from '../photo.js'
import { mulberry32, verticalGradient } from './draw.js'

export function drawPhoto(ctx, scene, fast = false) {
    const { photo, view, W, H } = scene
    const rect = photoRect(view, photo, W, H)
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = fast ? 'low' : 'high'
    ctx.drawImage(photo.source, rect.x, rect.y, rect.w, rect.h)
}

// ---------------------------------------------------------------------------
// Procedural Dieng landscape, used when no photo is chosen. The palette follows
// the time of the reading, so a 05.00 twibbon gets a Sikunir-style golden dawn.

const PALETTES = {
    dawn: {
        sky: [[0, '#0b1026'], [0.35, '#2d2a6e'], [0.62, '#a3478f'], [0.82, '#f08a5d'], [1, '#ffd29a']],
        sun: { x: 0.8, y: 0.535, r: 0.07, core: '#fff3cf', glow: 'rgba(255, 170, 100, 0.55)' },
        layers: ['#6a4f8f', '#4a3a74', '#30285a', '#1d1840', '#0f0c26'],
        mist: 'rgba(255, 205, 170, 0.32)',
        stars: 0.35,
    },
    day: {
        sky: [[0, '#1d6fd1'], [0.5, '#4aa8f0'], [0.85, '#a7dcff'], [1, '#dcf2ff']],
        sun: { x: 0.8, y: 0.17, r: 0.06, core: '#fffbea', glow: 'rgba(255, 255, 255, 0.55)' },
        layers: ['#8db4c8', '#5d8da1', '#3e6c70', '#285250', '#163833'],
        mist: 'rgba(255, 255, 255, 0.38)',
        clouds: true,
    },
    dusk: {
        sky: [[0, '#1b1446'], [0.4, '#5b2a86'], [0.7, '#e0607e'], [0.88, '#f9a45c'], [1, '#ffd08a']],
        sun: { x: 0.86, y: 0.53, r: 0.075, core: '#ffe7b8', glow: 'rgba(255, 130, 90, 0.55)' },
        layers: ['#6d4280', '#4b2d60', '#331f46', '#201431', '#120b1e'],
        mist: 'rgba(255, 175, 150, 0.28)',
        stars: 0.15,
    },
    night: {
        sky: [[0, '#030712'], [0.55, '#0b1a3a'], [1, '#1d3263']],
        moon: { x: 0.76, y: 0.16, r: 0.045 },
        layers: ['#2a3d68', '#1e2e52', '#15223f', '#0d172d', '#070e1c'],
        mist: 'rgba(130, 160, 220, 0.14)',
        stars: 1,
    },
}

export function paletteFor(hour) {
    if (hour >= 4 && hour < 7) return 'dawn'
    if (hour >= 7 && hour < 16) return 'day'
    if (hour >= 16 && hour < 19) return 'dusk'
    return 'night'
}

function paintLandscape(W, H, palette) {
    const canvas = document.createElement('canvas')
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')
    const random = mulberry32(2093)
    const horizon = H * 0.58

    ctx.fillStyle = verticalGradient(ctx, 0, horizon + H * 0.06, palette.sky)
    ctx.fillRect(0, 0, W, H)

    if (palette.stars) {
        for (let i = 0; i < 170; i++) {
            const x = random() * W
            const y = random() * horizon * 0.9
            const fade = 1 - y / (horizon * 0.9)
            const alpha = (0.25 + random() * 0.75) * palette.stars * fade
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha.toFixed(3)})`
            ctx.beginPath()
            ctx.arc(x, y, 0.8 + random() * 1.8, 0, Math.PI * 2)
            ctx.fill()
        }
    }

    if (palette.sun) {
        const { x, y, r, core, glow } = palette.sun
        const cx = x * W
        const cy = y * H
        const radius = r * W
        const halo = ctx.createRadialGradient(cx, cy, radius * 0.5, cx, cy, radius * 6)
        halo.addColorStop(0, glow)
        halo.addColorStop(1, 'rgba(255, 255, 255, 0)')
        ctx.fillStyle = halo
        ctx.fillRect(0, 0, W, H)
        ctx.beginPath()
        ctx.arc(cx, cy, radius, 0, Math.PI * 2)
        ctx.fillStyle = core
        ctx.fill()
    }

    if (palette.moon) {
        const { x, y, r } = palette.moon
        const cx = x * W
        const cy = y * H
        const radius = r * W
        const halo = ctx.createRadialGradient(cx, cy, radius, cx, cy, radius * 5)
        halo.addColorStop(0, 'rgba(200, 220, 255, 0.25)')
        halo.addColorStop(1, 'rgba(200, 220, 255, 0)')
        ctx.fillStyle = halo
        ctx.fillRect(0, 0, W, H)
        // Crescent: a disc with an offset disc removed.
        ctx.save()
        ctx.beginPath()
        ctx.arc(cx, cy, radius, 0, Math.PI * 2)
        ctx.clip()
        ctx.fillStyle = '#f1f5ff'
        ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2)
        ctx.globalCompositeOperation = 'destination-out'
        ctx.beginPath()
        ctx.arc(cx - radius * 0.45, cy - radius * 0.2, radius * 0.95, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
    }

    if (palette.clouds) {
        // Soft cumulus: many overlapping radial-gradient puffs, flatter at the base.
        for (let c = 0; c < 4; c++) {
            const cx = (0.12 + random() * 0.76) * W
            const cy = (0.14 + random() * 0.26) * H
            const size = (0.06 + random() * 0.05) * W
            for (let i = 0; i < 14; i++) {
                const px = cx + (random() - 0.5) * size * 3.2
                const py = cy - random() * size * 0.7
                const r = size * (0.45 + random() * 0.55)
                const puff = ctx.createRadialGradient(px, py, 0, px, py, r)
                puff.addColorStop(0, 'rgba(255, 255, 255, 0.55)')
                puff.addColorStop(0.6, 'rgba(255, 255, 255, 0.35)')
                puff.addColorStop(1, 'rgba(255, 255, 255, 0)')
                ctx.fillStyle = puff
                ctx.fillRect(px - r, py - r, r * 2, r * 2)
            }
        }
    }

    // Mountain ridges from far to near, with mist between them.
    const count = palette.layers.length
    for (let layer = 0; layer < count; layer++) {
        const depth = layer / (count - 1)
        const base = horizon + depth * H * 0.26
        const amplitude = H * (0.035 + depth * 0.045)
        const waves = Array.from({ length: 4 }, (_, k) => ({
            f: (0.6 + random() * 1.4) * (k + 1) * Math.PI * 2 / W,
            p: random() * Math.PI * 2,
            a: amplitude / (k + 1.2),
        }))
        const ridge = (x) => {
            let y = base
            for (const w of waves) y -= Math.sin(x * w.f + w.p) * w.a
            if (layer === 0) {
                // Sindoro and Sumbing, the twin volcanoes on the horizon.
                for (const cone of [{ x: 0.27, height: 0.27, slope: 0.78 }, { x: 0.58, height: 0.23, slope: 0.74 }]) {
                    const dx = x - cone.x * W
                    const tip = W * 0.025
                    const coneY = base - cone.height * W + (Math.sqrt(dx * dx + tip * tip) - tip) * cone.slope
                    y = Math.min(y, coneY)
                }
            }
            return y
        }

        ctx.beginPath()
        ctx.moveTo(0, H)
        for (let x = 0; x <= W; x += 6) ctx.lineTo(x, ridge(x))
        ctx.lineTo(W, H)
        ctx.closePath()
        ctx.fillStyle = palette.layers[layer]
        ctx.fill()

        if (layer < count - 1) {
            const mistTop = base - amplitude * 0.6
            const mistBottom = base + H * 0.1
            ctx.fillStyle = verticalGradient(ctx, mistTop, mistBottom, [[0, 'rgba(255, 255, 255, 0)'], [0.55, palette.mist], [1, 'rgba(255, 255, 255, 0)']])
            ctx.fillRect(0, mistTop, W, mistBottom - mistTop)
        }
    }
    return canvas
}

const landscapeCache = new Map()

export function drawLandscape(ctx, scene) {
    const palette = paletteFor(scene.data.hour)
    const key = `${scene.W}x${scene.H}:${palette}`
    let layer = landscapeCache.get(key)
    if (!layer) {
        layer = paintLandscape(scene.W, scene.H, PALETTES[palette])
        landscapeCache.set(key, layer)
        // Each layer is a full-size canvas; keep phone memory in check.
        if (landscapeCache.size > 4) landscapeCache.delete(landscapeCache.keys().next().value)
    }
    ctx.drawImage(layer, 0, 0, scene.W, scene.H)
}
