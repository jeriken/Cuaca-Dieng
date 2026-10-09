import statistik from './templates/statistik.js'
import bingkai from './templates/bingkai.js'
import poster from './templates/poster.js'
import tiket from './templates/tiket.js'
import polaroid from './templates/polaroid.js'
import stikerStatistik from './templates/stiker/statistik.js'
import stikerTiket from './templates/stiker/tiket.js'
import stikerSegel from './templates/stiker/segel.js'
import stikerAngka from './templates/stiker/angka.js'
import stikerLabel from './templates/stiker/label.js'
import stikerTermometer from './templates/stiker/termometer.js'
import { drawLandscape, drawPhoto } from './background.js'

// Two kinds of design: transparent stickers to paste on any story (the default,
// most people use these), and designs drawn over the person's photo.
export const KINDS = [
    { id: 'stiker', label: 'Stiker', hint: 'PNG transparan' },
    { id: 'foto', label: 'Dengan foto', hint: 'Desain di atas fotomu' },
]

export const TEMPLATES = [
    stikerStatistik, stikerAngka, stikerLabel, stikerTiket, stikerSegel, stikerTermometer,
    statistik, bingkai, poster, tiket, polaroid,
]

export const templatesOf = (kind) => TEMPLATES.filter(t => t.kind === kind)

// Falls back to the first design of `kind`, so stale saved ids still work.
export function getTemplate(id, kind = 'stiker') {
    return TEMPLATES.find(t => t.id === id && t.kind === kind) ?? templatesOf(kind)[0]
}

// The matching design in the other kind (Bingkai ↔ Segel sticker), if there is one.
export function counterpart(template, kind) {
    return templatesOf(kind).find(t => t.pair === template.id || t.id === template.pair) ?? null
}

// Canvas size for a template in a format (the sticker has its own fixed size).
export function canvasSize(template, format) {
    return template.size ?? { width: format.width, height: format.height }
}

// ---------------------------------------------------------------------------
// Assets: canvas text only uses web fonts once they're loaded, so load them first.

const FONT_FACES = [
    '700 40px "Space Grotesk"',
    '600 40px "Space Grotesk"',
    '500 40px "Plus Jakarta Sans"',
    '600 40px "Plus Jakarta Sans"',
    '700 40px "Plus Jakarta Sans"',
]
const FONT_SAMPLE = 'AaBb 0123456789 °,.%#@·−“”'

export const assets = { logo: null }

let assetsPromise = null

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve(img)
        img.onerror = reject
        img.src = src
    })
}

export function loadAssets() {
    if (!assetsPromise) {
        const fonts = document.fonts?.load
            ? Promise.all(FONT_FACES.map(face => document.fonts.load(face, FONT_SAMPLE).catch(() => null)))
            : Promise.resolve()
        // Don't hold the preview hostage to a slow font CDN; we re-render when fonts land.
        const fontsOrTimeout = Promise.race([fonts, new Promise(resolve => setTimeout(resolve, 4000))])
        const logo = loadImage('/pwa/pwa-192x192.png').then(img => { assets.logo = img }).catch(() => null)
        assetsPromise = Promise.all([fontsOrTimeout, logo])
    }
    return assetsPromise
}

// ---------------------------------------------------------------------------

// Photo (or generated landscape) behind the template. `fast` trades resampling
// quality for speed while a pan/zoom gesture is in progress.
export function renderBackground(ctx, scene, { fast = false } = {}) {
    ctx.clearRect(0, 0, scene.W, scene.H)
    if (scene.template.usesPhoto === false) return
    if (scene.photo) drawPhoto(ctx, scene, fast)
    else drawLandscape(ctx, scene)
}

// Everything the template draws on top. It never depends on the photo or its
// position, so callers can cache it while the photo is being dragged.
export function renderOverlay(ctx, scene) {
    ctx.save()
    ctx.textBaseline = 'alphabetic'
    scene.template.draw(ctx, scene)
    ctx.restore()
}

// Draws `scene` into ctx. The caller sets any transform (thumbnails) and passes
// the matching `scene.scale` so shadows stay proportional.
export function renderScene(ctx, scene) {
    renderBackground(ctx, scene)
    renderOverlay(ctx, scene)
}
