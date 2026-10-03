// Canvas drawing primitives shared by the twibbon templates.
// Templates draw in a 1080px-wide design space; `scene.scale` is the extra
// transform applied for thumbnails (shadows don't follow the transform, so we scale them).

import { BRAND_NAME } from '../config.js'

export const DISPLAY = '"Space Grotesk", "Plus Jakarta Sans", system-ui, sans-serif'
export const BODY = '"Plus Jakarta Sans", system-ui, sans-serif'
export const CAP = 0.72 // approximate cap height of both fonts, as a fraction of the size

export const NAVY = '#0b1730'
export const AMBER = '#fbbf24'
export const SKY = '#38bdf8'

export function setFont(ctx, size, weight = 500, family = BODY) {
    ctx.font = `${weight} ${Math.max(1, Math.round(size))}px ${family}`
}

const segmenter = typeof Intl !== 'undefined' && Intl.Segmenter
    ? new Intl.Segmenter(undefined, { granularity: 'grapheme' })
    : null

export const graphemes = (text) => (segmenter ? Array.from(segmenter.segment(text), s => s.segment) : Array.from(text))

export function textWidth(ctx, text, spacing = 0) {
    if (!text) return 0
    if (!spacing) return ctx.measureText(text).width
    const chars = graphemes(text)
    return chars.reduce((sum, ch) => sum + ctx.measureText(ch).width, 0) + spacing * (chars.length - 1)
}

// fillText with optional letter-spacing and alignment. Returns the drawn width.
export function drawText(ctx, text, x, y, { align = 'left', spacing = 0 } = {}) {
    if (!text) return 0
    const width = textWidth(ctx, text, spacing)
    let cursor = align === 'center' ? x - width / 2 : align === 'right' ? x - width : x
    ctx.textAlign = 'left'
    if (!spacing) {
        ctx.fillText(text, cursor, y)
        return width
    }
    for (const ch of graphemes(text)) {
        ctx.fillText(ch, cursor, y)
        cursor += ctx.measureText(ch).width + spacing
    }
    return width
}

export function ellipsize(ctx, text, maxWidth, spacing = 0) {
    if (textWidth(ctx, text, spacing) <= maxWidth) return text
    const chars = graphemes(text)
    while (chars.length > 1 && textWidth(ctx, `${chars.join('').trimEnd()}…`, spacing) > maxWidth) chars.pop()
    return `${chars.join('').trimEnd()}…`
}

// Shrinks the font until `text` fits, then ellipsizes as a last resort.
// Leaves ctx.font set and returns { text, size }.
export function fitLine(ctx, text, maxWidth, { size, min = Math.round(size * 0.6), weight = 500, family = BODY, spacing = 0 }) {
    let current = size
    setFont(ctx, current, weight, family)
    const width = textWidth(ctx, text, spacing)
    if (width > maxWidth) {
        current = Math.max(min, Math.floor(size * maxWidth / width))
        setFont(ctx, current, weight, family)
        while (current > min && textWidth(ctx, text, spacing) > maxWidth) {
            current -= 1
            setFont(ctx, current, weight, family)
        }
    }
    return { text: ellipsize(ctx, text, maxWidth, spacing), size: current }
}

export function setShadow(ctx, scene, blur, color = 'rgba(0, 0, 0, 0.35)', offsetY = 0) {
    ctx.shadowColor = color
    ctx.shadowBlur = blur * scene.scale
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = offsetY * scene.scale
}

export function clearShadow(ctx) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0)'
    ctx.shadowBlur = 0
    ctx.shadowOffsetY = 0
}

export function roundRectPath(ctx, x, y, w, h, radius) {
    const [tl, tr, br, bl] = Array.isArray(radius) ? radius : [radius, radius, radius, radius]
    ctx.moveTo(x + tl, y)
    ctx.lineTo(x + w - tr, y)
    ctx.arcTo(x + w, y, x + w, y + tr, tr)
    ctx.lineTo(x + w, y + h - br)
    ctx.arcTo(x + w, y + h, x + w - br, y + h, br)
    ctx.lineTo(x + bl, y + h)
    ctx.arcTo(x, y + h, x, y + h - bl, bl)
    ctx.lineTo(x, y + tl)
    ctx.arcTo(x, y, x + tl, y, tl)
    ctx.closePath()
}

export function verticalGradient(ctx, y0, y1, stops) {
    const gradient = ctx.createLinearGradient(0, y0, 0, y1)
    for (const [offset, color] of stops) gradient.addColorStop(offset, color)
    return gradient
}

