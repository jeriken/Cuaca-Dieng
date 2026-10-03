<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import moment from 'moment'
import 'moment/locale/id'
import Main from '../components/Main.vue'
import Highlight from '../components/Highlight.vue'
import Prediction from '../components/Prediction.vue'
import { useAnalytics } from '../composables/useAnalytics.js'
import { useDarkMode } from '../composables/useDarkMode.js'
import { useLazyMount } from '../composables/useLazyMount.js'
moment.locale('id')

const { isDark, toggle: toggleDark } = useDarkMode()

const mainData = ref({})
const feedData = ref({})
const predictionData = ref({})
const aqiData = ref(null)
const sunData = ref(null)
const isDaily = ref(false)
const activeMenu = ref("harian")
const isLoading = ref(true)
const isChartLoading = ref(true)
const errorMessage = ref(null)
const apiKey = "4b1478b77341332e8c75532ba5057c19"

// Layout has reached its real (non-skeleton) shape once initial data has
// settled — only then is it safe to measure the Highlight anchor's position.
const layoutReady = computed(() => !isLoading.value && !isChartLoading.value)
const { target: highlightAnchor, isVisible: highlightVisible } = useLazyMount(layoutReady)

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
    }, 60000)

    setInterval(async () => {
        await getAqiData()
    }, 600000)
})
</script>

<template>
    <div class="grid grid-cols-11">
        <div class="col-span-11 md:col-span-5 lg:col-span-4 xl:col-span-3 md:h-screen md:sticky top-0 bg-slate-50 dark:bg-[#0d1a2e] transition-colors duration-300">
            <Main :data="mainData" :loading="isLoading" :sunData="sunData" />
        </div>
        <main class="col-span-11 md:col-span-6 lg:col-span-7 xl:col-span-8 bg-slate-100 dark:bg-[#0a1524] p-8 transition-colors duration-300">
            <div class="grid grid-cols-12 mb-8 items-center">
                <div class="col-span-12 md:col-span-6 flex justify-center md:justify-start gap-6">
                    <button class="font-semibold text-lg transition-colors duration-200" @click="changeTime(1, 60, false)" :class="activeMenu === 'harian' ? 'text-sky-500 dark:text-sky-400 underline underline-offset-8' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'">Harian</button>
                    <button class="font-semibold text-lg transition-colors duration-200" @click="changeTime(7, 1440, true)" :class="activeMenu === 'mingguan' ? 'text-sky-500 dark:text-sky-400 underline underline-offset-8' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'">Mingguan</button>
                    <button class="font-semibold text-lg transition-colors duration-200" @click="changeTime(30, 'daily', true)" :class="activeMenu === 'bulanan' ? 'text-sky-500 dark:text-sky-400 underline underline-offset-8' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'">Bulanan</button>
                </div>
                <div class="col-span-12 md:col-span-6 hidden md:flex md:justify-end md:items-center md:gap-3">
                    <!-- Label so users know what the switch does -->
                    <div class="text-right leading-tight">
                        <p class="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">Tampilan</p>
                        <p class="text-sm font-semibold text-slate-700 dark:text-slate-200">{{ isDark ? 'Mode Gelap' : 'Mode Terang' }}</p>
                    </div>
                    <!-- Creative sliding sun/moon theme toggle -->
                    <button @click="toggleDark" role="switch" :aria-checked="isDark"
                        :title="isDark ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'"
                        class="relative w-[72px] h-9 rounded-full p-1 flex items-center transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-sky-400/40 overflow-hidden"
                        :class="isDark ? 'bg-slate-800 border border-white/10' : 'bg-gradient-to-b from-sky-300 to-sky-400 border border-sky-300'">
                        <!-- Stars (dark) -->
                        <span class="absolute left-2.5 top-2 w-0.5 h-0.5 rounded-full bg-white/80 transition-opacity duration-300" :class="isDark ? 'opacity-100' : 'opacity-0'"></span>
                        <span class="absolute left-5 top-5 w-0.5 h-0.5 rounded-full bg-white/60 transition-opacity duration-300" :class="isDark ? 'opacity-100' : 'opacity-0'"></span>
                        <span class="absolute left-3.5 top-5 w-px h-px rounded-full bg-white/50 transition-opacity duration-300" :class="isDark ? 'opacity-100' : 'opacity-0'"></span>
                        <!-- Clouds (light) -->
                        <span class="absolute right-2.5 top-2.5 w-3 h-1.5 rounded-full bg-white/70 transition-opacity duration-300" :class="isDark ? 'opacity-0' : 'opacity-100'"></span>
                        <span class="absolute right-4 top-[18px] w-2 h-1 rounded-full bg-white/50 transition-opacity duration-300" :class="isDark ? 'opacity-0' : 'opacity-100'"></span>
                        <!-- Knob -->
                        <span class="relative z-10 w-7 h-7 rounded-full flex items-center justify-center shadow-md transition-transform duration-300 ease-out"
                            :class="isDark ? 'translate-x-[36px] bg-slate-200' : 'translate-x-0 bg-amber-300'">
                            <svg v-if="!isDark" width="16" height="16" viewBox="0 0 24 24" fill="none"
                                class="stroke-amber-600" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                                <circle cx="12" cy="12" r="5" />
                                <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                                <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
                                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                            </svg>
                            <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none"
                                class="stroke-slate-600" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                            </svg>
                        </span>
                    </button>
                </div>
            </div>
            <Prediction :data="predictionData" :daily="isDaily" />
            <div ref="highlightAnchor" class="min-h-[605px]">
                <Highlight v-if="highlightVisible" :data="feedData" :daily="isDaily" :chartLoading="isChartLoading" :prediction="predictionData" :analytics="analytics" :aqiData="aqiData" />
                <div v-else class="grid grid-cols-12 gap-4">
                    <div class="col-span-12 xl:col-span-8 h-[389px] rounded-2xl bg-slate-100 dark:bg-white/5 animate-pulse"></div>
                    <div class="col-span-12 xl:col-span-4 h-[389px] rounded-2xl bg-slate-100 dark:bg-white/5 animate-pulse"></div>
                    <div class="col-span-12 md:col-span-4 h-[192px] rounded-2xl bg-slate-100 dark:bg-white/5 animate-pulse"></div>
                    <div class="col-span-12 md:col-span-4 h-[192px] rounded-2xl bg-slate-100 dark:bg-white/5 animate-pulse"></div>
                    <div class="col-span-12 md:col-span-4 h-[192px] rounded-2xl bg-slate-100 dark:bg-white/5 animate-pulse"></div>
                </div>
            </div>
        </main>
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
