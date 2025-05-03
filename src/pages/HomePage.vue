<script setup>
import { ref, onBeforeMount } from 'vue'
import axios from 'axios'
import moment from 'moment/min/moment-with-locales'
import Main from '../components/Main.vue'
import Highlight from '../components/Highlight.vue'

moment.locale('id')

const mainData = ref([])
const feedData = ref([])
const dateNow = ref(moment().format('DD MMMM YYYY'))
const timeNow = ref(moment().format('HH:mm'))
const isDaily = ref(false)
const activeMenu = ref("harian")

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

const callApi = async (url) => {
    const { data } = await axios.get(url)
    return data
}

onBeforeMount(async () => {
    await getMainData()
    await changeTime(1, 60, false)
})
</script>

<template>
    <div class="grid grid-cols-11">
        <div class="col-span-11 md:col-span-5 lg:col-span-4 xl:col-span-3 md:h-screen md:sticky top-0 bg-stone-50 pb-8">
            <Main :data="mainData" />
        </div>
        <div class="col-span-11 md:col-span-6 lg:col-span-7 xl:col-span-8 bg-stone-100 p-8">
            <div class="grid grid-cols-12 mb-8 items-center">
                <div class="col-span-12 md:col-span-6 flex justify-center md:justify-start gap-6">
                    <button class="font-sans font-semibold text-lg" @click="changeTime(1, 60, false)" :class="activeMenu === 'harian' ? 'text-blue-500 underline underline-offset-8' : 'text-gray-400'">Harian</button>
                    <button class="font-sans font-semibold text-lg" @click="changeTime(7, 1440, true)" :class="activeMenu === 'mingguan' ? 'text-blue-500 underline underline-offset-8' : 'text-gray-400'">Mingguan</button>
                    <button class="font-sans font-semibold text-lg" @click="changeTime(30, 'daily', true)" :class="activeMenu === 'bulanan' ? 'text-blue-500 underline underline-offset-8' : 'text-gray-400'">Bulanan</button>
                </div>
                <div class="col-span-12 md:col-span-6 hidden md:block">
                    <h1 class="font-sans font-semibold text-2xl text-gray-900 md:text-right tracking-wide">{{ timeNow }}</h1>
                    <h1 class="font-sans font-semibold text-sm text-gray-700 md:text-right">{{ dateNow }}</h1>
                </div>
            </div>
            <Highlight :data="feedData" :daily="isDaily" />
        </div>
    </div>
</template>
