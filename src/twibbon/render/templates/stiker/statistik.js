// Statistik sticker — Strava-style story sticker to paste on top of any photo
// or video in an Instagram story.

import { BRAND_HANDLE, SITE_URL } from '../../../config.js'
import {
    AMBER, BODY, CAP, DISPLAY, clearShadow, drawBrand, drawIcon, drawText,
    drawTrace, fitLine, setFont, setShadow, textWidth,
} from '../../draw.js'
import { SHADOW, STICKER } from './common.js'

export default {
    ...STICKER,
    id: 'stiker-statistik',
    pair: 'statistik', // the photo design it comes from
    name: 'Statistik',
    hint: 'Gaya Strava',
    size: { width: 1080, height: 1000 },
    safe: { top: 56, bottom: 56, x: 72 },
    draw(ctx, s) {
        const { W, data, spot } = s
        const center = W / 2
        const width = W - 144

        setShadow(ctx, s, 18, SHADOW, 2)
        drawBrand(ctx, s, center, 56, { align: 'center' })

        const temp = fitLine(ctx, `${data.tempText}°C`, width, { size: 236, min: 140, weight: 700, family: DISPLAY })
        const tempY = 56 + 58 + 36 + temp.size * CAP
        ctx.fillStyle = '#ffffff'
        setShadow(ctx, s, 30, SHADOW, 4)
        drawText(ctx, temp.text, center, tempY, { align: 'center' })

        setShadow(ctx, s, 16, SHADOW, 2)
        const spotText = [spot.name, spot.elevationText].filter(Boolean).join('  ·  ')
        const spotLine = fitLine(ctx, spotText, width - 48, { size: 40, min: 28, weight: 700, family: DISPLAY })
        const spotWidth = textWidth(ctx, spotLine.text)
        const pin = 38
        const spotY = tempY + 74
        drawText(ctx, spotLine.text, center + (pin + 8) / 2, spotY, { align: 'center' })
        drawIcon(ctx, 'pin', center - (spotWidth + pin + 8) / 2, spotY - pin * 0.8, pin, AMBER, 2.4)

        setFont(ctx, 28, 500, BODY)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.92)'
        drawText(ctx, `${data.dateLong}  ·  ${data.time} WIB`, center, spotY + 50, { align: 'center' })
        clearShadow(ctx)

        const chart = { x: 110, y: spotY + 92, w: W - 220, h: 150 }
        const hasChart = drawTrace(ctx, s, data.trace, chart, {
            start: data.traceStart,
            end: data.traceEnd,
            minText: data.minText ? `${data.minText}° · ${data.minTime}` : null,
            area: false,
        })

        const statsTop = hasChart ? chart.y + chart.h + 44 : spotY + 110
        const stats = [
            { label: 'KELEMBAPAN', value: data.humidityText },
            { label: 'TERENDAH 24 JAM', value: data.minText ? `${data.minText}°C` : '--' },
            { label: 'KONDISI', value: data.kondisi ?? '--' },
        ]
        const columnWidth = width / 3
        setShadow(ctx, s, 14, SHADOW, 2)
        stats.forEach((stat, i) => {
            const cx = 72 + columnWidth * (i + 0.5)
            setFont(ctx, 20, 700, BODY)
            ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'
            drawText(ctx, stat.label, cx, statsTop + 20 * CAP, { align: 'center', spacing: 2.5 })
            const value = fitLine(ctx, stat.value, columnWidth - 24, { size: 48, min: 30, weight: 700, family: DISPLAY })
            ctx.fillStyle = '#ffffff'
            drawText(ctx, value.text, cx, statsTop + 20 * CAP + 16 + value.size * CAP, { align: 'center' })
        })
        clearShadow(ctx)

        setShadow(ctx, s, 14, SHADOW, 2)
        setFont(ctx, 28, 700, BODY)
        ctx.fillStyle = '#ffffff'
        const footer = `${SITE_URL}  ·  ${BRAND_HANDLE}`
        drawText(ctx, footer, center, statsTop + 110 + 62 + 64, { align: 'center' })
        clearShadow(ctx)
    },
}
