import { computed } from 'vue'
import moment from 'moment/min/moment-with-locales'
moment.locale('id')

export function useAnalytics(feedData, mainData, predictionData) {
    // Frost (embun es) prediction
    // Rule: temp at 22:00 < 6°C + wind < 3 m/s → frost likely 04:00-06:00 next morning
    const embunEsPrediction = computed(() => {
        const feeds = feedData.value?.feeds
        const list = predictionData.value?.list
        if (!feeds?.length && !list?.length) return null

        const now = moment()
        const currentHour = now.hour()
        let temp22 = null
        let forecastWind = null

        if (currentHour >= 22 && feeds?.length) {
            // After 22:00 — find the actual 22:00 reading from ThingSpeak today
            const reading22 = [...feeds].reverse().find(f => moment(f.created_at).hour() === 22)
            if (reading22) temp22 = parseFloat(reading22.field1)
        }

        if (temp22 === null && list?.length) {
            // Before 22:00 or no reading found — use OWM forecast closest to 21:00/22:00 tonight
            const tonight22 = list.find(item => {
                const t = moment(item.dt_txt)
                return (t.hour() === 21 || t.hour() === 22) && t.isSame(now, 'day')
            })
            if (tonight22) {
                temp22 = tonight22.main.temp
                forecastWind = tonight22.wind.speed
            }
        }

        if (temp22 === null) return null

        // Wind: use OWM forecast wind (no wind sensor on device; field5 = rain humidity)
        if (forecastWind === null && list?.length) {
            const nearest = list.find(item => {
                const t = moment(item.dt_txt)
                return t.isSame(now, 'day') && t.hour() >= currentHour
            })
            forecastWind = nearest?.wind?.speed ?? 0
        }

        const coldEnough = temp22 < 6
        const calmWind = (forecastWind ?? 0) < 3

        if (coldEnough && calmWind) {
            return `Suhu pukul 22.00 diprediksi ${temp22.toFixed(1)}°C dengan angin lemah — embun es kemungkinan besar terjadi besok pagi (04.00–06.00).`
        } else if (coldEnough && !calmWind) {
            return `Suhu pukul 22.00 cukup rendah (${temp22.toFixed(1)}°C) namun angin cukup kencang — embun es mungkin tidak terbentuk.`
        } else {
            return `Suhu pukul 22.00 diprediksi ${temp22.toFixed(1)}°C — embun es tidak diprediksi besok pagi.`
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

        if (diff < -1.5) return `Suhu cenderung turun ${Math.abs(diff).toFixed(1)}°C dibanding awal periode ini.`
        if (diff > 1.5) return `Suhu cenderung naik ${diff.toFixed(1)}°C dibanding awal periode ini.`
        return `Suhu relatif stabil pada periode ini (selisih ${Math.abs(diff).toFixed(1)}°C).`
    })

    // Current live conditions from ThingSpeak mainData
    const currentInsight = computed(() => {
        const temp = parseFloat(mainData.value?.field1)
        const humidity = parseFloat(mainData.value?.field2)
        const pressure = parseFloat(mainData.value?.field3)
        if (isNaN(temp)) return null

        const parts = []
        if (temp < 6) parts.push(`Suhu sangat dingin (${Math.floor(temp)}°C) — waspada embun es`)
        else if (temp < 10) parts.push(`Suhu sangat dingin (${Math.floor(temp)}°C)`)
        else if (temp < 15) parts.push(`Suhu dingin (${Math.floor(temp)}°C)`)
        else parts.push(`Suhu sejuk (${Math.floor(temp)}°C)`)

        if (!isNaN(humidity)) {
            if (humidity > 90) parts.push('kelembapan sangat tinggi')
            else if (humidity > 80) parts.push('kelembapan tinggi')
        }
        if (!isNaN(pressure) && pressure < 793) parts.push('tekanan rendah — potensi hujan')

        return parts.join(', ') + '.'
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
            return `Prakiraan 24 jam: hujan mendominasi. Suhu antara ${minTemp.toFixed(0)}–${maxTemp.toFixed(0)}°C.`
        } else if (rainEntries.length > 0) {
            return `Prakiraan 24 jam: berpotensi hujan ${rainEntries.length} periode. Suhu antara ${minTemp.toFixed(0)}–${maxTemp.toFixed(0)}°C.`
        }
        return `Prakiraan 24 jam: cerah hingga berawan. Suhu antara ${minTemp.toFixed(0)}–${maxTemp.toFixed(0)}°C.`
    })

    return { embunEsPrediction, tempTrend, currentInsight, forecastSummary }
}
