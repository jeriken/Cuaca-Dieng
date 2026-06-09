<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import moment from 'moment/min/moment-with-locales'
import Main from '../components/Main.vue'
import Highlight from '../components/Highlight.vue'
import Prediction from '../components/Prediction.vue'
import { useAnalytics } from '../composables/useAnalytics.js'
moment.locale('id')

const mainData = ref({})
const feedData = ref({})
const predictionData = ref({})
const aqiData = ref(null)
const sunData = ref(null)
const dateNow = ref(moment().format('DD MMMM YYYY'))
const timeNow = ref(moment().format('HH:mm'))
const isDaily = ref(false)
const activeMenu = ref("harian")
const isLoading = ref(true)
const isChartLoading = ref(true)
const errorMessage = ref(null)
const apiKey = "4b1478b77341332e8c75532ba5057c19"

const { embunEsPrediction, tempTrend, currentInsight, forecastSummary } = useAnalytics(feedData, mainData, predictionData)

const analytics = { embunEsPrediction, tempTrend, currentInsight, forecastSummary }

let errorTimer = null
const showError = (msg) => {
    errorMessage.value = msg
    clearTimeout(errorTimer)
    errorTimer = setTimeout(() => { errorMessage.value = null }, 4000)
}

const callApi = async (url) => {
    try {
        const { data } = await axios.get(url)
        return data
    } catch {
        showError('Gagal memuat data. Periksa koneksi internet Anda.')
        return null
    }
}

const changeTime = async (days, timescale, daily) => {
    const startDate = moment().subtract(days, 'days').format('YYYY-MM-DD HH:mm:ss')
    const endDate = moment().format('YYYY-MM-DD HH:mm:ss a')
    isDaily.value = daily
    setActiveMenu(days)
    await getTimeData(startDate, endDate, timescale)
}

const setActiveMenu = (days) => {
    if (days === 30) activeMenu.value = "bulanan"
    else if (days === 7) activeMenu.value = "mingguan"
    else activeMenu.value = "harian"
}

const getMainData = async () => {
    const data = await callApi("https://api.thingspeak.com/channels/1082329/feed/last.json")
    if (data) mainData.value = data
}

const getTimeData = async (startDate, endDate, timescale) => {
    isChartLoading.value = true
    const data = await callApi(`https://api.thingspeak.com/channels/1082329/feeds.json?timescale=${timescale}&start=${startDate}&end=${endDate}&timezone=Asia/Jakarta`)
    if (data) feedData.value = data
    isChartLoading.value = false
}

const getPredictionData = async () => {
    const data = await callApi(`https://api.openweathermap.org/data/2.5/forecast?lat=-7.205047&lon=109.9068867&units=metric&lang=id&appid=${apiKey}`)
    if (data) predictionData.value = data
}

const getAqiData = async () => {
    const data = await callApi(`https://api.openweathermap.org/data/2.5/air_pollution?lat=-7.205047&lon=109.9068867&appid=${apiKey}`)
    if (data?.list?.length) aqiData.value = data.list[0]
}

const getSunData = async () => {
    const data = await callApi(`https://api.openweathermap.org/data/2.5/weather?lat=-7.205047&lon=109.9068867&appid=${apiKey}`)
    if (data?.sys) sunData.value = data.sys
}

onMounted(async () => {
    await getMainData()
    isLoading.value = false
    await changeTime(1, 60, false)
    await getPredictionData()
    await getAqiData()
    await getSunData()

    setInterval(async () => {
        await getMainData()
        dateNow.value = moment().format('DD MMMM YYYY')
        timeNow.value = moment().format('HH:mm')
    }, 60000)

    setInterval(async () => {
        await getAqiData()
    }, 600000)
})
</script>

<template>
    <div class="grid grid-cols-11">
        <div class="col-span-11 md:col-span-5 lg:col-span-4 xl:col-span-3 h-screen md:sticky top-0 bg-slate-50 dark:bg-[#0d1a2e] transition-colors duration-300">
            <Main :data="mainData" :loading="isLoading" :sunData="sunData" />
        </div>
        <div class="col-span-11 md:col-span-6 lg:col-span-7 xl:col-span-8 bg-slate-100 dark:bg-[#0a1524] p-8 transition-colors duration-300">
            <div class="grid grid-cols-12 mb-8 items-center">
                <div class="col-span-12 md:col-span-6 flex justify-center md:justify-start gap-6">
                    <button class="font-semibold text-lg transition-colors duration-200" @click="changeTime(1, 60, false)" :class="activeMenu === 'harian' ? 'text-sky-500 dark:text-sky-400 underline underline-offset-8' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'">Harian</button>
                    <button class="font-semibold text-lg transition-colors duration-200" @click="changeTime(7, 1440, true)" :class="activeMenu === 'mingguan' ? 'text-sky-500 dark:text-sky-400 underline underline-offset-8' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'">Mingguan</button>
                    <button class="font-semibold text-lg transition-colors duration-200" @click="changeTime(30, 'daily', true)" :class="activeMenu === 'bulanan' ? 'text-sky-500 dark:text-sky-400 underline underline-offset-8' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'">Bulanan</button>
                </div>
                <div class="col-span-12 md:col-span-6 hidden md:block">
                    <h1 class="font-display font-semibold text-2xl text-slate-800 dark:text-slate-100 md:text-right tracking-wide">{{ timeNow }}</h1>
                    <h1 class="font-semibold text-sm text-slate-500 dark:text-slate-400 md:text-right">{{ dateNow }}</h1>
                </div>
            </div>
            <Prediction :data="predictionData" :daily="isDaily" />
            <Highlight :data="feedData" :daily="isDaily" :chartLoading="isChartLoading" :prediction="predictionData" :analytics="analytics" :aqiData="aqiData" />
        </div>
    </div>

    <!-- Error toast -->
    <transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="translate-y-4 opacity-0"
        enter-to-class="translate-y-0 opacity-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="translate-y-0 opacity-100"
        leave-to-class="translate-y-4 opacity-0">
        <div v-if="errorMessage"
            class="fixed bottom-6 right-6 z-50 bg-red-500 text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-xl max-w-sm">
            {{ errorMessage }}
        </div>
    </transition>
</template>
