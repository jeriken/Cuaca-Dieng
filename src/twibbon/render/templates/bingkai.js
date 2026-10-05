// "Bingkai" — the classic twibbon: a branded frame around the photo with a
// temperature seal stamped on the corner of the photo window.

import { BRAND_HANDLE, SITE_URL } from '../../config.js'
import {
    AMBER, BODY, CAP, DISPLAY, NAVY, clearShadow, drawArcText, drawBrand,
    drawContours, drawIcon, drawText, fitLine, roundRectPath, setFont, setShadow, textWidth, verticalGradient,
} from '../draw.js'

const GEOMETRY = {
    story: { side: 44, top: 270, bottom: 600, seal: 150, radius: 40, brandTop: 150, brand: 1, tagline: 244 },
    feed: { side: 40, top: 160, bottom: 410, seal: 124, radius: 36, brandTop: 40, brand: 1, tagline: 132 },
    square: { side: 36, top: 128, bottom: 336, seal: 106, radius: 32, brandTop: 26, brand: 0.86, tagline: 108 },
}

const contourCache = new Map()

function contourLayer(W, H) {
    const key = `${W}x${H}`
    if (!contourCache.has(key)) {
        const canvas = document.createElement('canvas')
        canvas.width = W
        canvas.height = H
        drawContours(canvas.getContext('2d'), W, H, { color: 'rgba(255, 255, 255, 0.075)', lineWidth: 2 })
        contourCache.set(key, canvas)
    }
    return contourCache.get(key)
}

function drawSeal(ctx, s, cx, cy, r) {
    const { data } = s
    ctx.save()
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.fillStyle = verticalGradient(ctx, cy - r, cy + r, [[0, '#fde68a'], [1, '#f59e0b']])
    setShadow(ctx, s, 30, 'rgba(0, 0, 0, 0.4)', 8)
    ctx.fill()
    clearShadow(ctx)

    setFont(ctx, r * 0.118, 700, BODY)
    ctx.fillStyle = NAVY
    drawArcText(ctx, `SUHU DIENG • ${data.dateNum} • ${data.time} WIB • `, cx, cy, r * 0.8, -Math.PI / 2, { fill: true })

    ctx.beginPath()
    ctx.arc(cx, cy, r * 0.66, 0, Math.PI * 2)
    ctx.fillStyle = NAVY
    ctx.fill()
    ctx.lineWidth = r * 0.025
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.7)'
    ctx.stroke()

    const text = `${data.tempText}°`
    const fit = fitLine(ctx, text, r * 1.08, { size: r * 0.5, min: r * 0.28, weight: 700, family: DISPLAY })
    ctx.fillStyle = '#ffffff'
    drawText(ctx, fit.text, cx, cy + fit.size * CAP * 0.38, { align: 'center' })

    setFont(ctx, r * 0.1, 700, BODY)
    ctx.fillStyle = AMBER
    drawText(ctx, 'CELSIUS', cx, cy + r * 0.42, { align: 'center', spacing: r * 0.02 })
    if (data.ready && data.temp < 6) drawIcon(ctx, 'frost', cx - r * 0.09, cy - r * 0.5, r * 0.18, AMBER, 2.4)
    ctx.restore()
}

export default {
    id: 'bingkai',
    name: 'Bingkai',
    hint: 'Gaya klasik',
    draw(ctx, s) {
        const { W, H, data, spot } = s
        const g = GEOMETRY[s.format]
        const win = { x: g.side, y: g.top, w: W - g.side * 2, h: H - g.top - g.bottom }

        // Frame: everything except the rounded photo window.
        ctx.save()
        ctx.beginPath()
        ctx.rect(0, 0, W, H)
        roundRectPath(ctx, win.x, win.y, win.w, win.h, g.radius)
        ctx.clip('evenodd')
        ctx.fillStyle = verticalGradient(ctx, 0, H, [[0, '#0b1a36'], [0.55, '#0e2448'], [1, '#081329']])
        ctx.fillRect(0, 0, W, H)
        ctx.drawImage(contourLayer(W, H), 0, 0, W, H)
        ctx.restore()

        ctx.beginPath()
        roundRectPath(ctx, win.x, win.y, win.w, win.h, g.radius)
        ctx.lineWidth = 4
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)'
        ctx.stroke()

        drawBrand(ctx, s, W / 2, g.brandTop, { size: g.brand, align: 'center' })
        setFont(ctx, 20 * g.brand, 700, BODY)
        ctx.fillStyle = AMBER
        drawText(ctx, 'NEGERI DI ATAS AWAN', W / 2, g.tagline, { align: 'center', spacing: 7 * g.brand })

        const sealX = W - g.side - g.seal * 1.05
        const sealY = win.y + win.h
        drawSeal(ctx, s, sealX, sealY, g.seal)

        // Text block under the window; lines level with the seal stop short of it.
        const left = g.side + 30
        const fullWidth = W - left * 2
        const besideSeal = sealX - g.seal - 28 - left
        const k = s.format === 'story' ? 1 : s.format === 'feed' ? 0.86 : 0.76

        let y = sealY + 52 * k + 24 * k * CAP
        setFont(ctx, 24 * k, 700, BODY)
        ctx.fillStyle = AMBER
        drawText(ctx, 'JEJAKKU DI', left, y, { spacing: 6 * k })

        const nameSize = 76 * k
        y += 20 * k + nameSize * CAP
        const name = fitLine(ctx, spot.name.toUpperCase(), besideSeal, { size: nameSize, min: nameSize * 0.55, weight: 700, family: DISPLAY })
        ctx.fillStyle = '#ffffff'
        drawText(ctx, name.text, left, y)

        y += 30 * k + 24 * k * CAP
        const meta = [spot.elevationText?.toUpperCase(), data.dateShort.toUpperCase(), `${data.time} WIB`].filter(Boolean).join('  •  ')
        const metaTop = y - 24 * k * CAP
        const metaLine = fitLine(ctx, meta, metaTop < sealY + g.seal + 8 ? besideSeal : fullWidth, { size: 24 * k, min: 17 * k, weight: 600, spacing: 1.5 * k })
        ctx.fillStyle = 'rgba(255, 255, 255, 0.82)'
        drawText(ctx, metaLine.text, left, y, { spacing: 1.5 * k })

        if (s.caption) {
            y += 26 * k + 32 * k * CAP
            const caption = fitLine(ctx, `“${s.caption}”`, fullWidth, { size: 32 * k, min: 22 * k, weight: 600 })
            ctx.fillStyle = '#ffffff'
            drawText(ctx, caption.text, left, y)
        }

        // Site URL + handle.
        const pillHeight = 60 * k
        const bottomMargin = s.format === 'story' ? 230 : 44 * k
        const pillY = H - bottomMargin - pillHeight
        setFont(ctx, 25 * k, 700, BODY)
        const tagWidth = textWidth(ctx, SITE_URL) + 44 * k
        ctx.beginPath()
        roundRectPath(ctx, left, pillY, tagWidth, pillHeight, pillHeight / 2)
        ctx.fillStyle = AMBER
        ctx.fill()
        ctx.fillStyle = NAVY
        drawText(ctx, SITE_URL, left + 22 * k, pillY + pillHeight / 2 + 25 * k * CAP / 2)

        const handleX = left + tagWidth + 18 * k
        setFont(ctx, 24 * k, 600, BODY)
        if (handleX + textWidth(ctx, BRAND_HANDLE) < W - left) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
            drawText(ctx, BRAND_HANDLE, handleX, pillY + pillHeight / 2 + 24 * k * CAP / 2)
        }
    },
}
