// Twibbon Suhu — feature configuration.
// The trend hashtag lives here so it can be changed in one place.

export const TREND_HASHTAG = '#DiengBerapaDerajat'
export const BRAND_HASHTAG = '#CuacaDieng'
export const BRAND_HANDLE = '@CuacaDieng'
export const BRAND_NAME = 'CUACA DIENG'
export const STATION_NAME = 'Dieng Kulon'
// Printed on the images and used in the share caption.
export const SITE_URL = window.location.host.replace(/^www\./, '')

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