// Deterministic randomness so the same inputs always produce the same image.
export function hashString(text) {
    let h = 2166136261
    for (let i = 0; i < text.length; i++) {
        h ^= text.charCodeAt(i)
        h = Math.imul(h, 16777619)
    }
    return h >>> 0
}

export function mulberry32(seed) {
    let a = seed >>> 0
    return function () {
        a = (a + 0x6D2B79F5) | 0
        let t = Math.imul(a ^ (a >>> 15), 1 | a)
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

// ---------------------------------------------------------------------------
// Icons (24×24 stroke icons, Feather/Lucide style)

function snowflakeArms(arms, branchAt, branchLength) {
    const paths = []
    for (let i = 0; i < arms; i++) {
        const a = (Math.PI * 2 * i) / arms - Math.PI / 2
        paths.push(`M12 12L${(12 + Math.cos(a) * 10).toFixed(2)} ${(12 + Math.sin(a) * 10).toFixed(2)}`)
        const bx = 12 + Math.cos(a) * branchAt
        const by = 12 + Math.sin(a) * branchAt
        for (const side of [-1, 1]) {
            const b = a + side * Math.PI / 4
            paths.push(`M${bx.toFixed(2)} ${by.toFixed(2)}L${(bx + Math.cos(b) * branchLength).toFixed(2)} ${(by + Math.sin(b) * branchLength).toFixed(2)}`)
        }
    }
    return paths
}

export const ICON_PATHS = {
    thermometer: ['M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z'],
    pin: ['M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z', 'M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z'],
    snowflake: snowflakeArms(8, 6.2, 2.6),
    frost: snowflakeArms(6, 5.6, 3.4),
    sun: [
        'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z',
        'M12 1v2', 'M12 21v2', 'M4.22 4.22l1.42 1.42', 'M18.36 18.36l1.42 1.42',
        'M1 12h2', 'M21 12h2', 'M4.22 19.78l1.42-1.42', 'M18.36 5.64l1.42-1.42',
    ],
    leaf: [
        'M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z',
        'M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12',
    ],
}

const iconCache = new Map()

export function drawIcon(ctx, name, x, y, size, color, weight = 2) {
    if (!ICON_PATHS[name] || typeof Path2D === 'undefined') return
    if (!iconCache.has(name)) iconCache.set(name, ICON_PATHS[name].map(d => new Path2D(d)))
    ctx.save()
    ctx.translate(x, y)
    ctx.scale(size / 24, size / 24)
    ctx.strokeStyle = color
    ctx.lineWidth = weight
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    for (const path of iconCache.get(name)) ctx.stroke(path)
    ctx.restore()
}

// ---------------------------------------------------------------------------
// Brand

const LOGO_RATIO = 512 / 400 // /img/summertime.png

export function drawLogo(ctx, scene, x, y, height) {
    const width = height * LOGO_RATIO
    const logo = scene.assets?.logo
    if (logo) {
        ctx.drawImage(logo, x, y, width, height)
    } else {
        ctx.beginPath()
        ctx.arc(x + width * 0.5, y + height * 0.45, height * 0.32, 0, Math.PI * 2)
        ctx.fillStyle = AMBER
        ctx.fill()
    }
    return width
}

// Logo + "CUACA DIENG" wordmark; (x, y) is the top edge at the given alignment.
export function drawBrand(ctx, scene, x, y, { size = 1, align = 'left', color = '#ffffff' } = {}) {
    const logoHeight = 58 * size
    const logoWidth = logoHeight * LOGO_RATIO
    const gap = 12 * size
    const spacing = 4 * size
    setFont(ctx, 29 * size, 700, DISPLAY)
    const nameWidth = textWidth(ctx, BRAND_NAME, spacing)
    const total = logoWidth + gap + nameWidth
    const left = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x

    drawLogo(ctx, scene, left, y, logoHeight)
    ctx.fillStyle = color
    drawText(ctx, BRAND_NAME, left + logoWidth + gap, y + logoHeight / 2 + 29 * size * CAP / 2, { spacing })
    return { width: total, height: logoHeight }
}

// ---------------------------------------------------------------------------
// Badges

function hexagonPath(ctx, cx, cy, r) {
    const points = Array.from({ length: 6 }, (_, i) => {
        const a = (Math.PI / 3) * i - Math.PI / 2
        return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]
    })
    const corner = r * 0.2
    ctx.moveTo((points[5][0] + points[0][0]) / 2, (points[5][1] + points[0][1]) / 2)
    for (let i = 0; i < 6; i++) {
        const p = points[i]
        const next = points[(i + 1) % 6]
        ctx.arcTo(p[0], p[1], (p[0] + next[0]) / 2, (p[1] + next[1]) / 2, corner)
    }
    ctx.closePath()
}

export function drawEmblem(ctx, scene, cx, cy, r, badge) {
    ctx.save()
    ctx.beginPath()
    hexagonPath(ctx, cx, cy, r)
    ctx.fillStyle = verticalGradient(ctx, cy - r, cy + r, [[0, badge.color], [1, badge.color2]])
    setShadow(ctx, scene, 14, 'rgba(0, 0, 0, 0.3)', 3)
    ctx.fill()
    clearShadow(ctx)
    ctx.lineWidth = Math.max(1, r * 0.08)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'
    ctx.stroke()

    // Soft highlight on the upper half for a minted-medal look.
    ctx.clip()
    ctx.fillStyle = 'rgba(255, 255, 255, 0.16)'
    ctx.fillRect(cx - r, cy - r, r * 2, r * 0.9)
    ctx.restore()

    const iconSize = r * 1.05
    drawIcon(ctx, badge.icon, cx - iconSize / 2, cy - iconSize / 2, iconSize, '#ffffff', 2.4)
}

// Emblem + uppercase badge name in a pill. (x, y) is the pill's top edge at `align`.
export function drawBadgePill(ctx, scene, x, y, badge, { size = 1, align = 'left', theme = 'dark' } = {}) {
    const height = 62 * size
    const spacing = 2 * size
    setFont(ctx, 21 * size, 700, BODY)
    const label = badge.name.toUpperCase()
    const labelWidth = textWidth(ctx, label, spacing)
    const width = height + 4 * size + labelWidth + 26 * size
    const left = align === 'center' ? x - width / 2 : align === 'right' ? x - width : x

    ctx.beginPath()
    roundRectPath(ctx, left, y, width, height, height / 2)
    ctx.fillStyle = theme === 'dark' ? 'rgba(6, 12, 26, 0.55)' : '#ffffff'
    ctx.fill()
    ctx.lineWidth = 1.5
    ctx.strokeStyle = theme === 'dark' ? 'rgba(255, 255, 255, 0.22)' : 'rgba(11, 23, 48, 0.12)'
    ctx.stroke()

    drawEmblem(ctx, scene, left + height / 2 + 2 * size, y + height / 2, height * 0.4, badge)
    ctx.fillStyle = theme === 'dark' ? '#ffffff' : NAVY
    setFont(ctx, 21 * size, 700, BODY)
    drawText(ctx, label, left + height + 4 * size, y + height / 2 + 21 * size * CAP / 2, { spacing })
    return { width, height }
}

// ---------------------------------------------------------------------------
// Temperature trace — the "route line" of a Dieng visit.

// Monotone cubic interpolation (Fritsch–Carlson): smooth, but never overshoots,
// so the curve can't dip below the coldest real reading.
function monotoneCurve(ctx, points) {
    const n = points.length
    ctx.moveTo(points[0][0], points[0][1])
    if (n === 2) {
        ctx.lineTo(points[1][0], points[1][1])
        return
    }
    const dx = []
    const slope = []
    for (let i = 0; i < n - 1; i++) {
        dx[i] = points[i + 1][0] - points[i][0]
        slope[i] = (points[i + 1][1] - points[i][1]) / dx[i]
    }
    const tangent = [slope[0]]
    for (let i = 1; i < n - 1; i++) {
        if (slope[i - 1] * slope[i] <= 0) {
            tangent[i] = 0
        } else {
            const w1 = 2 * dx[i] + dx[i - 1]
            const w2 = dx[i] + 2 * dx[i - 1]
            tangent[i] = (w1 + w2) / (w1 / slope[i - 1] + w2 / slope[i])
        }
    }
    tangent[n - 1] = slope[n - 2]
    for (let i = 0; i < n - 1; i++) {
        const [x0, y0] = points[i]
        const [x1, y1] = points[i + 1]
        const third = dx[i] / 3
        ctx.bezierCurveTo(x0 + third, y0 + tangent[i] * third, x1 - third, y1 - tangent[i + 1] * third, x1, y1)
    }
}

const MAX_TRACE_GAP_MS = 90 * 60 * 1000 // break the line where the sensor was offline

// `minText` (e.g. "2,1° · 04.45") labels the coldest point; omit it to skip the marker.
export function drawTrace(ctx, scene, trace, box, { start, end, minText = null, labelSize = 21, area = true } = {}) {
    if (!trace || trace.length < 3) return false
    const { x, y, w, h } = box
    const t0 = start ?? trace[0].t
    const t1 = end ?? trace[trace.length - 1].t
    if (!(t1 > t0)) return false

    let vMin = Infinity
    let vMax = -Infinity
    for (const p of trace) {
        vMin = Math.min(vMin, p.v)
        vMax = Math.max(vMax, p.v)
    }
    const range = Math.max(vMax - vMin, 2)
    const mid = (vMax + vMin) / 2
    // Extra room below the minimum leaves space for its label.
    const lo = mid - range / 2 - range * 0.5
    const hi = mid + range / 2 + range * 0.12
    const px = (t) => x + ((t - t0) / (t1 - t0)) * w
    const py = (v) => y + h - ((v - lo) / (hi - lo)) * h

    const segments = []
    let current = []
    let lastT = null
    for (const p of trace) {
        if (lastT != null && p.t - lastT > MAX_TRACE_GAP_MS && current.length) {
            segments.push(current)
            current = []
        }
        const point = [px(p.t), py(p.v)]
        if (!current.length || point[0] > current[current.length - 1][0]) current.push(point)
        lastT = p.t
    }
    segments.push(current)

    const lineGradient = verticalGradient(ctx, py(vMax), py(vMin) + 1, [[0, AMBER], [0.5, '#f8fafc'], [1, SKY]])

    ctx.save()
    for (const segment of segments) {
        if (segment.length < 2) continue
        if (area) {
            ctx.beginPath()
            monotoneCurve(ctx, segment)
            ctx.lineTo(segment[segment.length - 1][0], y + h)
            ctx.lineTo(segment[0][0], y + h)
            ctx.closePath()
            ctx.fillStyle = verticalGradient(ctx, y, y + h, [[0, 'rgba(255, 255, 255, 0.16)'], [1, 'rgba(255, 255, 255, 0)']])
            ctx.fill()
        }
        ctx.beginPath()
        monotoneCurve(ctx, segment)
        ctx.lineWidth = 6
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.strokeStyle = lineGradient
        setShadow(ctx, scene, 10, 'rgba(0, 0, 0, 0.3)', 2)
        ctx.stroke()
        clearShadow(ctx)
    }

    // Coldest point of the window.
    const coldest = trace.reduce((lowest, p) => (p.v < lowest.v ? p : lowest), trace[0])
    const last = trace[trace.length - 1]
    if (minText && coldest !== last) {
        const cx = px(coldest.t)
        const cy = py(coldest.v)
        ctx.beginPath()
        ctx.arc(cx, cy, 8, 0, Math.PI * 2)
        ctx.fillStyle = SKY
        ctx.fill()
        ctx.lineWidth = 3
        ctx.strokeStyle = '#ffffff'
        ctx.stroke()

        setFont(ctx, labelSize, 700, BODY)
        const labelWidth = textWidth(ctx, minText)
        const lx = Math.min(Math.max(cx - labelWidth / 2, x), x + w - labelWidth)
        ctx.fillStyle = '#ffffff'
        setShadow(ctx, scene, 8, 'rgba(0, 0, 0, 0.5)')
        drawText(ctx, minText, lx, cy + 22 + labelSize * CAP)
        clearShadow(ctx)
    }

    // "You are here" dot at the end of the line.
    const ex = px(last.t)
    const ey = py(last.v)
    ctx.beginPath()
    ctx.arc(ex, ey, 22, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.22)'
    ctx.fill()
    ctx.beginPath()
    ctx.arc(ex, ey, 11, 0, Math.PI * 2)
    ctx.fillStyle = '#ffffff'
    setShadow(ctx, scene, 10, 'rgba(0, 0, 0, 0.35)')
    ctx.fill()
    clearShadow(ctx)
    ctx.beginPath()
    ctx.arc(ex, ey, 5.5, 0, Math.PI * 2)
    ctx.fillStyle = AMBER
    ctx.fill()
    ctx.restore()
    return true
}

// ---------------------------------------------------------------------------
// Decorations

export function drawBarcode(ctx, x, y, w, h, seedText, color) {
    const random = mulberry32(hashString(seedText))
    const unit = w / 110
    ctx.fillStyle = color
    let cursor = x
    while (cursor < x + w) {
        const bar = (1 + Math.floor(random() * 3)) * unit
        if (cursor + bar > x + w) break
        ctx.fillRect(cursor, y, bar, h)
        cursor += bar + (1 + Math.floor(random() * 2.4)) * unit
    }
}

// Topographic contour lines (marching squares over a smooth random terrain).
export function drawContours(ctx, W, H, { seed = 2093, levels = 15, cell = 18, color, lineWidth = 2 }) {
    const random = mulberry32(seed)
    const hills = Array.from({ length: 7 }, () => ({
        x: random() * W,
        y: random() * H,
        r: (0.16 + random() * 0.3) * Math.max(W, H),
        a: (random() < 0.3 ? -0.6 : 1) * (0.5 + random()),
    }))
    const height = (x, y) => {
        let v = 0.06 * Math.sin(x * 0.009 + y * 0.004)
        for (const hill of hills) {
            const dx = x - hill.x
            const dy = y - hill.y
            v += hill.a * Math.exp(-(dx * dx + dy * dy) / (2 * hill.r * hill.r))
        }
        return v
    }

    const cols = Math.ceil(W / cell) + 1
    const rows = Math.ceil(H / cell) + 1
    const grid = new Float32Array(cols * rows)
    let min = Infinity
    let max = -Infinity
    for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
            const v = height(i * cell, j * cell)
            grid[j * cols + i] = v
            min = Math.min(min, v)
            max = Math.max(max, v)
        }
    }

    ctx.beginPath()
    const segment = (p, q) => {
        ctx.moveTo(p[0], p[1])
        ctx.lineTo(q[0], q[1])
    }
    for (let level = 1; level <= levels; level++) {
        const iso = min + ((max - min) * level) / (levels + 1)
        for (let j = 0; j < rows - 1; j++) {
            for (let i = 0; i < cols - 1; i++) {
                const a = grid[j * cols + i]
                const b = grid[j * cols + i + 1]
                const c = grid[(j + 1) * cols + i + 1]
                const d = grid[(j + 1) * cols + i]
                const index = (a > iso ? 8 : 0) | (b > iso ? 4 : 0) | (c > iso ? 2 : 0) | (d > iso ? 1 : 0)
                if (index === 0 || index === 15) continue
                const x = i * cell
                const y = j * cell
                const t = (v1, v2) => (iso - v1) / (v2 - v1)
                const top = [x + cell * t(a, b), y]
                const right = [x + cell, y + cell * t(b, c)]
                const bottom = [x + cell * t(d, c), y + cell]
                const left = [x, y + cell * t(a, d)]
                switch (index) {
                    case 1: case 14: segment(left, bottom); break
                    case 2: case 13: segment(bottom, right); break
                    case 3: case 12: segment(left, right); break
                    case 4: case 11: segment(top, right); break
                    case 6: case 9: segment(top, bottom); break
                    case 7: case 8: segment(left, top); break
                    case 5: segment(left, top); segment(bottom, right); break
                    case 10: segment(left, bottom); segment(top, right); break
                }
            }
        }
    }
    ctx.strokeStyle = color
    ctx.lineWidth = lineWidth
    ctx.lineCap = 'round'
    ctx.stroke()
}

// Writes `text` clockwise around a circle, centred on `centerAngle` (radians).
// Pass `fill: true` to spread the characters evenly around the whole circle.
export function drawArcText(ctx, text, cx, cy, radius, centerAngle, { spacing = 0, fill = false } = {}) {
    const chars = graphemes(text)
    const widths = chars.map(ch => ctx.measureText(ch).width)
    const glyphs = widths.reduce((a, b) => a + b, 0)
    const gap = fill ? (Math.PI * 2 * radius - glyphs) / chars.length : spacing
    const total = glyphs + gap * (fill ? chars.length : chars.length - 1)
    let angle = centerAngle - total / radius / 2
    ctx.textAlign = 'center'
    chars.forEach((ch, i) => {
        const half = widths[i] / 2 / radius
        angle += half
        ctx.save()
        ctx.translate(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius)
        ctx.rotate(angle + Math.PI / 2)
        ctx.fillText(ch, 0, 0)
        ctx.restore()
        angle += half + gap / radius
    })
    ctx.textAlign = 'left'
}
