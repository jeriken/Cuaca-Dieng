// Label sticker — a compact die-cut pill: temperature, place and time in one line.
// Small enough to tuck into a corner of a busy story.

import { SITE_URL } from '../../../config.js'
import {
    AMBER, BODY, CAP, DISPLAY, NAVY, clearShadow, drawIcon, drawText, fitLine,
    roundRectPath, setFont, setShadow, textWidth,
} from '../../draw.js'
import { DIE_CUT, STICKER } from './common.js'

const PILL = { x: 50, y: 60, w: 980, h: 200 }
const SLATE = '#64748b'

export default {
    ...STICKER,
    id: 'stiker-label',
    name: 'Label',
    hint: 'Ringkas',
    size: { width: 1080, height: 320 },
    safe: { top: 60, bottom: 60, x: 50 },
    draw(ctx, s) {
        const { data, spot } = s
        const { x, y, w, h } = PILL
        const cy = y + h / 2

        ctx.beginPath()
        roundRectPath(ctx, x, y, w, h, h / 2)
        setShadow(ctx, s, 34, DIE_CUT, 10)
        ctx.fillStyle = '#ffffff'
        ctx.fill()
        clearShadow(ctx)

        // Badge with a thermometer.
        const badgeX = x + h / 2
        const badgeR = 72
        ctx.beginPath()
        ctx.arc(badgeX, cy, badgeR, 0, Math.PI * 2)
        ctx.fillStyle = NAVY
        ctx.fill()
        drawIcon(ctx, data.ready && data.temp < 6 ? 'snowflake' : 'thermometer', badgeX - 36, cy - 36, 72, AMBER, 2.2)

        const tempX = badgeX + badgeR + 34
        const temp = fitLine(ctx, `${data.tempText}°C`, 330, { size: 112, min: 70, weight: 700, family: DISPLAY })
        ctx.fillStyle = data.ready ? NAVY : '#cbd5e1'
        const tempWidth = drawText(ctx, temp.text, tempX, cy + temp.size * CAP / 2)

        const dividerX = tempX + tempWidth + 34
        ctx.fillStyle = '#e2e8f0'
        ctx.fillRect(dividerX, cy - 62, 3, 124)

        const textX = dividerX + 34
        const maxWidth = x + w - h * 0.42 - textX
        const name = fitLine(ctx, spot.name, maxWidth, { size: 44, min: 28, weight: 700, family: DISPLAY })
        ctx.fillStyle = NAVY
        drawText(ctx, name.text, textX, cy - 22)

        const meta = fitLine(ctx, `${data.dateShort} · ${data.time} WIB`, maxWidth, { size: 26, min: 18, weight: 600 })
        ctx.fillStyle = SLATE
        drawText(ctx, meta.text, textX, cy + 22)

        setFont(ctx, 22, 700, BODY)
        ctx.fillStyle = '#0284c7'
        const site = textWidth(ctx, SITE_URL) <= maxWidth ? SITE_URL : 'Cuaca Dieng'
        drawText(ctx, site, textX, cy + 62, { spacing: 0.5 })
    },
}
