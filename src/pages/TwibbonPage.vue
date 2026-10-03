<script setup>
import { ref, computed, watch, shallowRef, onMounted, onBeforeUnmount } from 'vue'
import moment from 'moment/min/moment-with-locales'
import { useDarkMode } from '../composables/useDarkMode.js'
import TwibbonCanvas from '../components/twibbon/TwibbonCanvas.vue'
import TemplatePicker from '../components/twibbon/TemplatePicker.vue'
import BadgeShelf from '../components/twibbon/BadgeShelf.vue'
import ResultSheet from '../components/twibbon/ResultSheet.vue'
import { BRAND_HANDLE, FORMATS, SPOTS, STATION_NAME, TREND_HASHTAG } from '../twibbon/config.js'
import { buildShareCaption, describeReading, describeSpot, spotCode, toWib } from '../twibbon/format.js'
import { fetchLiveReading, fetchReadingAt } from '../twibbon/sensor.js'
import { readCaptureTime } from '../twibbon/exif.js'
import { DEFAULT_VIEW, MAX_ZOOM, clampView, loadPhoto, zoomView } from '../twibbon/photo.js'
import { TEMPLATES, assets, canvasSize, getTemplate, loadAssets } from '../twibbon/render/index.js'
import { loadCollection, loadPrefs, recordTwibbon, savePrefs } from '../twibbon/storage.js'
moment.locale('id')

const { isDark, toggle: toggleDark } = useDarkMode()

const HOST = window.location.host.replace(/^www\./, '')
const SHARE_LINK = `${HOST}/twibbon`

