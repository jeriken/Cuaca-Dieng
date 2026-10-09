// "Polaroid" — the photo as an instant print taped onto a topographic board,
// with the temperature written on the white strip below it.

import { BRAND_HANDLE, SITE_URL } from '../../config.js'
import {
    BODY, CAP, DISPLAY, NAVY, clearShadow, drawBrand, drawContours, drawText,
    fitLine, roundRectPath, setFont, setShadow, textWidth, verticalGradient,
} from '../draw.js'

const PAPER = '#fbf8f1'
const INK = '#475569'

// card: the print; border: white edge around the photo; strip: the writing area.
const GEOMETRY = {
    story: { brandTop: 180, brand: 1, card: { x: 64, top: 290, bottom: 300 }, border: 34, strip: 270, k: 1 },
    feed: { brandTop: 44, brand: 0.9, card: { x: 64, top: 140, bottom: 52 }, border: 32, strip: 230, k: 0.9 },
    square: { brandTop: 28, brand: 0.8, card: { x: 84, top: 112, bottom: 40 }, border: 28, strip: 196, k: 0.78 },
}

const boardCache = new Map()

function board(W, H) {
    const key = `${W}x${H}`
    if (!boardCache.has(key)) {
        const canvas = document.createElement('canvas')
        canvas.width = W
        canvas.height = H
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = verticalGradient(ctx, 0, H, [[0, '#10213f'], [1, '#081329']])
        ctx.fillRect(0, 0, W, H)
        drawContours(ctx, W, H, { seed: 2565, color: 'rgba(255, 255, 255, 0.07)', lineWidth: 2 })
        boardCache.set(key, canvas)
    }
    return boardCache.get(key)
}

function drawTape(ctx, x, y, angle, k) {
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(angle)
    ctx.fillStyle = 'rgba(251, 191, 36, 0.78)'
    ctx.fillRect(-90 * k, -24 * k, 180 * k, 48 * k)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.18)'
    ctx.fillRect(-90 * k, -24 * k, 180 * k, 10 * k)
    ctx.restore()
}

export default {
    id: 'polaroid',
    kind: 'foto',
    name: 'Polaroid',
    hint: 'Cetak instan',
    draw(ctx, s) {
        const { W, H, data, spot } = s
        const g = GEOMETRY[s.format]
        const k = g.k
        const card = { x: g.card.x, y: g.card.top, w: W - g.card.x * 2, h: H - g.card.top - g.card.bottom }
        const win = { x: card.x + g.border, y: card.y + g.border, w: card.w - g.border * 2, h: card.h - g.border - g.strip }

        // Board + print, with the photo window cut out.
        ctx.save()
        ctx.beginPath()
        ctx.rect(0, 0, W, H)
        ctx.rect(win.x, win.y, win.w, win.h)
        ctx.clip('evenodd')
        ctx.drawImage(board(W, H), 0, 0, W, H)
        ctx.beginPath()
        roundRectPath(ctx, card.x, card.y, card.w, card.h, 10)
        setShadow(ctx, s, 40, 'rgba(0, 0, 0, 0.45)', 14)
        ctx.fillStyle = PAPER
        ctx.fill()
        clearShadow(ctx)
        ctx.restore()

        // Thin inner edge so bright photos don't bleed into the paper.
        ctx.strokeStyle = 'rgba(15, 23, 42, 0.12)'
        ctx.lineWidth = 2
        ctx.strokeRect(win.x, win.y, win.w, win.h)

        drawTape(ctx, card.x + 70 * k, card.y + 6 * k, -0.42, k)
        drawTape(ctx, card.x + card.w - 70 * k, card.y + 6 * k, 0.42, k)

        drawBrand(ctx, s, W / 2, g.brandTop, { size: g.brand, align: 'center' })

        // Writing strip: temperature on the left, place and time on the right.
        const stripTop = win.y + win.h
        const pad = g.border + 6 * k
        const left = card.x + pad
        const right = card.x + card.w - pad
        const mid = stripTop + (card.y + card.h - stripTop) / 2

        const temp = fitLine(ctx, `${data.tempText}°`, (right - left) * 0.42, { size: 150 * k, min: 90 * k, weight: 700, family: DISPLAY })
        ctx.fillStyle = data.ready ? NAVY : '#cbd5e1'
        const tempWidth = drawText(ctx, temp.text, left - temp.size * 0.03, mid + temp.size * CAP / 2)
        setFont(ctx, 30 * k, 700, BODY)
        ctx.fillStyle = '#d97706'
        drawText(ctx, 'C', left + tempWidth - temp.size * 0.03 + 6 * k, mid - temp.size * CAP / 2 + 30 * k * CAP)

        const textX = left + tempWidth + 48 * k
        const maxWidth = right - textX
        ctx.fillStyle = 'rgba(15, 23, 42, 0.12)'
        ctx.fillRect(textX - 24 * k, mid - 64 * k, 2, 128 * k)

        const title = fitLine(ctx, s.caption || spot.name, maxWidth, { size: 46 * k, min: 28 * k, weight: 700, family: DISPLAY })
        ctx.fillStyle = NAVY
        drawText(ctx, title.text, textX, mid - 26 * k)

        const sub = [s.caption ? spot.name : spot.elevationText, data.dateShort].filter(Boolean).join('  ·  ')
        const subLine = fitLine(ctx, sub, maxWidth, { size: 25 * k, min: 18 * k, weight: 600 })
        ctx.fillStyle = INK
        drawText(ctx, subLine.text, textX, mid + 16 * k)

        const meta = [`${data.time} WIB`, data.kondisi].filter(Boolean).join('  ·  ')
        const metaLine = fitLine(ctx, meta, maxWidth, { size: 25 * k, min: 18 * k, weight: 600 })
        ctx.fillStyle = INK
        drawText(ctx, metaLine.text, textX, mid + 54 * k)

        // Credit under the print (story) or tucked into the strip corner.
        if (s.format === 'story') {
            setFont(ctx, 24, 600, BODY)
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
            drawText(ctx, `${SITE_URL}  ·  ${BRAND_HANDLE}`, W / 2, card.y + card.h + 64, { align: 'center' })
        } else {
            setFont(ctx, 18 * k, 700, BODY)
            ctx.fillStyle = 'rgba(71, 85, 105, 0.7)'
            if (textWidth(ctx, SITE_URL) < maxWidth) drawText(ctx, SITE_URL, right, card.y + card.h - 18 * k, { align: 'right' })
        }
    },
}
