// Twibbon Suhu — feature configuration.
// The trend hashtag lives here so it can be changed in one place.

export const TREND_HASHTAG = '#DiengBerapaDerajat'
export const BRAND_HASHTAG = '#CuacaDieng'
export const BRAND_HANDLE = '@cuacadieng'
export const BRAND_NAME = 'CUACA DIENG'
export const STATION_NAME = 'Dieng Kulon'

// Output sizes. `safe` keeps text clear of Instagram's story UI (top bar, reply box).
export const FORMATS = [
    { id: 'story', label: 'Story', ratio: '9:16', width: 1080, height: 1920, safe: { top: 180, bottom: 230, x: 72 } },
    { id: 'feed', label: 'Feed', ratio: '4:5', width: 1080, height: 1350, safe: { top: 72, bottom: 72, x: 72 } },
    { id: 'square', label: 'Kotak', ratio: '1:1', width: 1080, height: 1080, safe: { top: 60, bottom: 60, x: 64 } },
]

// Popular spots and their commonly cited elevations (mdpl).
// The temperature always comes from the Cuaca Dieng sensor in Dieng Kulon.
export const SPOTS = [
    { id: 'dieng', name: 'Dataran Tinggi Dieng', short: 'Dieng', code: 'DNG', elevation: 2093 },
    { id: 'arjuna', name: 'Candi Arjuna', short: 'Candi Arjuna', code: 'ARJ', elevation: 2093 },
    { id: 'sikunir', name: 'Bukit Sikunir', short: 'Sikunir', code: 'SKN', elevation: 2263 },
    { id: 'prau', name: 'Gunung Prau', short: 'Prau', code: 'PRU', elevation: 2565 },
    { id: 'telaga-warna', name: 'Telaga Warna', short: 'Telaga Warna', code: 'TWN', elevation: 2000 },
    { id: 'sikidang', name: 'Kawah Sikidang', short: 'Sikidang', code: 'SKD', elevation: 2000 },
    { id: 'ratapan-angin', name: 'Batu Ratapan Angin', short: 'Ratapan Angin', code: 'BRA', elevation: 2100 },
]

// Temperature achievements, coldest first. `upTo` is inclusive for the first tier
// (0°C counts as minus club) and exclusive for the rest.
export const BADGES = [
    { id: 'minus', name: 'Klub Minus', rule: '0°C atau lebih dingin', upTo: 0, color: '#c4b5fd', color2: '#7c3aed', icon: 'snowflake', emoji: '🥶' },
    { id: 'embun-es', name: 'Pemburu Embun Es', rule: 'Di bawah 6°C', upTo: 6, color: '#7dd3fc', color2: '#0284c7', icon: 'frost', emoji: '❄️' },
    { id: 'tahan-dingin', name: 'Tahan Dingin', rule: '6°C – 10°C', upTo: 10, color: '#67e8f9', color2: '#0e7490', icon: 'thermometer', emoji: '🧣' },
    { id: 'sejuk', name: 'Penikmat Sejuk', rule: '10°C – 15°C', upTo: 15, color: '#6ee7b7', color2: '#047857', icon: 'leaf', emoji: '🌿' },
    { id: 'hangat', name: 'Dieng Hangat', rule: '15°C ke atas', upTo: Infinity, color: '#fcd34d', color2: '#d97706', icon: 'sun', emoji: '☀️' },
]

export function getBadge(temp) {
    if (temp == null || !Number.isFinite(temp)) return null
    // Judge the value people actually see (one decimal) so the badge matches the image.
    const shown = Math.round(temp * 10) / 10
    if (shown <= BADGES[0].upTo) return BADGES[0]
    return BADGES.slice(1).find(b => shown < b.upTo)
}