// Links opened from Instagram & co. land in in-app browsers where downloads often fail.
const IN_APP_BROWSERS = [
    [/Instagram/, 'Instagram'],
    [/FBAN|FBAV|FB_IAB/, 'Facebook'],
    [/\bLine\//, 'LINE'],
    [/TikTok|musical_ly|BytedanceWebview/, 'TikTok'],
    [/Twitter/, 'X'],
]
const IN_APP_BROWSER = IN_APP_BROWSERS.find(([pattern]) => pattern.test(navigator.userAgent))?.[1] ?? null

const CAN_SHARE_FILES = (() => {
    try {
        return typeof navigator.canShare === 'function'
            && navigator.canShare({ files: [new File(['x'], 'cek.png', { type: 'image/png' })] })
    } catch {
        return false
    }
})()
const CAN_COPY_IMAGE = typeof window.ClipboardItem === 'function' && typeof navigator.clipboard?.write === 'function'

const TABS = [
    { id: 'foto', label: 'Foto', icon: ['M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z', 'M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z'] },
    { id: 'desain', label: 'Desain', icon: ['M3 3h7v9H3z', 'M14 3h7v5h-7z', 'M14 12h7v9h-7z', 'M3 16h7v5H3z'] },
    { id: 'suhu', label: 'Suhu', icon: ['M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z'] },
    { id: 'lokasi', label: 'Lokasi', icon: ['M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z', 'M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z'] },
    { id: 'tren', label: 'Tren', icon: ['M23 6l-9.5 9.5-5-5L1 18', 'M17 6h6v6'] },
]
const activeTab = ref('foto')
const panelClass = (id) => (activeTab.value === id ? 'block' : 'hidden lg:block')

// ---------------------------------------------------------------------------
// Options (remembered per device)

const prefs = loadPrefs()
const templateId = ref(getTemplate(prefs.template).id)
const formatId = ref(FORMATS.some(f => f.id === prefs.format) ? prefs.format : 'story')
const spotId = ref(prefs.spot === 'custom' || SPOTS.some(s => s.id === prefs.spot) ? prefs.spot : 'dieng')
const customSpot = ref(typeof prefs.customSpot === 'string' ? prefs.customSpot : '')
const caption = ref('')

watch([templateId, formatId, spotId, customSpot], () => {
    savePrefs({ template: templateId.value, format: formatId.value, spot: spotId.value, customSpot: customSpot.value })
})

const template = computed(() => getTemplate(templateId.value))
const format = computed(() => FORMATS.find(f => f.id === formatId.value) ?? FORMATS[0])
const size = computed(() => canvasSize(template.value, format.value))

const spot = computed(() => {
    if (spotId.value === 'custom') {
        const name = customSpot.value.trim() || 'Dieng'
        return describeSpot({ id: 'custom', name, short: name, code: spotCode(name), elevation: null })
    }
    return describeSpot(SPOTS.find(s => s.id === spotId.value) ?? SPOTS[0])
})

const captionPlaceholder = computed(() => (template.value.id === 'tiket'
    ? 'Nama penumpang, mis. @namakamu'
    : 'Judul, mis. Sunrise pertama di Sikunir'))

// ---------------------------------------------------------------------------
// Sensor data: live, or the reading at a moment the person picks.

const now = ref(Date.now())
const mode = ref('live')
const liveReading = shallowRef(null)
const liveStatus = ref('loading') // loading | refreshing | ready | error
let liveFetchedAt = 0

async function loadLive() {
    liveStatus.value = liveReading.value ? 'refreshing' : 'loading'
    try {
        liveReading.value = await fetchLiveReading()
        liveFetchedAt = Date.now()
        liveStatus.value = 'ready'
    } catch {
        liveStatus.value = liveReading.value ? 'ready' : 'error'
        toast('Gagal memuat data sensor. Periksa koneksi internet.', 'error')
    }
}

const WIB_INPUT = 'YYYY-MM-DDTHH:mm'
const toWibInput = (date) => toWib(date).format(WIB_INPUT)
// datetime-local values are read as WIB, whatever timezone the phone is set to.
function fromWibInput(value) {
    const parsed = moment.utc(value, WIB_INPUT, true)
    return parsed.isValid() ? parsed.subtract(7, 'hours').toDate() : null
}

function lastDawn() {
    const wibNow = toWib(new Date())
    const dawn = wibNow.clone().hour(5).minute(0).second(0).millisecond(0)
    if (dawn.isAfter(wibNow)) dawn.subtract(1, 'day')
    return dawn.toDate()
}

const historyInput = ref('')
const pastReading = shallowRef(null)
const pastStatus = ref('idle') // idle | loading | ready | empty | future | error
let pastRequest = 0
let pastTimer = null

async function loadPast() {
    const instant = fromWibInput(historyInput.value)
    if (!instant) {
        pastStatus.value = 'idle'
        return
    }
    if (instant.getTime() > Date.now()) {
        pastStatus.value = 'future'
        return
    }
    const request = ++pastRequest
    pastStatus.value = 'loading'
    try {
        const reading = await fetchReadingAt(instant)
        if (request !== pastRequest) return
        pastReading.value = reading
        pastStatus.value = reading ? 'ready' : 'empty'
    } catch {
        if (request === pastRequest) pastStatus.value = 'error'
    }
}

watch([mode, historyInput], () => {
    if (mode.value !== 'history') return
    clearTimeout(pastTimer)
    pastTimer = setTimeout(loadPast, 450)
})

function useHistory(date) {
    mode.value = 'history'
    historyInput.value = toWibInput(date)
}

function setMode(next) {
    if (next === 'history' && !historyInput.value) {
        useHistory(photoTime.value ?? lastDawn())
        return
    }
    mode.value = next
}

const reading = computed(() => (mode.value === 'live' ? liveReading.value : pastReading.value))
const data = computed(() => describeReading(reading.value, new Date(now.value)))

const dataStatus = computed(() => {
    if (mode.value === 'live') {
        if (liveStatus.value === 'loading') return { kind: 'loading', text: 'Memuat data sensor…' }
        if (liveStatus.value === 'error') return { kind: 'error', text: 'Data sensor gagal dimuat.' }
        return { kind: 'ready' }
    }
    return {
        idle: { kind: 'idle', text: 'Pilih tanggal dan jam kunjunganmu.' },
        loading: { kind: 'loading', text: 'Mencari data sensor…' },
        empty: { kind: 'error', text: 'Sensor tidak punya data di sekitar waktu itu. Coba waktu lain.' },
        future: { kind: 'error', text: 'Waktu itu belum terjadi.' },
        error: { kind: 'error', text: 'Data gagal dimuat. Coba lagi.' },
        ready: { kind: 'ready' },
    }[pastStatus.value]
})

const canExport = computed(() => data.value.ready && dataStatus.value.kind === 'ready')
const liveAge = computed(() => (liveReading.value ? moment(liveReading.value.time).from(now.value) : ''))
const liveStale = computed(() => liveReading.value && now.value - liveReading.value.time.getTime() > 60 * 60 * 1000)
const historyMax = computed(() => toWibInput(new Date(now.value)))

// ---------------------------------------------------------------------------
// Photo

const fileInput = ref(null)
const photo = shallowRef(null)
const photoTime = ref(null)
const photoLoading = ref(false)
const view = ref({ ...DEFAULT_VIEW })
const dragging = ref(false)

function pickPhoto() {
    fileInput.value?.click()
}

function releasePhoto() {
    // Free the bitmap right away; phones hold on to canvas memory otherwise.
    if (photo.value) photo.value.source.width = 0
    photo.value = null
}

async function usePhotoFile(file) {
    if (!file || !file.type.startsWith('image/')) {
        toast('Pilih file gambar (JPG atau PNG).', 'error')
        return
    }
    photoLoading.value = true
    try {
        const [loaded, takenAt] = await Promise.all([loadPhoto(file), readCaptureTime(file)])
        releasePhoto()
        photo.value = loaded
        view.value = { ...DEFAULT_VIEW }
        photoTime.value = takenAt
        if (template.value.usesPhoto === false) templateId.value = 'statistik'
        track('twibbon_photo', { exif_time: Boolean(takenAt) })
    } catch {
        toast('Foto tidak bisa dibuka. Coba foto JPG atau PNG.', 'error')
    } finally {
        photoLoading.value = false
    }
}

function onFileChange(event) {
    const [file] = event.target.files || []
    event.target.value = '' // allow picking the same file again
    usePhotoFile(file)
}

function onDrop(event) {
    const file = [...(event.dataTransfer?.files || [])].find(f => f.type.startsWith('image/'))
    if (file) usePhotoFile(file)
}

function removePhoto() {
    releasePhoto()
    photoTime.value = null
    view.value = { ...DEFAULT_VIEW }
}

// Offer the sensor reading from when the photo was taken (people often post later).
const photoSuggestion = computed(() => {
    if (!photoTime.value) return null
    const age = now.value - photoTime.value.getTime()
    if (age < 45 * 60 * 1000) return null
    if (mode.value === 'history' && historyInput.value === toWibInput(photoTime.value)) return null
    return toWib(photoTime.value).format('dddd, D MMM YYYY · HH.mm')
})

// ---------------------------------------------------------------------------
// Scene (everything the renderer needs)

const assetsVersion = ref(0)
const bumpAssets = () => { assetsVersion.value++ }

const interactive = computed(() => Boolean(photo.value) && template.value.usesPhoto !== false)

const scene = computed(() => {
    const { width, height } = size.value
    return {
        template: template.value,
        format: template.value.size ? 'sticker' : format.value.id,
        W: width,
        H: height,
        safe: template.value.safe ?? format.value.safe,
        data: data.value,
        spot: spot.value,
        caption: caption.value.trim(),
        photo: photo.value,
        view: photo.value ? clampView(view.value, photo.value, width, height) : view.value,
        assets,
        assetsVersion: assetsVersion.value,
        scale: 1,
    }
})

const zoom = computed({
    get: () => scene.value.view.zoom,
    set: (value) => {
        if (!photo.value) return
        view.value = zoomView(scene.value.view, photo.value, scene.value.W, scene.value.H, Number(value))
    },
})

const previewLabel = computed(() => `Pratinjau twibbon ${template.value.name}: ${spot.value.name}, ${data.value.tempText}°C, ${data.value.dateLong} pukul ${data.value.time} WIB`)

// ---------------------------------------------------------------------------
// Export: share, download, copy

const preview = ref(null)
const result = shallowRef(null)
const resultOpen = ref(false)
const collection = ref(loadCollection())
const shareCaption = computed(() => buildShareCaption({ data: data.value, spot: spot.value, link: SHARE_LINK }))

function track(name, params = {}) {
    try {
        window.gtag?.('event', name, params)
    } catch {
        // Analytics must never break the page.
    }
}

const trackParams = (method) => ({ method, template: template.value.id, format: scene.value.format, data_mode: mode.value, badge: data.value.badge?.id })

function dataUrlToBlob(dataUrl) {
    const [header, base64] = dataUrl.split(',')
    const type = /data:([^;]+)/.exec(header)[1]
    const bytes = atob(base64)
    const array = new Uint8Array(bytes.length)
    for (let i = 0; i < bytes.length; i++) array[i] = bytes.charCodeAt(i)
    return new Blob([array], { type })
}

// Synchronous on purpose: share/clipboard must run inside the tap that triggered them.
function exportFile() {
    const canvas = preview.value.flush()
    const transparent = Boolean(template.value.transparent)
    const type = transparent ? 'image/png' : 'image/jpeg'
    const blob = dataUrlToBlob(canvas.toDataURL(type, 0.92))
    const stamp = toWib(reading.value.time).format('YYYYMMDD-HHmm')
    return new File([blob], `twibbon-dieng-${template.value.id}-${stamp}.${transparent ? 'png' : 'jpg'}`, { type })
}

function triggerDownload(file) {
    const url = URL.createObjectURL(file)
    const link = document.createElement('a')
    link.href = url
    link.download = file.name
    document.body.appendChild(link)
    link.click()
    link.remove()
    setTimeout(() => URL.revokeObjectURL(url), 60 * 1000)
}

function showResult(file, extra = {}) {
    if (result.value?.url) URL.revokeObjectURL(result.value.url)
    result.value = { file, url: URL.createObjectURL(file), transparent: Boolean(template.value.transparent), ...extra }
    resultOpen.value = true
}

function celebrate() {
    const badge = data.value.badge
    const outcome = recordTwibbon({ badgeId: badge?.id, temp: reading.value.temp, time: reading.value.time, spotName: spot.value.name })
    collection.value = outcome.collection
    return { newBadge: outcome.newBadge, newRecord: outcome.newRecord, badge }
}

function achievementText({ newBadge, newRecord, badge }) {
    if (newBadge) return `Lencana baru: ${badge.name}!`
    if (newRecord) return 'Rekor suhu terdinginmu!'
    return null
}

async function writeClipboardText(text) {
    try {
        await navigator.clipboard.writeText(text)
        return true
    } catch {
        // Older browsers: fall back to a temporary textarea.
        const area = document.createElement('textarea')
        area.value = text
        area.setAttribute('readonly', '')
        area.style.position = 'fixed'
        area.style.opacity = '0'
        document.body.appendChild(area)
        area.select()
        const ok = document.execCommand('copy')
        area.remove()
        return ok
    }
}

async function copyCaption() {
    const ok = await writeClipboardText(shareCaption.value)
    toast(ok ? 'Caption disalin. Tempel saat posting!' : 'Gagal menyalin caption.', ok ? 'success' : 'error')
    if (ok) track('twibbon_caption_copy')
}

async function share() {
    if (!canExport.value) return
    const file = exportFile()
    // Caption goes to the clipboard so it can be pasted into the post.
    const captionCopied = writeClipboardText(shareCaption.value)
    if (CAN_SHARE_FILES && navigator.canShare({ files: [file] })) {
        try {
            await navigator.share({ files: [file] })
            const achievement = celebrate()
            track('twibbon_export', trackParams('share'))
            const copied = await captionCopied
            toast(achievementText(achievement) ?? (copied ? `Caption disalin. Jangan lupa tag ${BRAND_HANDLE}!` : `Jangan lupa tag ${BRAND_HANDLE}!`), 'success')
            return
        } catch (error) {
            if (error?.name === 'AbortError') return
        }
    }
    showResult(file, { achievement: celebrate() })
    track('twibbon_export', trackParams('sheet'))
}

function download() {
    if (!canExport.value) return
    const file = exportFile()
    // Downloads from in-app browsers can navigate away and lose the editor; offer long-press instead.
    if (!IN_APP_BROWSER) triggerDownload(file)
    showResult(file, { achievement: celebrate(), downloaded: !IN_APP_BROWSER })
    track('twibbon_export', trackParams('download'))
}

async function copySticker() {
    if (!canExport.value) return
    const file = exportFile()
    try {
        await navigator.clipboard.write([new ClipboardItem({ [file.type]: file })])
        const achievement = celebrate()
        toast(achievementText(achievement) ?? 'Stiker disalin! Buka Instagram Story, lalu tempel.', 'success')
        track('twibbon_export', trackParams('copy'))
    } catch {
        toast('Browser tidak mengizinkan menyalin gambar. Pakai tombol Unduh.', 'error')
    }
}

function shareFromSheet() {
    const file = result.value?.file
    if (!file) return
    navigator.share({ files: [file] }).catch(() => {})
    track('twibbon_export', trackParams('sheet_share'))
}

function downloadFromSheet() {
    if (!result.value?.file) return
    triggerDownload(result.value.file)
    result.value = { ...result.value, downloaded: true }
}

const exportHint = computed(() => {
    if (canExport.value) return null
    return dataStatus.value.text ?? 'Menunggu data suhu…'
})

// ---------------------------------------------------------------------------
// Toasts

const toastMessage = ref(null)
let toastTimer = null
function toast(text, tone = 'info') {
    toastMessage.value = { text, tone }
    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => { toastMessage.value = null }, 4200)
}

