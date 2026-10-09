// "Tiket" — a boarding pass to Dieng, "Negeri di Atas Awan".

import { BRAND_HANDLE, SITE_URL } from '../../config.js'
import {
    AMBER, BODY, CAP, DISPLAY, NAVY, clearShadow, drawBarcode, drawBrand, drawText,
    fitLine, setFont, setShadow, textWidth, verticalGradient,
} from '../draw.js'

const SLATE = '#64748b'
const ACCENT = '#0284c7'

// Card outline with semicircle notches at the perforation, so the photo shows through.
function ticketPath(ctx, x, y, w, h, radius, notchY, notch) {
    ctx.moveTo(x + radius, y)
    ctx.lineTo(x + w - radius, y)
    ctx.arcTo(x + w, y, x + w, y + radius, radius)
    ctx.lineTo(x + w, notchY - notch)
    ctx.arc(x + w, notchY, notch, -Math.PI / 2, Math.PI / 2, true)
    ctx.lineTo(x + w, y + h - radius)
    ctx.arcTo(x + w, y + h, x + w - radius, y + h, radius)
    ctx.lineTo(x + radius, y + h)
    ctx.arcTo(x, y + h, x, y + h - radius, radius)
    ctx.lineTo(x, notchY + notch)
    ctx.arc(x, notchY, notch, Math.PI / 2, -Math.PI / 2, true)
    ctx.lineTo(x, y + radius)
    ctx.arcTo(x, y, x + radius, y, radius)
    ctx.closePath()
}

function drawField(ctx, x, y, maxWidth, k, { label, value, size = 34, color = NAVY }) {
    setFont(ctx, 17 * k, 700, BODY)
    ctx.fillStyle = SLATE
    drawText(ctx, label, x, y + 17 * k * CAP, { spacing: 2 * k })
    const fit = fitLine(ctx, value, maxWidth, { size: size * k, min: size * k * 0.6, weight: 700, family: DISPLAY })
    ctx.fillStyle = color
    drawText(ctx, fit.text, x, y + 17 * k * CAP + 14 * k + fit.size * CAP)
}

// Card height for a scale `k` and number of field rows.
export function ticketHeight(k, rows) {
    return (104 + 164 + 112 * rows + 20 + 52 + 170) * k
}

