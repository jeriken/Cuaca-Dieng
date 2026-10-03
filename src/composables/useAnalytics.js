import { computed } from 'vue'
import moment from 'moment'
import 'moment/locale/id'
moment.locale('id')

export function useAnalytics(feedData, mainData, predictionData) {
    // Frost (embun es) prediction
    // Rule: real sensor temp (Field1) near 21:00 WIB < 5°C + calm wind → frost likely 04:00-06:00 next morning
    const embunEsPrediction = computed(() => {
        const feeds = feedData.value?.feeds
        const list = predictionData.value?.list
        if (!feeds?.length) return null

        const now = moment()

        // Cari pembacaan Field1 (suhu real ThingSpeak) yang paling dekat jam 21.00 hari ini
        const target21 = moment(now).hour(21).minute(0).second(0)
        let closest = null
        let closestDiff = Infinity
        for (const feed of feeds) {
            const t = moment(feed.created_at)
            if (!t.isSame(now, 'day')) continue
            const temp = parseFloat(feed.field1)
            if (isNaN(temp)) continue
            const diff = Math.abs(t.diff(target21))
            if (diff < closestDiff) {
                closestDiff = diff
                closest = temp
            }
        }
        const MAX_TOLERANCE_MS = 40 * 60 * 1000
        const temp21 = (closest !== null && closestDiff <= MAX_TOLERANCE_MS) ? closest : null
        if (temp21 === null) return null

        // Wind: tidak ada sensor angin di perangkat (field5 = kelembapan hujan), jadi tetap pakai prakiraan OWM
        let forecastWind = 0
        if (list?.length) {
            const nearest = list.find(item => {
                const t = moment(item.dt_txt)
                return t.isSame(now, 'day') && t.hour() >= now.hour()
            })
            forecastWind = nearest?.wind?.speed ?? 0
        }

        const coldEnough = temp21 < 5
        const calmWind = forecastWind < 3

        if (coldEnough && calmWind) {
            return `Suhu sensor pukul 21.00 tercatat ${temp21.toFixed(1)}°C dengan angin tenang — embun es berpotensi besar muncul dini hari nanti sekitar jam 04.00–06.00.`
        } else if (coldEnough && !calmWind) {
            return `Suhu sensor pukul 21.00 cukup rendah (${temp21.toFixed(1)}°C), tapi anginnya lumayan kencang, jadi embun es kemungkinan besar tidak akan terbentuk.`
        } else {
            return `Suhu sensor pukul 21.00 tercatat ${temp21.toFixed(1)}°C — masih terlalu hangat untuk munculnya embun es dini hari nanti.`
        }
    })

    // Temperature trend: compare first half vs second half of feed period
    const tempTrend = computed(() => {
        const feeds = feedData.value?.feeds
        if (!feeds || feeds.length < 4) return null

        const temps = feeds.map(f => parseFloat(f.field1)).filter(t => !isNaN(t))
        const mid = Math.floor(temps.length / 2)
        const avgFirst = temps.slice(0, mid).reduce((a, b) => a + b, 0) / mid
        const avgSecond = temps.slice(mid).reduce((a, b) => a + b, 0) / (temps.length - mid)
        const diff = avgSecond - avgFirst

        if (diff < -1.5) return `Suhu terlihat menurun sekitar ${Math.abs(diff).toFixed(1)}°C dibanding awal periode ini.`
        if (diff > 1.5) return `Suhu terlihat naik sekitar ${diff.toFixed(1)}°C dibanding awal periode ini.`
        return `Suhu cenderung stabil sepanjang periode ini, hanya berbeda tipis sekitar ${Math.abs(diff).toFixed(1)}°C.`
    })

    // Current live conditions from ThingSpeak mainData
    const currentInsight = computed(() => {
        const temp = parseFloat(mainData.value?.field1)
        const humidity = parseFloat(mainData.value?.field2)
        const pressure = parseFloat(mainData.value?.field3)
        if (isNaN(temp)) return null

        const currentHour = moment().hour()
        const inFrostWindow = currentHour >= 21 || currentHour < 7

        const parts = []
        if (inFrostWindow && temp < 5) parts.push(`suhu sangat dingin, ${Math.floor(temp)}°C — berpotensi embun es`)
        else if (temp < 6) parts.push(`suhu sangat dingin di ${Math.floor(temp)}°C`)
        else if (temp < 10) parts.push(`suhu masih sangat dingin di ${Math.floor(temp)}°C`)
        else if (temp < 15) parts.push(`suhu terasa dingin, sekitar ${Math.floor(temp)}°C`)
        else parts.push(`suhu sejuk, sekitar ${Math.floor(temp)}°C`)

        if (!isNaN(humidity)) {
            if (humidity > 90) parts.push('udara terasa sangat lembap')
            else if (humidity > 80) parts.push('kelembapan udara cukup tinggi')
        }
        if (!isNaN(pressure) && pressure < 793) parts.push('tekanan udara rendah, jadi ada potensi hujan')

        const sentence = parts.join(', ')
        return sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.'
    })

    // 24-hour forecast summary from OWM
    const forecastSummary = computed(() => {
        const list = predictionData.value?.list
        if (!list?.length) return null

        const next24 = list.slice(0, 8)
        const rainEntries = next24.filter(e =>
            e.weather[0].main === 'Rain' || e.weather[0].main === 'Drizzle'
        )
        const temps = next24.map(e => e.main.temp)
        const minTemp = Math.min(...temps)
        const maxTemp = Math.max(...temps)

        if (rainEntries.length >= 5) {
            return `Dalam 24 jam ke depan, hujan diperkirakan mendominasi dengan suhu berkisar ${minTemp.toFixed(0)}–${maxTemp.toFixed(0)}°C.`
        } else if (rainEntries.length > 0) {
            return `Dalam 24 jam ke depan, ada potensi hujan di ${rainEntries.length} periode, dengan suhu berkisar ${minTemp.toFixed(0)}–${maxTemp.toFixed(0)}°C.`
        }
        return `Dalam 24 jam ke depan, cuaca diperkirakan cerah hingga berawan, dengan suhu berkisar ${minTemp.toFixed(0)}–${maxTemp.toFixed(0)}°C.`
    })

    return { embunEsPrediction, tempTrend, currentInsight, forecastSummary }
}
