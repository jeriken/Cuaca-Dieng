// Termometer sticker — a die-cut thermometer whose mercury shows the reading,
// with the numbers beside it.

import { BRAND_HANDLE, SITE_URL } from '../../../config.js'
import {
    AMBER, BODY, CAP, DISPLAY, NAVY, SKY, clearShadow, drawBrand, drawIcon, drawText,
    fitLine, setFont, setShadow, verticalGradient,
} from '../../draw.js'
import { DIE_CUT, SHADOW, STICKER } from './common.js'

const TUBE = { cx: 240, top: 110, bottom: 800, half: 48 }
const BULB = { cy: 880, r: 104 }
const TRACK = { half: 24, top: TUBE.top + 34, bottom: BULB.cy }
const EDGE = 22
const SCALE = { min: -5, max: 25, step: 5 }

function bodyPath(ctx, grow) {
    const half = TUBE.half + grow
    const r = BULB.r + grow
    const top = TUBE.top - grow
    // Tube with a rounded top, flowing into the bulb.
    const join = Math.asin(half / r)
    ctx.moveTo(TUBE.cx - half, top + half)
    ctx.arc(TUBE.cx, top + half, half, Math.PI, 0)
    ctx.lineTo(TUBE.cx + half, BULB.cy - Math.cos(join) * r)
    ctx.arc(TUBE.cx, BULB.cy, r, -Math.PI / 2 + join, Math.PI * 1.5 - join)
    ctx.closePath()
}

export default {
    ...STICKER,
    id: 'stiker-termometer',
    name: 'Termometer',
    hint: 'Air raksa',
    size: { width: 1080, height: 1080 },
    safe: { top: 60, bottom: 60, x: 72 },
    draw(ctx, s) {
        const { W, data, spot } = s
        const { cx } = TUBE

        // Die-cut white body.
        ctx.beginPath()
        bodyPath(ctx, EDGE)
        setShadow(ctx, s, 36, DIE_CUT, 10)
        ctx.fillStyle = '#ffffff'
        ctx.fill()
        clearShadow(ctx)

        // Empty glass channel.
        const levelTop = TRACK.top + TRACK.half
        const levelBottom = TUBE.bottom - 20
        ctx.beginPath()
        ctx.arc(cx, BULB.cy, BULB.r - 22, 0, Math.PI * 2)
        ctx.rect(cx - TRACK.half, TRACK.top + TRACK.half, TRACK.half * 2, BULB.cy - TRACK.top - TRACK.half)
        ctx.arc(cx, TRACK.top + TRACK.half, TRACK.half, Math.PI, 0)
        ctx.fillStyle = '#e2e8f0'
        ctx.fill()

        // Mercury: cold readings stay blue, warmer ones run into amber.
        const t = data.ready ? Math.min(1, Math.max(0, (data.temp - SCALE.min) / (SCALE.max - SCALE.min))) : 0
        const levelY = levelBottom - t * (levelBottom - levelTop)
        const mercury = verticalGradient(ctx, levelTop, BULB.cy + BULB.r, [[0, '#f97316'], [0.45, AMBER], [0.8, SKY], [1, '#0284c7']])
        ctx.beginPath()
        ctx.arc(cx, BULB.cy, BULB.r - 36, 0, Math.PI * 2)
        ctx.rect(cx - TRACK.half + 9, levelY, (TRACK.half - 9) * 2, BULB.cy - levelY)
        ctx.arc(cx, levelY, TRACK.half - 9, Math.PI, 0)
        ctx.fillStyle = mercury
        ctx.fill()

        // Scale ticks inside the body, labels outside.
        const tickY = (v) => levelBottom - ((v - SCALE.min) / (SCALE.max - SCALE.min)) * (levelBottom - levelTop)
        setFont(ctx, 26, 700, BODY)
        for (let v = SCALE.min; v <= SCALE.max; v += SCALE.step) {
            const y = tickY(v)
            ctx.fillStyle = NAVY
            ctx.fillRect(cx + TRACK.half + 6, y - 2, 14, 4)
            setShadow(ctx, s, 10, SHADOW, 2)
            ctx.fillStyle = '#ffffff'
            drawText(ctx, `${v < 0 ? '−' : ''}${Math.abs(v)}°`, cx + TUBE.half + EDGE + 18, y + 26 * CAP / 2)
            clearShadow(ctx)
        }

        // Numbers.
        const left = 470
        const width = W - 72 - left
        setShadow(ctx, s, 16, SHADOW, 2)
        drawBrand(ctx, s, left, 116, { size: 0.82 })

        let y = 290
        setFont(ctx, 26, 700, BODY)
        ctx.fillStyle = AMBER
        drawText(ctx, data.mode === 'history' ? 'SUHU DIENG SAAT ITU' : 'SUHU DIENG SAAT INI', left, y, { spacing: 4 })

        const big = fitLine(ctx, `${data.tempText}°`, width, { size: 220, min: 130, weight: 700, family: DISPLAY })
        y += 34 + big.size * CAP
        ctx.fillStyle = data.ready ? '#ffffff' : 'rgba(255, 255, 255, 0.45)'
        setShadow(ctx, s, 30, SHADOW, 5)
        drawText(ctx, big.text, left - big.size * 0.03, y)

        setShadow(ctx, s, 16, SHADOW, 2)
        y += 76
        const condition = fitLine(ctx, data.kondisi ?? 'Celsius', width, { size: 40, min: 26, weight: 600, family: DISPLAY })
        ctx.fillStyle = '#ffffff'
        drawText(ctx, condition.text, left, y)

        y += 92
        const pin = 38
        drawIcon(ctx, 'pin', left - 4, y - pin * 0.8, pin, AMBER, 2.4)
        const name = fitLine(ctx, spot.name, width - pin - 8, { size: 44, min: 28, weight: 700, family: DISPLAY })
        ctx.fillStyle = '#ffffff'
        drawText(ctx, name.text, left + pin + 8, y)

        const lines = [
            [spot.elevationText, data.dateShort].filter(Boolean).join('  ·  '),
            [`${data.time} WIB`, data.ready ? `Kelembapan ${data.humidityText}` : null].filter(Boolean).join('  ·  '),
        ]
        ctx.fillStyle = 'rgba(255, 255, 255, 0.92)'
        for (const line of lines) {
            y += 46
            drawText(ctx, fitLine(ctx, line, width, { size: 28, min: 20, weight: 600 }).text, left, y)
        }

        setFont(ctx, 26, 700, BODY)
        ctx.fillStyle = '#ffffff'
        drawText(ctx, SITE_URL, left, BULB.cy + 30)
        setFont(ctx, 24, 600, BODY)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
        drawText(ctx, BRAND_HANDLE, left, BULB.cy + 70)
        clearShadow(ctx)
    },
}
