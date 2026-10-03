import moment from 'moment/min/moment-with-locales'
import { getBadge, BRAND_HANDLE, BRAND_HASHTAG, TREND_HASHTAG } from './config.js'
moment.locale('id')

// Dieng is on WIB (UTC+7, no DST). Format in WIB even if the phone uses another zone.
const WIB_OFFSET_MINUTES = 7 * 60
const MINUS = '−'

export const toWib = (date) => moment(date).utcOffset(WIB_OFFSET_MINUTES)

export function fmtTemp(value) {
    if (value == null || !Number.isFinite(value)) return '--'
    const fixed = Math.abs(value).toFixed(1)
    const negative = value < 0 && fixed !== '0.0'
    return (negative ? MINUS : '') + fixed.replace('.', ',')
}

// "−3,4" → { sign: '−', int: '3', dec: ',4' } for big-number typography.
export function tempParts(value) {
    const text = fmtTemp(value)
    if (text === '--') return { sign: '', int: '--', dec: '' }
    const sign = text.startsWith(MINUS) ? MINUS : ''
    const [int, dec] = text.slice(sign.length).split(',')
    return { sign, int, dec: `,${dec}` }
}

export const fmtThousands = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.')

export const fmtPercent = (value) => (value == null ? '--' : `${Math.round(value)}%`)

export function dayPeriod(hour) {
    if (hour < 4) return 'dini hari'
    if (hour < 11) return 'pagi'
    if (hour < 15) return 'siang'
    if (hour < 18) return 'sore'
    return 'malam'
}

const EMPTY_DATA = {
    ready: false,
    temp: null,
    tempText: '--',
    tempParts: { sign: '', int: '--', dec: '' },
    humidityText: '--',
    pressureText: '--',
    kondisi: null,
    minText: null,
    minTime: null,
    trace: [],
    badge: null,
}

// Turn a sensor reading into display-ready strings for the templates.
export function describeReading(reading, now = new Date()) {
    const time = toWib(reading?.time ?? now)
    const base = {
        ...EMPTY_DATA,
        dateLong: time.format('dddd, D MMMM YYYY'),
        dateShort: time.format('ddd, D MMM YYYY'),
        dateNum: time.format('DD.MM.YYYY'),
        time: time.format('HH.mm'),
        weekday: time.format('dddd'),
        period: dayPeriod(time.hour()),
        hour: time.hour(),
        mode: reading?.mode ?? 'live',
    }
    if (!reading || reading.temp == null) return base

    return {
        ...base,
        ready: true,
        temp: reading.temp,
        tempText: fmtTemp(reading.temp),
        tempParts: tempParts(reading.temp),
        humidityText: fmtPercent(reading.humidity),
        pressureText: reading.pressure == null ? '--' : `${reading.pressure.toFixed(1).replace('.', ',')} mBar`,
        kondisi: reading.kondisi,
        minText: reading.min ? fmtTemp(reading.min.temp) : null,
        minTime: reading.min ? toWib(reading.min.time).format('HH.mm') : null,
        trace: reading.trace ?? [],
        traceStart: reading.traceStart,
        traceEnd: reading.time.getTime(),
        badge: getBadge(reading.temp),
    }
}

export function describeSpot(spot) {
    return {
        ...spot,
        elevationText: spot.elevation ? `${fmtThousands(spot.elevation)} mdpl` : null,
    }
}

// Three-letter "airport code" for custom places, e.g. "Telaga Cebong" → "TLC".
export function spotCode(name) {
    const letters = name.toUpperCase().replace(/[^A-Z]/g, '')
    if (!letters) return 'DNG'
    const consonants = letters[0] + letters.slice(1).replace(/[AIUEO]/g, '')
    return (consonants.length >= 3 ? consonants : letters).slice(0, 3).padEnd(3, 'X')
}

export function buildShareCaption({ data, spot, link }) {
    const badge = data.badge
    return [
        `${spot.name} ${data.tempText}°C ${badge?.emoji ?? ''}`.trim(),
        `${data.dateShort} · ${data.time} WIB${badge ? ` · Lencana ${badge.name}` : ''}`,
        '',
        `Bikin twibbon suhumu di ${link}`,
        `${TREND_HASHTAG} ${BRAND_HASHTAG} ${BRAND_HANDLE}`,
    ].join('\n')
}
