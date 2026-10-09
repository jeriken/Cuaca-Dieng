// Angka sticker — the "Poster" headline number, ready to paste on any photo.

import { BRAND_HANDLE, SITE_URL } from '../../../config.js'
import {
    AMBER, BODY, CAP, DISPLAY, clearShadow, drawBrand, drawIcon, drawText,
    fitLine, setFont, setShadow,
} from '../../draw.js'
import { drawBigTemperature } from '../poster.js'
import { SHADOW, STICKER } from './common.js'

const LEFT = 72
const BIG = 380

export default {
    ...STICKER,
    id: 'stiker-angka',
    pair: 'poster', // the photo design it comes from
    name: 'Angka',
    hint: 'Angka raksasa',
    size: { width: 1080, height: 760 },
    safe: { top: 56, bottom: 56, x: LEFT },
    draw(ctx, s) {
        const { W, data, spot } = s
        const width = W - LEFT * 2

        setShadow(ctx, s, 16, SHADOW, 2)
        drawBrand(ctx, s, LEFT, 56, { size: 0.9 })

        const labelY = 56 + 52 + 64
        setFont(ctx, 28, 700, BODY)
        ctx.fillStyle = AMBER
        drawText(ctx, `DIENG  ·  ${data.weekday.toUpperCase()} ${data.period.toUpperCase()}`, LEFT, labelY, { spacing: 5 })

        const bigY = labelY + 40 + BIG * CAP
        ctx.fillStyle = data.ready ? '#ffffff' : 'rgba(255, 255, 255, 0.45)'
        setShadow(ctx, s, 34, SHADOW, 6)
        drawBigTemperature(ctx, LEFT, bigY, width, BIG, data.tempParts)

        setShadow(ctx, s, 16, SHADOW, 2)
        const spotY = bigY + 84
        const pinSize = 40
        drawIcon(ctx, 'pin', LEFT - 4, spotY - pinSize * 0.8, pinSize, AMBER, 2.4)
        const spotText = [spot.name, spot.elevationText].filter(Boolean).join('  ·  ')
        const spotLine = fitLine(ctx, spotText, width - pinSize - 8, { size: 44, min: 28, weight: 700, family: DISPLAY })
        ctx.fillStyle = '#ffffff'
        drawText(ctx, spotLine.text, LEFT + pinSize + 8, spotY)

        const metaY = spotY + 54
        const meta = [`${data.dateShort} · ${data.time} WIB`, data.ready ? `Kelembapan ${data.humidityText}` : null, data.kondisi]
            .filter(Boolean).join('   •   ')
        const metaLine = fitLine(ctx, meta, width, { size: 28, min: 20, weight: 600 })
        ctx.fillStyle = 'rgba(255, 255, 255, 0.92)'
        drawText(ctx, metaLine.text, LEFT, metaY)

        setFont(ctx, 26, 700, BODY)
        ctx.fillStyle = '#ffffff'
        drawText(ctx, `${SITE_URL}  ·  ${BRAND_HANDLE}`, LEFT, metaY + 68)
        clearShadow(ctx)
    },
}
