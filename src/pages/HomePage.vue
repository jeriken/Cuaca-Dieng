<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import moment from 'moment/min/moment-with-locales'
import Main from '../components/Main.vue'
import Highlight from '../components/Highlight.vue'
import Prediction from '../components/Prediction.vue'
moment.locale('id')

const mainData = ref([])
const feedData = ref([])
const predictionData = ref([])
const dateNow = ref(moment().format('DD MMMM YYYY'))
const timeNow = ref(moment().format('HH:mm'))
const isDaily = ref(false)
const activeMenu = ref("harian")
const apiKey = "4b1478b77341332e8c75532ba5057c19"

const changeTime = async (days, timescale, daily) => {
    const startDate = moment().subtract(days, 'days').format('YYYY-MM-DD HH:mm:ss')
    const endDate = moment().format('YYYY-MM-DD HH:mm:ss a')
    isDaily.value = daily
    setActiveMenu(days)
    await getTimeData(startDate, endDate, timescale)
}

const setActiveMenu = (days) => {
    if (days === 30) {
        activeMenu.value = "bulanan"
    } else if (days === 7) {
        activeMenu.value = "mingguan"
    } else {
        activeMenu.value = "harian"
    }
}

const getMainData = async () => {
    mainData.value = await callApi("https://api.thingspeak.com/channels/1082329/feed/last.json")
}

const getTimeData = async (startDate, endDate, timescale) => {
    feedData.value = await callApi(`https://api.thingspeak.com/channels/1082329/fields/1.json?timescale=${timescale}&start=${startDate}&end=${endDate}&timezone=Asia/Jakarta`)
}

const getPredictionData = async () => {
    predictionData.value = await callApi(`https://api.openweathermap.org/data/2.5/forecast?lat=-7.205047&lon=109.9068867&units=metric&lang=id&appid=${apiKey}`)
}

const callApi = async (url) => {
    const { data } = await axios.get(url)
    return data
}

onMounted(async () => {
    await getMainData()
    await changeTime(1, 60, false)
    await getPredictionData()
    setInterval(async () => {
        await getMainData()
        dateNow.value = moment().format('DD MMMM YYYY')
        timeNow.value = moment().format('HH:mm')
    }, 60000)
})
</script>

<template>
    <div class="grid grid-cols-11">
        <div class="col-span-11 md:col-span-5 lg:col-span-4 xl:col-span-3 md:h-screen md:sticky top-0 bg-slate-50 dark:bg-[#0d1a2e] transition-colors duration-300">
            <Main :data="mainData" />
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
            <Highlight :data="feedData" :daily="isDaily" />
        </div>
    </div>
</template>
