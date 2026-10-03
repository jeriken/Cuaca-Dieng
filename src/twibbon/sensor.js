import axios from 'axios'
import moment from 'moment/min/moment-with-locales'
import { getKondisi } from '../utils/kondisi.js'
import { toWib } from './format.js'

const CHANNEL_URL = 'https://api.thingspeak.com/channels/1082329'
const TIMEZONE = 'Asia/Jakarta'
const DAY_MS = 24 * 60 * 60 * 1000
// A historical reading must come from within this window around the requested time.
const MAX_GAP_MINUTES = 20

const toNumber = (value) => {
    const n = parseFloat(value)
    return Number.isFinite(n) ? n : null
}

// Drop values a working sensor can't produce (unplugged probes report -127, 85, ...).
const plausibleTemp = (t) => (t != null && t > -20 && t < 45 ? t : null)
const plausibleHumidity = (h) => (h != null && h >= 0 && h <= 100 ? h : null)

function parseEntry(entry) {
    const pressure = toNumber(entry.field3)
    return {
        time: new Date(entry.created_at),
        temp: plausibleTemp(toNumber(entry.field1)),
        humidity: plausibleHumidity(toNumber(entry.field2)),
        pressure,
        kondisi: pressure == null ? null : getKondisi(entry.field3, entry.field5),
    }
}

const stamp = (m) => toWib(m).format('YYYY-MM-DD HH:mm:ss')

async function getJson(path, params) {
    const query = Object.entries({ timezone: TIMEZONE, ...params })
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&')
    const { data } = await axios.get(`${CHANNEL_URL}/${path}?${query}`)
    return data
}

function toTrace(feeds) {
    return (feeds || [])
        .map(entry => ({ t: new Date(entry.created_at).getTime(), v: plausibleTemp(toNumber(entry.field1)) }))
        .filter(point => point.v != null && Number.isFinite(point.t))
        .sort((a, b) => a.t - b.t)
}

// Attach the 24 hours leading up to the reading, ending exactly on it.
function withTrace(reading, trace, mode) {
    const end = reading.time.getTime()
    const start = end - DAY_MS
    const points = trace.filter(p => p.t >= start && p.t < end - 60 * 1000)
    points.push({ t: end, v: reading.temp })

    const min = points.reduce((lowest, p) => (p.v < lowest.v ? p : lowest), points[0])
    return {
        ...reading,
        mode,
        trace: points,
        traceStart: start,
        min: { temp: min.v, time: new Date(min.t) },
    }
}

export async function fetchLiveReading() {
    const [last, series] = await Promise.all([
        getJson('feed/last.json', {}),
        getJson('fields/1.json', { days: 1, timescale: 15 }).catch(() => null),
    ])
    if (!last?.created_at) throw new Error('Sensor belum mengirim data')
    const reading = parseEntry(last)
    if (reading.temp == null) throw new Error('Data suhu sensor tidak valid')
    return withTrace(reading, toTrace(series?.feeds), 'live')
}

// The sensor reading closest to `instant`, or null when the sensor has no data then.
export async function fetchReadingAt(instant) {
    const at = moment(instant)
    const [around, series] = await Promise.all([
        getJson('feeds.json', {
            start: stamp(at.clone().subtract(MAX_GAP_MINUTES, 'minutes')),
            end: stamp(at.clone().add(MAX_GAP_MINUTES, 'minutes')),
        }),
        getJson('fields/1.json', {
            start: stamp(at.clone().subtract(24, 'hours')),
            end: stamp(at),
            timescale: 15,
        }).catch(() => null),
    ])

    const target = at.valueOf()
    let nearest = null
    for (const entry of around?.feeds || []) {
        const reading = parseEntry(entry)
        if (reading.temp == null) continue
        const gap = Math.abs(reading.time.getTime() - target)
        if (!nearest || gap < nearest.gap) nearest = { reading, gap }
    }
    if (!nearest) return null

    // Keep the moment the person picked; the value is the sensor's nearest entry.
    return withTrace({ ...nearest.reading, time: new Date(target) }, toTrace(series?.feeds), 'history')
}
