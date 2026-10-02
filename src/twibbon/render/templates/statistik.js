// "Statistik" — Strava-style activity card: big stat columns, a 24-hour
// temperature trace as the "route", and the place + time as the title.

import { TREND_HASHTAG } from '../../config.js'
import {
    BODY, CAP, DISPLAY, clearShadow, drawBadgePill, drawBrand, drawText, drawTrace,
    fitLine, setFont, setShadow, textWidth, verticalGradient,
} from '../draw.js'

const LABEL = 'rgba(255, 255, 255, 0.72)'

// Label above a big value with a smaller unit, Strava style.
function drawStat(ctx, s, x, labelY, valueY, maxWidth, { label, value, unit, size }) {
    setFont(ctx, 20, 700, BODY)
    ctx.fillStyle = LABEL
    drawText(ctx, label, x, labelY, { spacing: 2.5 })

    let valueSize = size
    const measure = () => {
        setFont(ctx, valueSize * 0.42, 600, DISPLAY)
        const unitWidth = unit ? textWidth(ctx, unit) + valueSize * 0.06 : 0
        setFont(ctx, valueSize, 700, DISPLAY)
        return textWidth(ctx, value) + unitWidth
    }
    const width = measure()
    if (width > maxWidth) {
        valueSize *= maxWidth / width
        measure()
    }
    ctx.fillStyle = '#ffffff'
    const valueWidth = drawText(ctx, value, x, valueY)
    if (unit) {
        setFont(ctx, valueSize * 0.42, 600, DISPLAY)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.82)'
        drawText(ctx, unit, x + valueWidth + valueSize * 0.06, valueY)
    }
}

export default {
    id: 'statistik',
    name: 'Statistik',
    hint: 'Gaya Strava',
    draw(ctx, s) {
        const { W, H, safe, data, spot } = s
        const left = safe.x
        const width = W - safe.x * 2
        const story = s.format === 'story'
        const chartHeight = story ? 200 : s.format === 'feed' ? 130 : 0
        const showChart = chartHeight > 0 && data.trace.length >= 3

        // Lay out bottom-up (all y values are text baselines).
        let y = H - safe.bottom
        const footerY = y
        y -= 24 * CAP + 34
        const dividerY = y
        y -= 38
        let row2 = null
        if (story) {
            row2 = { value: y }
            y -= 50 * CAP + 14
            row2.label = y
            y -= 20 * CAP + 54
        }
        const row1 = { value: y }
        y -= 100 * CAP + 16
        row1.label = y
        y -= 20 * CAP + 52
        const metaY = y
        y -= 28 * CAP + 18
        const titleY = y
        y -= 64 * CAP
        let chart = null
        if (showChart) {
            y -= 48
            chart = { x: left, y: y - chartHeight, w: width, h: chartHeight }
            y -= chartHeight + 18
            chart.labelY = y
            y -= 20 * CAP
        }
        const contentTop = y

        // Scrims for legibility over any photo.
        ctx.fillStyle = verticalGradient(ctx, 0, safe.top + 220, [[0, 'rgba(4, 9, 20, 0.5)'], [1, 'rgba(4, 9, 20, 0)']])
        ctx.fillRect(0, 0, W, safe.top + 220)
        const scrimTop = contentTop - 260
        ctx.fillStyle = verticalGradient(ctx, scrimTop, H, [[0, 'rgba(4, 9, 20, 0)'], [0.32, 'rgba(4, 9, 20, 0.55)'], [1, 'rgba(4, 9, 20, 0.9)']])
        ctx.fillRect(0, scrimTop, W, H - scrimTop)

        setShadow(ctx, s, 16, 'rgba(0, 0, 0, 0.35)')
        drawBrand(ctx, s, left, safe.top)
        clearShadow(ctx)
        if (data.badge) drawBadgePill(ctx, s, W - safe.x, safe.top - 2, data.badge, { size: 0.92, align: 'right' })

        if (chart) {
            setFont(ctx, 20, 700, BODY)
            ctx.fillStyle = LABEL
            drawText(ctx, data.mode === 'history' ? 'SUHU 24 JAM SEBELUMNYA' : 'SUHU 24 JAM TERAKHIR', left, chart.labelY, { spacing: 2.5 })
            drawTrace(ctx, s, data.trace, chart, {
                start: data.traceStart,
                end: data.traceEnd,
                minText: data.minText ? `${data.minText}° · ${data.minTime}` : null,
            })
        }

        setShadow(ctx, s, 12, 'rgba(0, 0, 0, 0.3)')
        const title = fitLine(ctx, s.caption || spot.name, width, { size: 64, min: 40, weight: 700, family: DISPLAY })
        ctx.fillStyle = '#ffffff'
        drawText(ctx, title.text, left, titleY)

        const meta = [s.caption ? spot.name : null, data.dateLong, `${data.time} WIB`].filter(Boolean).join('  ·  ')
        const metaLine = fitLine(ctx, meta, width, { size: 28, min: 22, weight: 500 })
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'
        drawText(ctx, metaLine.text, left, metaY)
        clearShadow(ctx)

        const columns = [left, left + width * 0.42, left + width * 0.71]
        const columnWidth = (i) => (i < 2 ? columns[i + 1] - columns[i] - 24 : left + width - columns[i])
        drawStat(ctx, s, columns[0], row1.label, row1.value, columnWidth(0), { label: 'SUHU', value: data.tempText, unit: '°C', size: 100 })
        drawStat(ctx, s, columns[1], row1.label, row1.value, columnWidth(1), { label: 'KELEMBAPAN', value: data.humidityText.replace('%', ''), unit: data.ready ? '%' : '', size: 64 })
        if (spot.elevation) {
            drawStat(ctx, s, columns[2], row1.label, row1.value, columnWidth(2), { label: 'KETINGGIAN', value: spot.elevationText.replace(' mdpl', ''), unit: 'mdpl', size: 64 })
        } else {
            drawStat(ctx, s, columns[2], row1.label, row1.value, columnWidth(2), { label: 'KONDISI', value: data.kondisi ?? '--', size: 48 })
        }

        if (row2) {
            drawStat(ctx, s, columns[0], row2.label, row2.value, columnWidth(0), {
                label: 'TERENDAH 24 JAM',
                value: data.minText ?? '--',
                unit: data.minText ? `°C  ${data.minTime}` : '',
                size: 50,
            })
            drawStat(ctx, s, columns[1], row2.label, row2.value, columnWidth(1), { label: 'KONDISI', value: data.kondisi ?? '--', size: 44 })
            drawStat(ctx, s, columns[2], row2.label, row2.value, columnWidth(2), {
                label: 'TEKANAN',
                value: data.pressureText.replace(' mBar', ''),
                unit: data.ready ? 'mBar' : '',
                size: 44,
            })
        }

        ctx.fillStyle = 'rgba(255, 255, 255, 0.22)'
        ctx.fillRect(left, dividerY, width, 2)

        setFont(ctx, 24, 700, BODY)
        ctx.fillStyle = '#ffffff'
        drawText(ctx, TREND_HASHTAG, left, footerY)
        if (s.host) {
            setFont(ctx, 24, 500, BODY)
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
            drawText(ctx, s.host, W - safe.x, footerY, { align: 'right' })
        }
    },
}
