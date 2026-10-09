// Segel sticker — the round temperature seal from "Bingkai", die-cut with a
// name ribbon underneath.

import { SITE_URL } from '../../../config.js'
import {
    AMBER, CAP, DISPLAY, NAVY, BODY, clearShadow, drawText, fitLine,
    roundRectPath, setFont, setShadow, textWidth,
} from '../../draw.js'
import { drawSeal } from '../bingkai.js'
import { DIE_CUT, SHADOW, STICKER } from './common.js'

const SEAL = { cx: 540, cy: 420, r: 300 }
const EDGE = 26

export default {
    ...STICKER,
    id: 'stiker-segel',
    pair: 'bingkai', // the photo design it comes from
    name: 'Segel',
    hint: 'Lencana bulat',
    size: { width: 1080, height: 1040 },
    safe: { top: 60, bottom: 60, x: 72 },
    draw(ctx, s) {
        const { W, spot } = s
        const { cx, cy, r } = SEAL

        // Ribbon: spot name on a navy pill overlapping the bottom of the seal.
        const ribbonH = 128
        const ribbonY = cy + r - 34
        const nameLine = fitLine(ctx, spot.name.toUpperCase(), W - 300, { size: 54, min: 32, weight: 700, family: DISPLAY, spacing: 2 })
        const nameWidth = textWidth(ctx, nameLine.text, 2)
        setFont(ctx, 24, 700, BODY)
        const sub = spot.elevationText ? spot.elevationText.toUpperCase() : 'NEGERI DI ATAS AWAN'
        const ribbonW = Math.min(W - 120, Math.max(nameWidth, textWidth(ctx, sub, 5)) + 120)
        const ribbonX = cx - ribbonW / 2

        // One white die-cut shape behind seal + ribbon.
        ctx.save()
        setShadow(ctx, s, 36, DIE_CUT, 10)
        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.arc(cx, cy, r + EDGE, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        roundRectPath(ctx, ribbonX - EDGE, ribbonY - EDGE, ribbonW + EDGE * 2, ribbonH + EDGE * 2, ribbonH / 2 + EDGE)
        ctx.fill()
        clearShadow(ctx)
        ctx.restore()

        drawSeal(ctx, s, cx, cy, r)

        ctx.beginPath()
        roundRectPath(ctx, ribbonX, ribbonY, ribbonW, ribbonH, ribbonH / 2)
        ctx.fillStyle = NAVY
        ctx.fill()
        ctx.lineWidth = 5
        ctx.strokeStyle = AMBER
        ctx.stroke()

        setFont(ctx, nameLine.size, 700, DISPLAY)
        ctx.fillStyle = '#ffffff'
        drawText(ctx, nameLine.text, cx, ribbonY + 30 + nameLine.size * CAP, { align: 'center', spacing: 2 })
        setFont(ctx, 24, 700, BODY)
        ctx.fillStyle = AMBER
        drawText(ctx, sub, cx, ribbonY + ribbonH - 26, { align: 'center', spacing: 5 })

        setShadow(ctx, s, 14, SHADOW, 2)
        setFont(ctx, 28, 700, BODY)
        ctx.fillStyle = '#ffffff'
        drawText(ctx, SITE_URL, cx, ribbonY + ribbonH + EDGE + 74, { align: 'center', spacing: 1 })
        clearShadow(ctx)
    },
}