// ---------------------------------------------------------------------------

let clock = null
const previousTitle = document.title

function onVisibilityChange() {
    // Coming back from the camera app: refresh if the reading is getting old.
    if (document.visibilityState === 'visible' && Date.now() - liveFetchedAt > 5 * 60 * 1000) loadLive()
}

onMounted(async () => {
    document.title = 'Twibbon Suhu Dieng · Cuaca Dieng'
    loadLive()
    clock = setInterval(() => { now.value = Date.now() }, 30 * 1000)
    document.addEventListener('visibilitychange', onVisibilityChange)
    document.fonts?.addEventListener?.('loadingdone', bumpAssets)
    await loadAssets()
    bumpAssets()
})

onBeforeUnmount(() => {
    document.title = previousTitle
    clearInterval(clock)
    clearTimeout(pastTimer)
    clearTimeout(toastTimer)
    document.removeEventListener('visibilitychange', onVisibilityChange)
    document.fonts?.removeEventListener?.('loadingdone', bumpAssets)
    if (result.value?.url) URL.revokeObjectURL(result.value.url)
    releasePhoto()
})
</script>

<template>
    <div class="h-[100vh] supports-[height:100dvh]:h-[100dvh] flex flex-col lg:flex-row overflow-hidden bg-slate-100 dark:bg-[#0a1524] text-slate-800 dark:text-slate-100 transition-colors duration-300"
        @dragover.prevent @drop.prevent="onDrop">

        <!-- Preview -->
        <section class="relative flex-1 min-h-0 min-w-0 flex flex-col bg-slate-50 dark:bg-[#0d1a2e] transition-colors duration-300">
            <header class="shrink-0 flex items-center justify-between px-4 lg:px-6 pt-3 pb-2">
                <router-link to="/" aria-label="Kembali ke beranda"
                    class="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="stroke-slate-600 dark:stroke-slate-400"
                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                </router-link>
                <div class="text-center leading-tight">
                    <h1 class="font-semibold text-sm tracking-wider uppercase text-slate-700 dark:text-slate-200">Twibbon Suhu</h1>
                    <p class="text-[11px] font-medium text-sky-500 dark:text-sky-400">{{ TREND_HASHTAG }}</p>
                </div>
                <button type="button" @click="toggleDark" :title="isDark ? 'Mode Terang' : 'Mode Gelap'" :aria-label="isDark ? 'Mode Terang' : 'Mode Gelap'"
                    class="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                    <svg v-if="!isDark" width="18" height="18" viewBox="0 0 24 24" fill="none" class="stroke-slate-500"
                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" /></svg>
                    <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" class="stroke-amber-400"
                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="5" />
                        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                    </svg>
                </button>
            </header>

            <div class="flex-1 min-h-0 px-4 pb-3 lg:px-10 lg:pb-10 lg:pt-2">
                <TwibbonCanvas ref="preview" :scene="scene" :interactive="interactive" :label="previewLabel"
                    @update:view="view = $event" @interaction="dragging = $event">
                    <div v-if="dataStatus.kind === 'loading' || photoLoading"
                        class="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full bg-slate-900/70 text-white text-xs font-medium px-3 py-1.5 backdrop-blur pointer-events-none">
                        <span class="w-3 h-3 rounded-full border-2 border-white/40 border-t-white animate-spin"></span>
                        {{ photoLoading ? 'Membuka foto…' : dataStatus.text }}
                    </div>
                </TwibbonCanvas>
            </div>
        </section>

        <!-- Controls -->
        <aside class="shrink-0 lg:w-[440px] xl:w-[480px] flex flex-col min-h-0 bg-white dark:bg-[#0f1b2d] border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-white/10 transition-colors duration-300">
            <nav class="lg:hidden shrink-0 grid grid-cols-5 px-2 pt-1.5 border-b border-slate-100 dark:border-white/5" aria-label="Pengaturan twibbon">
                <button v-for="tab in TABS" :key="tab.id" type="button" @click="activeTab = tab.id"
                    :aria-pressed="activeTab === tab.id"
                    class="flex flex-col items-center gap-1 py-1.5 text-[11px] font-semibold transition-colors border-b-2"
                    :class="activeTab === tab.id ? 'text-sky-600 dark:text-sky-400 border-sky-500' : 'text-slate-400 dark:text-slate-500 border-transparent'">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path v-for="(d, i) in tab.icon" :key="i" :d="d" />
                    </svg>
                    {{ tab.label }}
                </button>
            </nav>

            <div class="h-[clamp(13rem,34vh,18rem)] lg:h-auto lg:flex-1 overflow-y-auto overscroll-contain px-4 py-3 lg:px-6 lg:py-6 lg:space-y-8">
                <div v-if="IN_APP_BROWSER" class="mb-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 px-3 py-2.5 text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                    Kamu membuka halaman ini dari aplikasi {{ IN_APP_BROWSER }}. Kalau menyimpan gambar tidak berhasil,
                    tekan lama gambar hasil, atau buka lewat Chrome/Safari.
                </div>

                <!-- Foto -->
                <section :class="panelClass('foto')" aria-labelledby="sec-foto">
                    <h2 id="sec-foto" class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-3">Foto</h2>
                    <input ref="fileInput" type="file" accept="image/*" class="sr-only" tabindex="-1" @change="onFileChange">

                    <p v-if="template.usesPhoto === false" class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                        Desain <b>Stiker</b> tidak memakai foto. Salin atau unduh stikernya, lalu tempel di atas foto atau video di Instagram Story-mu.
                    </p>
                    <template v-else>
                        <button v-if="!photo" type="button" @click="pickPhoto"
                            class="w-full flex items-center gap-4 rounded-2xl border-2 border-dashed border-sky-200 dark:border-sky-500/30 bg-sky-50/60 dark:bg-sky-500/5 hover:bg-sky-50 dark:hover:bg-sky-500/10 px-4 py-4 text-left transition-colors">
                            <span class="w-11 h-11 shrink-0 rounded-xl bg-sky-500 flex items-center justify-center">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                    <circle cx="12" cy="13" r="4" />
                                </svg>
                            </span>
                            <span>
                                <span class="block font-semibold text-slate-800 dark:text-slate-100">Pilih foto kunjunganmu</span>
                                <span class="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">Dari galeri atau kamera. Tanpa foto, kami pakai lanskap Dieng.</span>
                            </span>
                        </button>

                        <div v-else class="space-y-3">
                            <div class="flex gap-2">
                                <button type="button" @click="pickPhoto"
                                    class="flex-1 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-sm font-semibold py-2.5 transition-colors">
                                    Ganti foto
                                </button>
                                <button type="button" @click="removePhoto"
                                    class="rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-sm font-semibold px-4 py-2.5 text-slate-600 dark:text-slate-300 transition-colors">
                                    Hapus
                                </button>
                            </div>
                            <label class="flex items-center gap-3">
                                <span class="text-xs font-semibold text-slate-500 dark:text-slate-400 w-10">Zoom</span>
                                <input v-model="zoom" type="range" min="1" :max="MAX_ZOOM" step="0.01" class="flex-1 accent-sky-500" aria-label="Zoom foto">
                                <button type="button" @click="view = { ...DEFAULT_VIEW }"
                                    class="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline">Reset</button>
                            </label>
                            <p class="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
                                Geser foto di pratinjau untuk mengatur posisi. Cubit atau scroll untuk zoom, ketuk dua kali untuk reset.
                            </p>
                        </div>

                        <div v-if="photoSuggestion" class="mt-3 rounded-xl bg-sky-50 dark:bg-sky-500/10 border border-sky-100 dark:border-sky-500/20 px-3 py-2.5">
                            <p class="text-xs text-sky-800 dark:text-sky-300 leading-relaxed">
                                Foto ini diambil <b>{{ photoSuggestion }} WIB</b>. Pakai suhu Dieng saat foto diambil?
                            </p>
                            <button type="button" @click="useHistory(photoTime)"
                                class="mt-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold px-3 py-1.5 transition-colors">
                                Pakai suhu saat itu
                            </button>
                        </div>
                    </template>
                    <p class="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                        Foto diproses di perangkatmu dan tidak diunggah ke mana pun.
                    </p>
                </section>

                <!-- Desain -->
                <section :class="panelClass('desain')" aria-labelledby="sec-desain">
                    <h2 id="sec-desain" class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-3">Desain</h2>
                    <TemplatePicker v-model="templateId" :templates="TEMPLATES" :scene="scene" :format="format" :paused="dragging" />
                    <div class="mt-3">
                        <div v-if="!template.size" class="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 dark:bg-white/5 p-1" role="radiogroup" aria-label="Ukuran">
                            <button v-for="f in FORMATS" :key="f.id" type="button" role="radio" :aria-checked="formatId === f.id"
                                @click="formatId = f.id"
                                class="rounded-lg py-2 text-sm font-semibold transition-colors"
                                :class="formatId === f.id ? 'bg-white dark:bg-white/15 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'">
                                {{ f.label }} <span class="text-xs font-medium opacity-60">{{ f.ratio }}</span>
                            </button>
                        </div>
                        <p v-else class="text-xs text-slate-400 dark:text-slate-500">PNG transparan 1080 × 1000 px — pas ditempel di story.</p>
                    </div>
                </section>

                <!-- Suhu -->
                <section :class="panelClass('suhu')" aria-labelledby="sec-suhu">
                    <h2 id="sec-suhu" class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-3">Data suhu</h2>
                    <div class="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 dark:bg-white/5 p-1 mb-3" role="radiogroup" aria-label="Waktu data">
                        <button type="button" role="radio" :aria-checked="mode === 'live'" @click="setMode('live')"
                            class="rounded-lg py-2 text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                            :class="mode === 'live' ? 'bg-white dark:bg-white/15 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'">
                            <span class="relative flex w-2 h-2">
                                <span class="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" :class="mode === 'live' ? 'animate-ping' : ''"></span>
                                <span class="relative inline-flex rounded-full w-2 h-2 bg-emerald-500"></span>
                            </span>
                            Sekarang
                        </button>
                        <button type="button" role="radio" :aria-checked="mode === 'history'" @click="setMode('history')"
                            class="rounded-lg py-2 text-sm font-semibold transition-colors"
                            :class="mode === 'history' ? 'bg-white dark:bg-white/15 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'">
                            Waktu lain
                        </button>
                    </div>

                    <div v-if="mode === 'history'" class="space-y-2 mb-3">
                        <label class="block">
                            <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Tanggal &amp; jam kunjungan (WIB)</span>
                            <input v-model="historyInput" type="datetime-local" min="2020-06-01T00:00" :max="historyMax"
                                class="mt-1 w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-400 [color-scheme:light] dark:[color-scheme:dark]">
                        </label>
                        <div class="flex flex-wrap gap-2">
                            <button v-if="photoTime" type="button" @click="useHistory(photoTime)"
                                class="rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-xs font-semibold px-3 py-1.5 transition-colors">
                                Waktu foto · {{ toWib(photoTime).format('D MMM HH.mm') }}
                            </button>
                            <button type="button" @click="useHistory(lastDawn())"
                                class="rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-xs font-semibold px-3 py-1.5 transition-colors">
                                Subuh terakhir · 05.00
                            </button>
                        </div>
                    </div>

                    <div class="rounded-2xl border border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-4 py-3">
                        <div v-if="dataStatus.kind === 'loading' && !data.ready" class="flex items-center gap-3 py-1">
                            <span class="w-5 h-5 rounded-full border-2 border-sky-200 border-t-sky-500 animate-spin"></span>
                            <span class="text-sm text-slate-500 dark:text-slate-400">{{ dataStatus.text }}</span>
                        </div>
                        <div v-else-if="dataStatus.kind === 'error' || dataStatus.kind === 'idle'" class="flex items-center justify-between gap-3 py-1">
                            <span class="text-sm" :class="dataStatus.kind === 'error' ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'">{{ dataStatus.text }}</span>
                            <button v-if="dataStatus.kind === 'error'" type="button" @click="mode === 'live' ? loadLive() : loadPast()"
                                class="shrink-0 text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline">Coba lagi</button>
                        </div>
                        <div v-else class="flex items-center gap-4" :class="dataStatus.kind === 'loading' ? 'opacity-60' : ''">
                            <p class="font-display text-4xl font-bold tracking-tight text-slate-800 dark:text-white">{{ data.tempText }}<span class="text-xl text-slate-400">°C</span></p>
                            <div class="flex-1 min-w-0 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                <p class="font-semibold text-slate-700 dark:text-slate-200">{{ data.dateShort }} · {{ data.time }} WIB</p>
                                <p>Kelembapan {{ data.humidityText }}<template v-if="data.kondisi"> · {{ data.kondisi }}</template></p>
                                <p v-if="data.minText">Terendah 24 jam {{ data.minText }}°C ({{ data.minTime }})</p>
                            </div>
                            <button v-if="mode === 'live'" type="button" @click="loadLive" aria-label="Perbarui data"
                                class="w-9 h-9 shrink-0 rounded-xl flex items-center justify-center hover:bg-slate-200/60 dark:hover:bg-white/10 transition-colors">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                                    class="text-slate-500" :class="liveStatus === 'refreshing' ? 'animate-spin' : ''">
                                    <path d="M23 4v6h-6M1 20v-6h6" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                                </svg>
                            </button>
                        </div>
                        <p v-if="mode === 'live' && liveReading" class="mt-2 text-[11px]"
                            :class="liveStale ? 'text-amber-600 dark:text-amber-400 font-medium' : 'text-slate-400 dark:text-slate-500'">
                            {{ liveStale ? `Sensor belum mengirim data baru sejak ${liveAge}.` : `Data sensor ${liveAge}.` }}
                        </p>
                    </div>
                    <p class="mt-3 text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">
                        Suhu asli dari sensor Cuaca Dieng di {{ STATION_NAME }}, bukan perkiraan.
                        <template v-if="mode === 'history'">Data diambil dari catatan sensor terdekat dengan waktu yang kamu pilih.</template>
                    </p>
                </section>

                <!-- Lokasi & teks -->
                <section :class="panelClass('lokasi')" aria-labelledby="sec-lokasi">
                    <h2 id="sec-lokasi" class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-3">Lokasi</h2>
                    <div class="flex flex-wrap gap-2" role="radiogroup" aria-label="Lokasi">
                        <button v-for="s in SPOTS" :key="s.id" type="button" role="radio" :aria-checked="spotId === s.id" @click="spotId = s.id"
                            class="rounded-full border text-xs font-semibold px-3 py-1.5 transition-colors"
                            :class="spotId === s.id ? 'bg-sky-500 border-sky-500 text-white' : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'">
                            {{ s.short }}
                        </button>
                        <button type="button" role="radio" :aria-checked="spotId === 'custom'" @click="spotId = 'custom'"
                            class="rounded-full border text-xs font-semibold px-3 py-1.5 transition-colors"
                            :class="spotId === 'custom' ? 'bg-sky-500 border-sky-500 text-white' : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'">
                            Lainnya…
                        </button>
                    </div>
                    <input v-if="spotId === 'custom'" v-model="customSpot" type="text" maxlength="40" placeholder="Nama tempat, mis. Telaga Cebong"
                        aria-label="Nama tempat"
                        class="mt-3 w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400">
                    <p class="mt-2 text-[11px] text-slate-400 dark:text-slate-500">
                        {{ spot.elevationText ? `Ketinggian ${spot.elevationText}.` : 'Ketinggian tidak ditampilkan untuk lokasi lain.' }}
                    </p>

                    <h2 class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mt-5 mb-2">
                        {{ template.id === 'tiket' ? 'Nama penumpang' : 'Judul' }} <span class="normal-case font-normal tracking-normal">(opsional)</span>
                    </h2>
                    <input v-model="caption" type="text" maxlength="40" :placeholder="captionPlaceholder" aria-label="Judul atau nama"
                        class="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400">
                </section>

                <!-- Tren -->
                <section :class="panelClass('tren')" aria-labelledby="sec-tren">
                    <h2 id="sec-tren" class="sr-only lg:not-sr-only text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 lg:mb-3 lg:block">Tren</h2>
                    <div class="rounded-2xl bg-gradient-to-br from-sky-500 via-sky-600 to-indigo-700 text-white p-4 shadow-lg shadow-sky-500/20">
                        <p class="text-[11px] font-semibold uppercase tracking-widest text-sky-100">Ikut tren</p>
                        <p class="font-display text-2xl font-bold tracking-tight mt-0.5">{{ TREND_HASHTAG }}</p>
                        <p class="text-sm text-sky-50/90 mt-1 leading-relaxed">
                            Seberapa dingin Dieng waktu kamu datang? Abadikan suhunya, bagikan, dan tag {{ BRAND_HANDLE }}.
                        </p>
                        <ol class="mt-3 space-y-1.5 text-sm">
                            <li class="flex gap-2"><span class="w-5 h-5 shrink-0 rounded-full bg-white/20 text-xs font-bold flex items-center justify-center">1</span>Foto momenmu di Dieng</li>
                            <li class="flex gap-2"><span class="w-5 h-5 shrink-0 rounded-full bg-white/20 text-xs font-bold flex items-center justify-center">2</span>Pilih desain &amp; data suhunya</li>
                            <li class="flex gap-2"><span class="w-5 h-5 shrink-0 rounded-full bg-white/20 text-xs font-bold flex items-center justify-center">3</span>Bagikan dengan hashtag di atas</li>
                        </ol>
                    </div>

                    <div class="mt-4 rounded-2xl border border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-3">
                        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">Caption</p>
                        <p class="text-sm whitespace-pre-line text-slate-700 dark:text-slate-200 leading-relaxed">{{ shareCaption }}</p>
                        <button type="button" @click="copyCaption"
                            class="mt-3 w-full rounded-xl bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/15 text-sm font-semibold py-2 transition-colors">
                            Salin caption
                        </button>
                    </div>

                    <div class="mt-5">
                        <BadgeShelf :collection="collection" :current="data.badge" />
                    </div>
                </section>
            </div>

            <!-- Actions -->
            <div class="shrink-0 border-t border-slate-100 dark:border-white/10 px-4 lg:px-6 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                <div class="flex gap-2">
                    <button v-if="template.transparent && CAN_COPY_IMAGE" type="button" :disabled="!canExport" @click="copySticker"
                        class="flex-1 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-sm font-semibold py-3 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                        Salin stiker
                    </button>
                    <button type="button" :disabled="!canExport" @click="download"
                        :class="CAN_SHARE_FILES
                            ? 'bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-800 dark:text-slate-100'
                            : 'bg-sky-500 hover:bg-sky-600 text-white shadow-lg shadow-sky-500/25'"
                        class="flex-1 rounded-xl text-sm font-semibold py-3 transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
                        Unduh
                    </button>
                    <button v-if="CAN_SHARE_FILES" type="button" :disabled="!canExport" @click="share"
                        class="flex-[1.4] rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold py-3 shadow-lg shadow-sky-500/25 transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" /></svg>
                        Bagikan
                    </button>
                    <button v-else type="button" @click="copyCaption"
                        class="flex-1 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-sm font-semibold py-3 transition-colors">
                        Salin caption
                    </button>
                </div>
                <p v-if="exportHint" class="mt-2 text-center text-[11px] text-slate-400 dark:text-slate-500">{{ exportHint }}</p>
            </div>
        </aside>

        <ResultSheet :open="resultOpen" :result="result" :can-share="CAN_SHARE_FILES" :in-app-browser="IN_APP_BROWSER"
            @close="resultOpen = false" @share="shareFromSheet" @download="downloadFromSheet" @copy-caption="copyCaption" />

        <transition enter-active-class="transition duration-300 ease-out" enter-from-class="translate-y-4 opacity-0"
            enter-to-class="translate-y-0 opacity-100" leave-active-class="transition duration-200 ease-in"
            leave-from-class="translate-y-0 opacity-100" leave-to-class="translate-y-4 opacity-0">
            <div v-if="toastMessage" role="status"
                class="fixed z-[60] left-4 right-4 sm:left-auto sm:right-6 bottom-28 sm:max-w-sm text-sm font-medium px-5 py-3 rounded-2xl shadow-xl text-white"
                :class="toastMessage.tone === 'error' ? 'bg-red-500' : toastMessage.tone === 'success' ? 'bg-emerald-600' : 'bg-slate-800'">
                {{ toastMessage.text }}
            </div>
        </transition>
    </div>
</template>
