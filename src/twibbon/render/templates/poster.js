// "Poster" — the temperature as a huge headline over the photo.

import { BRAND_HANDLE, TREND_HASHTAG } from '../../config.js'
import {
    AMBER, BODY, CAP, DISPLAY, clearShadow, drawBadgePill, drawBrand, drawIcon, drawText,
    fitLine, setFont, setShadow, textWidth, verticalGradient,
} from '../draw.js'

const SIZES = { story: 400, feed: 320, square: 260 }

// "−3" in full size, ",4°" as a superscript aligned to the cap height.
function drawBigTemperature(ctx, x, baseline, maxWidth, size, parts) {
    const main = parts.sign + parts.int
    const small = parts.dec ? `${parts.dec}°` : '°'
    const measure = (s) => {
        setFont(ctx, s, 700, DISPLAY)
        const mainWidth = textWidth(ctx, main)
        setFont(ctx, s * 0.44, 700, DISPLAY)
        return { mainWidth, total: mainWidth + s * 0.03 + textWidth(ctx, small) }
    }
    let fitted = size
    let m = measure(fitted)
    if (m.total > maxWidth) {
        fitted = size * maxWidth / m.total
        m = measure(fitted)
    }
    setFont(ctx, fitted, 700, DISPLAY)
    // Space Grotesk digits sit slightly wide; pull them together for a headline look.
    drawText(ctx, main, x - fitted * 0.03, baseline)
    setFont(ctx, fitted * 0.44, 700, DISPLAY)
    drawText(ctx, small, x + m.mainWidth, baseline - fitted * CAP + fitted * 0.44 * CAP)
    return fitted
}

export default {
    id: 'poster',
    name: 'Poster',
    hint: 'Angka raksasa',
    draw(ctx, s) {
        const { W, H, safe, data, spot } = s
        const left = safe.x
        const width = W - safe.x * 2
        const k = s.format === 'story' ? 1 : s.format === 'feed' ? 0.92 : 0.84
        const bigSize = SIZES[s.format]

        // Bottom-up layout (baselines).
        let y = H - safe.bottom
        const footerY = y
        y -= 24 * CAP + 44 * k
        const statsY = y
        y -= 28 * k * CAP + 26 * k
        const spotY = y
        y -= 40 * k * CAP + 34 * k
        const bigY = y
        y -= bigSize * CAP + 34 * k
        const labelY = y
        y -= 28 * k * CAP
        let badgeTop = null
        if (data.badge) {
            y -= 26 * k + 60 * k
            badgeTop = y
        }
        let captionY = null
        if (s.caption) {
            y -= 26 * k
            captionY = y
            y -= 36 * k * CAP
        }
        const contentTop = y

        ctx.fillStyle = verticalGradient(ctx, 0, safe.top + 260, [[0, 'rgba(4, 9, 20, 0.55)'], [1, 'rgba(4, 9, 20, 0)']])
        ctx.fillRect(0, 0, W, safe.top + 260)
        const scrimTop = contentTop - 220
        ctx.fillStyle = verticalGradient(ctx, scrimTop, H, [[0, 'rgba(4, 9, 20, 0)'], [0.4, 'rgba(4, 9, 20, 0.5)'], [1, 'rgba(4, 9, 20, 0.88)']])
        ctx.fillRect(0, scrimTop, W, H - scrimTop)

        setShadow(ctx, s, 16, 'rgba(0, 0, 0, 0.35)')
        drawBrand(ctx, s, left, safe.top, { size: k })
        setFont(ctx, 26 * k, 700, BODY)
        ctx.fillStyle = '#ffffff'
        drawText(ctx, data.dateNum, W - safe.x, safe.top + 26 * k * CAP + 4, { align: 'right', spacing: 2 })
        setFont(ctx, 24 * k, 500, BODY)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
        drawText(ctx, `${data.time} WIB`, W - safe.x, safe.top + 26 * k * CAP + 44 * k, { align: 'right' })

        if (captionY != null) {
            const caption = fitLine(ctx, `“${s.caption}”`, width, { size: 36 * k, min: 24 * k, weight: 600 })
            ctx.fillStyle = '#ffffff'
            drawText(ctx, caption.text, left, captionY)
        }
        clearShadow(ctx)
        if (badgeTop != null) drawBadgePill(ctx, s, left, badgeTop, data.badge, { size: k })

        setShadow(ctx, s, 14, 'rgba(0, 0, 0, 0.4)')
        setFont(ctx, 28 * k, 700, BODY)
        ctx.fillStyle = AMBER
        drawText(ctx, `DIENG  ·  ${data.weekday.toUpperCase()} ${data.period.toUpperCase()}`, left, labelY, { spacing: 5 * k })

        // While the sensor reading loads, show a faint placeholder instead of bold dashes.
        ctx.fillStyle = data.ready ? '#ffffff' : 'rgba(255, 255, 255, 0.35)'
        setShadow(ctx, s, 30, 'rgba(0, 0, 0, 0.35)', 6)
        drawBigTemperature(ctx, left, bigY, width, bigSize, data.tempParts)

        setShadow(ctx, s, 12, 'rgba(0, 0, 0, 0.35)')
        const pinSize = 38 * k
        drawIcon(ctx, 'pin', left - 4, spotY - pinSize * 0.8, pinSize, AMBER, 2.4)
        const spotText = [spot.name, spot.elevationText].filter(Boolean).join('  ·  ')
        const spotLine = fitLine(ctx, spotText, width - pinSize - 8, { size: 40 * k, min: 26 * k, weight: 700, family: DISPLAY })
        ctx.fillStyle = '#ffffff'
        drawText(ctx, spotLine.text, left + pinSize + 8, spotY)

        const stats = [
            `Kelembapan ${data.humidityText}`,
            data.minText ? `Terendah ${data.minText}° (${data.minTime})` : null,
            data.kondisi,
        ].filter(Boolean).join('   •   ')
        const statsLine = fitLine(ctx, stats, width, { size: 27 * k, min: 20 * k, weight: 600 })
        ctx.fillStyle = 'rgba(255, 255, 255, 0.88)'
        drawText(ctx, statsLine.text, left, statsY)
        clearShadow(ctx)

        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)'
        ctx.fillRect(left, statsY + 26 * k, width, 2)
        setFont(ctx, 24, 700, BODY)
        ctx.fillStyle = '#ffffff'
        drawText(ctx, TREND_HASHTAG, left, footerY)
        setFont(ctx, 24, 500, BODY)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
        drawText(ctx, BRAND_HANDLE, W - safe.x, footerY, { align: 'right' })
    },
}