// The boarding pass itself, top-left at (x, y). Shared with the sticker version.
export function drawTicket(ctx, s, { x, y, w, k, rows }) {
    const { data, spot } = s
    const pad = 40 * k
    const headerH = 104 * k
    const destH = 164 * k
    const rowH = 112 * k
    const perfH = 52 * k
    const h = ticketHeight(k, rows)
    const notchY = y + headerH + destH + rowH * rows + 20 * k + perfH / 2
    const notch = 24 * k
    const radius = 34 * k

    ctx.save()
    ctx.beginPath()
    ticketPath(ctx, x, y, w, h, radius, notchY, notch)
    setShadow(ctx, s, 46, 'rgba(0, 0, 0, 0.4)', 14)
    ctx.fillStyle = '#ffffff'
    ctx.fill()
    clearShadow(ctx)
    ctx.clip()

    // Header strip.
    ctx.fillStyle = verticalGradient(ctx, y, y + headerH, [[0, '#0f2347'], [1, NAVY]])
    ctx.fillRect(x, y, w, headerH)
    drawBrand(ctx, s, x + pad, y + (headerH - 54 * k) / 2, { size: 0.93 * k })
    setFont(ctx, 22 * k, 700, BODY)
    ctx.fillStyle = AMBER
    drawText(ctx, 'BOARDING PASS', x + w - pad, y + headerH / 2 + 22 * k * CAP / 2, { align: 'right', spacing: 5 * k })

    // Destination + "airport code".
    let top = y + headerH + 34 * k
    setFont(ctx, 17 * k, 700, BODY)
    ctx.fillStyle = SLATE
    drawText(ctx, 'TUJUAN  ·  NEGERI DI ATAS AWAN', x + pad, top + 17 * k * CAP, { spacing: 2 * k })
    setFont(ctx, 116 * k, 700, DISPLAY)
    const codeWidth = textWidth(ctx, spot.code)
    ctx.fillStyle = 'rgba(2, 132, 199, 0.14)'
    drawText(ctx, spot.code, x + w - pad + 6 * k, top + 112 * k, { align: 'right' })
    const name = fitLine(ctx, spot.name, w - pad * 2 - codeWidth - 16 * k, { size: 56 * k, min: 34 * k, weight: 700, family: DISPLAY })
    ctx.fillStyle = NAVY
    drawText(ctx, name.text, x + pad, top + 17 * k * CAP + 18 * k + name.size * CAP)
    const elevation = spot.elevationText ? `${spot.elevationText}  ·  ` : ''
    setFont(ctx, 22 * k, 600, BODY)
    ctx.fillStyle = SLATE
    drawText(ctx, `${elevation}${data.dateLong}`, x + pad, top + 17 * k * CAP + 18 * k + name.size * CAP + 40 * k)

    // Field grid.
    top = y + headerH + destH
    ctx.fillStyle = '#e2e8f0'
    ctx.fillRect(x + pad, top, w - pad * 2, 2)
    const colWidth = (w - pad * 2) / 3
    const fieldRows = rows === 2
        ? [
            [
                { label: 'SUHU', value: `${data.tempText}°C`, size: 50, color: ACCENT },
                { label: 'KELEMBAPAN', value: data.humidityText },
                { label: 'TERENDAH 24 JAM', value: data.minText ? `${data.minText}°C` : '--' },
            ],
            [
                { label: 'TANGGAL', value: data.dateNum },
                { label: 'WAKTU', value: `${data.time} WIB` },
                { label: 'TEKANAN', value: data.pressureText },
            ],
        ]
        : [[
            { label: 'SUHU', value: `${data.tempText}°C`, size: 50, color: ACCENT },
            { label: 'WAKTU', value: `${data.time} WIB` },
            { label: 'KELEMBAPAN', value: data.humidityText },
        ]]
    fieldRows.forEach((row, r) => {
        row.forEach((field, c) => {
            drawField(ctx, x + pad + colWidth * c, top + 26 * k + rowH * r, colWidth - 20 * k, k, field)
        })
    })

    // Stub (tinted) below the perforation line.
    ctx.fillStyle = '#f8fafc'
    ctx.fillRect(x, notchY, w, y + h - notchY)
    ctx.strokeStyle = '#cbd5e1'
    ctx.lineWidth = 3 * k
    ctx.setLineDash([12 * k, 10 * k])
    ctx.beginPath()
    ctx.moveTo(x + notch + 14 * k, notchY)
    ctx.lineTo(x + w - notch - 14 * k, notchY)
    ctx.stroke()
    ctx.setLineDash([])

    // Stub content: passenger + condition on the left, barcode on the right.
    top = notchY + perfH / 2
    const barcodeWidth = 250 * k
    const textWidthMax = w - pad * 3 - barcodeWidth
    drawField(ctx, x + pad, top + 26 * k, textWidthMax, k, { label: 'PENUMPANG', value: s.caption || 'Pengunjung Dieng', size: 32 })

    const conditionTop = top + 104 * k
    setFont(ctx, 17 * k, 700, BODY)
    ctx.fillStyle = SLATE
    drawText(ctx, 'KONDISI', x + pad, conditionTop + 17 * k * CAP, { spacing: 2 * k })
    const condition = fitLine(ctx, (data.kondisi ?? '--').toUpperCase(), textWidthMax - 120 * k, { size: 24 * k, min: 16 * k, weight: 700, family: DISPLAY, spacing: 1.5 * k })
    ctx.fillStyle = NAVY
    drawText(ctx, condition.text, x + pad + 120 * k, conditionTop + 17 * k * CAP / 2 + condition.size * CAP / 2, { spacing: 1.5 * k })

    const barcodeX = x + w - pad - barcodeWidth
    drawBarcode(ctx, barcodeX, top + 28 * k, barcodeWidth, 78 * k, `${spot.name}|${data.dateNum}|${data.time}|${data.tempText}`, NAVY)
    setFont(ctx, 19 * k, 700, BODY)
    ctx.fillStyle = NAVY
    const tag = fitLine(ctx, SITE_URL, barcodeWidth, { size: 19 * k, min: 14 * k, weight: 700 })
    drawText(ctx, tag.text, barcodeX + barcodeWidth / 2, top + 28 * k + 78 * k + 34 * k, { align: 'center' })
    ctx.restore()
}

export const TICKET_CAPTION = { label: 'Nama penumpang', placeholder: 'Nama penumpang, mis. @namakamu' }

export default {
    id: 'tiket',
    kind: 'foto',
    name: 'Tiket',
    hint: 'Boarding pass',
    caption: TICKET_CAPTION,
    draw(ctx, s) {
        const { W, H, safe } = s
        const story = s.format === 'story'
        const k = story ? 1 : s.format === 'feed' ? 0.92 : 0.8
        const margin = s.format === 'square' ? 48 : 60
        const rows = story ? 2 : 1
        const h = ticketHeight(k, rows)
        const bottom = story ? H - safe.bottom : H - margin
        const y = bottom - h

        // Gentle scrim so the card separates from bright photos.
        ctx.fillStyle = verticalGradient(ctx, y - 200, H, [[0, 'rgba(4, 9, 20, 0)'], [1, 'rgba(4, 9, 20, 0.45)']])
        ctx.fillRect(0, y - 200, W, H - y + 200)

        drawTicket(ctx, s, { x: margin, y, w: W - margin * 2, k, rows })

        if (story) {
            setShadow(ctx, s, 10, 'rgba(0, 0, 0, 0.5)')
            setFont(ctx, 24, 600, BODY)
            ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'
            drawText(ctx, BRAND_HANDLE, W / 2, y - 28, { align: 'center', spacing: 1 })
            clearShadow(ctx)
        }
    },
}
