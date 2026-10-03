import { computed } from 'vue'
import moment from 'moment'

// Every insight returns { value, text } — a short headline plus one line of
// supporting facts joined with ' · ' — or null while its data hasn't arrived yet.

// Station timestamps come back in WIB (timezone=Asia/Jakarta); OWM uses unix
// seconds in UTC (its dt_txt is UTC too, so never parse that as local time).
const wib = (createdAt) => moment.parseZone(createdAt).utcOffset(7)
const owmTime = (item) => moment.unix(item.dt).utcOffset(7)
const fmt1 = (n) => n.toFixed(1).replace('.', ',')

// Dew point (Magnus formula) — how close the air is to saturation, i.e. fog/dew
const dewPoint = (t, rh) => {
    const a = 17.27, b = 237.7
    const g = (a * t) / (b + t) + Math.log(rh / 100)
    return (b * g) / (a - g)
}

const isRainy = (e) => ['Rain', 'Drizzle', 'Thunderstorm'].includes(e.weather?.[0]?.main) || (e.pop ?? 0) >= 0.5

export function useAnalytics(feedData, mainData, predictionData, isDaily) {
    const readings = computed(() => (feedData.value?.feeds || [])
        .map(f => ({ t: wib(f.created_at), temp: parseFloat(f.field1) }))
        .filter(r => !isNaN(r.temp)))

    // Next 24h of forecast slots (3-hourly), skipping ones already in the past
    const next24 = computed(() => {
        const list = predictionData.value?.list
        if (!list?.length) return []
        const now = Date.now() / 1000
        return list.filter(e => e.dt + 3 * 3600 > now).slice(0, 8)
    })

    // Temperature trend: recent direction (hourly view) or start→end of period (daily view)
    const tempTrend = computed(() => {
        const r = readings.value
        if (r.length < 4) return null
        const last = r[r.length - 1]
        const min = r.reduce((a, b) => (b.temp < a.temp ? b : a))
        const max = r.reduce((a, b) => (b.temp > a.temp ? b : a))

        if (isDaily.value) {
            const first = r[0]
            const diff = last.temp - first.temp
            return {
                value: Math.abs(diff) < 1 ? 'Stabil' : `${diff > 0 ? 'Naik' : 'Turun'} ${fmt1(Math.abs(diff))}°C`,
                text: `Sejak ${first.t.format('DD/MM')} · terdingin ${fmt1(min.temp)}° (${min.t.format('DD/MM')})`,
            }
        }

        // Reading closest to 3 hours before the latest one
        const target = last.t.valueOf() - 3 * 3600 * 1000
        const ref = r.reduce((a, b) => (Math.abs(b.t.valueOf() - target) < Math.abs(a.t.valueOf() - target) ? b : a))
        const diff = last.temp - ref.temp
        return {
            value: Math.abs(diff) < 1 ? 'Stabil' : `${diff > 0 ? 'Naik' : 'Turun'} ${fmt1(Math.abs(diff))}°C`,
            text: `3 jam terakhir · min ${fmt1(min.temp)}° (${min.t.format('HH:mm')}) · maks ${fmt1(max.temp)}° (${max.t.format('HH:mm')})`,
        }
    })

    // Live reading put in context: vs the period average, plus fog risk from dew point
    const currentInsight = computed(() => {
        const temp = parseFloat(mainData.value?.field1)
        const humidity = parseFloat(mainData.value?.field2)
        const pressure = parseFloat(mainData.value?.field3)
        if (isNaN(temp)) return null

        const parts = []
        const r = readings.value
        if (r.length) {
            const avg = r.reduce((s, x) => s + x.temp, 0) / r.length
            const diff = temp - avg
            const period = isDaily.value ? 'rata-rata periode' : 'rata-rata 24 jam'
            parts.push(Math.abs(diff) < 1 ? `Setara ${period}` : `${fmt1(Math.abs(diff))}° ${diff > 0 ? 'di atas' : 'di bawah'} ${period}`)
        }
        if (!isNaN(humidity) && humidity > 0) {
            parts.push(`lembap ${Math.round(humidity)}%`)
            if (temp - dewPoint(temp, Math.min(humidity, 100)) < 2.5) parts.push('berpotensi kabut')
        }
        if (!isNaN(pressure) && pressure < 794) parts.push('tekanan rendah')

        const text = parts.join(' · ')
        return { value: `${fmt1(temp)}°C`, text: text ? text.charAt(0).toUpperCase() + text.slice(1) : 'Pembacaan langsung dari stasiun' }
    })

    // Next 24h from OWM: when rain is expected, temperature range, strongest wind
    const forecastSummary = computed(() => {
        const slots = next24.value
        if (!slots.length) return null

        // Merge consecutive rainy slots into time windows, e.g. "13:00–19:00"
        const windows = []
        for (const e of slots) {
            const start = owmTime(e)
            const prev = windows[windows.length - 1]
            if (!isRainy(e)) continue
            if (prev && prev.end.valueOf() === start.valueOf()) prev.end = start.clone().add(3, 'h')
            else windows.push({ start, end: start.clone().add(3, 'h') })
        }
        const temps = slots.map(e => e.main.temp)
        const maxWind = Math.max(...slots.map(e => e.wind?.speed ?? 0))
        const maxPop = Math.max(...slots.map(e => e.pop ?? 0))
        const rest = `${Math.round(Math.min(...temps))}–${Math.round(Math.max(...temps))}°C · angin ≤${fmt1(maxWind)} m/s`

        if (!windows.length) {
            return { value: 'Tanpa hujan', text: `24 jam ke depan · ${rest}` }
        }
        const w = windows[0]
        const more = windows.length > 1 ? ` · +${windows.length - 1} periode lagi` : ''
        return {
            value: `Hujan ${w.start.format('HH:mm')}–${w.end.format('HH:mm')}`,
            text: `Peluang ${Math.round(maxPop * 100)}% · ${rest}${more}`,
        }
    })

    // Frost (embun es) outlook for tonight. Forms on clear, calm nights when the
    // station drops to ~4°C or below, usually around 04:00–06:00.
    const embunEsPrediction = computed(() => {
        const slots = next24.value
        const r = readings.value
        if (!slots.length && !r.length) return null

        const now = moment().utcOffset(7)
        // Forecast slots overlapping tonight (21:00 → 06:00)
        const nightStart = now.clone().hour(now.hour() < 7 ? -3 : 21).startOf('hour')
        const nightEnd = nightStart.clone().add(9, 'h')
        const night = slots.filter(e => {
            const t = owmTime(e)
            return t.isBefore(nightEnd) && t.clone().add(3, 'h').isAfter(nightStart)
        })
        const calm = night.length ? Math.max(...night.map(e => e.wind?.speed ?? 0)) < 3 : null
        const clear = night.length ? night.reduce((s, e) => s + (e.clouds?.all ?? 100), 0) / night.length < 50 : null

        // Coldest station reading in the most recent 00:00–07:00 window (hourly view only)
        let lastNight = null
        if (!isDaily.value) {
            for (const x of r) {
                if (x.t.hour() < 7 && (!lastNight || x.temp < lastNight.temp)) lastNight = x
            }
        }

        let score = 0
        if (lastNight) score += lastNight.temp <= 4 ? 2 : lastNight.temp <= 7 ? 1 : 0
        if (calm) score++
        if (clear) score++
        // Clouds trap heat, so an overcast night caps the outlook at 'Sedang'
        const level = score >= 3 && clear !== false ? 'Tinggi' : score >= 2 ? 'Sedang' : 'Rendah'

        const parts = []
        if (lastNight) parts.push(`Semalam ${fmt1(lastNight.temp)}° (${lastNight.t.format('HH:mm')})`)
        if (calm !== null) parts.push(`malam ini ${clear ? 'cerah' : 'berawan'}`, calm ? 'angin tenang' : 'berangin')
        if (level === 'Tinggi') parts.push('waspada 04.00–06.00')
        const text = parts.join(' · ')
        return { value: level, text: text ? text.charAt(0).toUpperCase() + text.slice(1) : 'Menunggu data malam ini' }
    })

    return { embunEsPrediction, tempTrend, currentInsight, forecastSummary }
}
