<template>
    <div class="grid grid-cols-12 gap-4">

        <!-- Chart card — 2/3 width -->
        <div class="col-span-12 xl:col-span-8 bg-white border border-slate-100 shadow-sm dark:bg-white/5 dark:backdrop-blur-md dark:border-white/10 dark:shadow-none rounded-2xl p-4 transition-colors duration-300 flex flex-col">
            <!-- Chart type toggle -->
            <div class="flex gap-2 mb-3 flex-wrap justify-center">
                <button v-for="tab in chartTabs" :key="tab.key" @click="activeChart = tab.key"
                    :class="activeChart === tab.key
                        ? 'bg-sky-500 text-white'
                        : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'"
                    class="text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors duration-200">
                    {{ tab.label }}
                </button>
            </div>
            <!-- Skeleton -->
            <div v-if="chartLoading" class="h-[300px] rounded-xl bg-slate-100 dark:bg-white/5 animate-pulse"></div>
            <div v-else id="chart">
                <apexchart ref="chart" type="line" height="300" :options="optionRekap" :series="dataRekap"></apexchart>
            </div>
        </div>

        <!-- Analytics card — 1/3 width, stretches to match chart card height -->
        <div class="col-span-12 xl:col-span-4 bg-white border border-slate-100 shadow-sm dark:bg-white/5 dark:backdrop-blur-md dark:border-white/10 dark:shadow-none rounded-2xl p-4 transition-colors duration-300 flex flex-col">
            <h3 class="font-semibold text-slate-600 dark:text-slate-300 mb-3 tracking-wide text-xs uppercase">Analisis</h3>

            <!-- Skeleton -->
            <div v-if="!analytics || (!analytics.embunEsPrediction.value && !analytics.tempTrend.value && !analytics.currentInsight.value && !analytics.forecastSummary.value)"
                class="flex flex-col gap-2 flex-1">
                <div v-for="i in 4" :key="i" class="flex-1 rounded-xl bg-slate-50 dark:bg-white/5 animate-pulse"></div>
            </div>

            <!-- Insight cards -->
            <div v-else class="flex flex-col gap-2 flex-1">

                <!-- Embun Es -->
                <div v-if="analytics.embunEsPrediction.value"
                    class="flex-1 flex gap-3 items-start bg-sky-50 dark:bg-sky-500/10 rounded-xl px-3 py-2.5">
                    <div class="w-7 h-7 rounded-lg bg-sky-100 dark:bg-sky-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" class="stroke-sky-500" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5">
                            <path d="M2 12h20M12 2v20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07" />
                        </svg>
                    </div>
                    <div>
                        <p class="text-[10px] font-semibold text-sky-500 dark:text-sky-400 uppercase tracking-wide mb-0.5">Embun Es</p>
                        <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{{ analytics.embunEsPrediction.value }}</p>
                    </div>
                </div>

                <!-- Temp trend -->
                <div v-if="analytics.tempTrend.value"
                    class="flex-1 flex gap-3 items-start bg-orange-50 dark:bg-orange-500/10 rounded-xl px-3 py-2.5">
                    <div class="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" class="stroke-orange-500" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5">
                            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                        </svg>
                    </div>
                    <div>
                        <p class="text-[10px] font-semibold text-orange-500 dark:text-orange-400 uppercase tracking-wide mb-0.5">Tren Suhu</p>
                        <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{{ analytics.tempTrend.value }}</p>
                    </div>
                </div>

                <!-- Current insight -->
                <div v-if="analytics.currentInsight.value"
                    class="flex-1 flex gap-3 items-start bg-emerald-50 dark:bg-emerald-500/10 rounded-xl px-3 py-2.5">
                    <div class="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" class="stroke-emerald-500" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5">
                            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                    </div>
                    <div>
                        <p class="text-[10px] font-semibold text-emerald-500 dark:text-emerald-400 uppercase tracking-wide mb-0.5">Kondisi Kini</p>
                        <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{{ analytics.currentInsight.value }}</p>
                    </div>
                </div>

                <!-- Forecast summary -->
                <div v-if="analytics.forecastSummary.value"
                    class="flex-1 flex gap-3 items-start bg-purple-50 dark:bg-purple-500/10 rounded-xl px-3 py-2.5">
                    <div class="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" class="stroke-purple-500" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5">
                            <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9z" />
                        </svg>
                    </div>
                    <div>
                        <p class="text-[10px] font-semibold text-purple-500 dark:text-purple-400 uppercase tracking-wide mb-0.5">Prakiraan</p>
                        <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{{ analytics.forecastSummary.value }}</p>
                    </div>
                </div>

            </div>
        </div>

        <!-- Suhu Ekstrem — 1/3 width -->
        <div class="col-span-12 md:col-span-4 bg-white border border-slate-100 shadow-sm dark:bg-white/5 dark:backdrop-blur-md dark:border-white/10 dark:shadow-none rounded-2xl px-5 py-4 transition-colors duration-300 flex flex-col justify-center">
            <h3 class="font-semibold text-slate-600 dark:text-slate-300 mb-3 tracking-wide text-xs uppercase">Suhu Ekstrem</h3>
            <div class="flex flex-col gap-3">
                <div class="flex items-center gap-3">
                    <img class="w-7 h-7" src="/icon/hot.png" />
                    <div class="flex-1">
                        <p class="text-sm text-slate-700 dark:text-slate-200 font-medium">Suhu Tertinggi</p>
                        <p class="text-xs text-slate-400 dark:text-slate-500">Periode ini</p>
                    </div>
                    <p class="font-display text-lg font-bold text-slate-800 dark:text-slate-100">{{ Math.floor(Math.max(...simpanSuhu)) }}°<span class="text-sm font-normal text-slate-400"> C</span></p>
                </div>
                <div class="h-px bg-slate-100 dark:bg-white/10"></div>
                <div class="flex items-center gap-3">
                    <img class="w-7 h-7" src="/icon/cold.png" />
                    <div class="flex-1">
                        <p class="text-sm text-slate-700 dark:text-slate-200 font-medium">Suhu Terendah</p>
                        <p class="text-xs text-slate-400 dark:text-slate-500">Periode ini</p>
                    </div>
                    <p class="font-display text-lg font-bold text-sky-500 dark:text-sky-400">{{ Math.floor(Math.min(...simpanSuhu)) }}°<span class="text-sm font-normal text-slate-400"> C</span></p>
                </div>
            </div>
        </div>

        <!-- Air Quality widget — 1/3 width -->
        <div class="col-span-12 md:col-span-4 bg-white border border-slate-100 shadow-sm dark:bg-white/5 dark:backdrop-blur-md dark:border-white/10 dark:shadow-none rounded-2xl p-4 transition-colors duration-300 flex flex-col justify-center">
            <div class="flex items-center justify-between mb-3">
                <h3 class="font-semibold text-slate-600 dark:text-slate-300 tracking-wide text-xs uppercase">Kualitas Udara</h3>
                <span v-if="aqiInfo" :class="[aqiInfo.text, 'text-xs font-bold']">{{ aqiInfo.label }}</span>
            </div>

            <template v-if="aqiData && aqiInfo">
                <!-- Big score + ring -->
                <div class="flex items-center gap-3 mb-3">
                    <div class="relative w-14 h-14 flex-shrink-0">
                        <svg viewBox="0 0 36 36" class="w-14 h-14 -rotate-90">
                            <circle cx="18" cy="18" r="15.9155" fill="none" class="stroke-slate-100 dark:stroke-white/10" stroke-width="3" />
                            <circle cx="18" cy="18" r="15.9155" fill="none" :stroke="aqiInfo.color" stroke-width="3"
                                stroke-linecap="round" :stroke-dasharray="`${(aqiData.main.aqi / 5) * 100}, 100`" />
                        </svg>
                        <div class="absolute inset-0 flex flex-col items-center justify-center">
                            <span class="font-display font-bold text-base text-slate-800 dark:text-slate-100 leading-none">{{ aqiData.main.aqi }}</span>
                            <span class="text-[9px] text-slate-400 dark:text-slate-500">/ 5</span>
                        </div>
                    </div>
                    <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed flex-1">{{ aqiInfo.desc }}</p>
                </div>

                <!-- Pollutant grid -->
                <div class="grid grid-cols-2 gap-1.5">
                    <div v-for="p in pollutants" :key="p.name"
                        class="bg-slate-50 dark:bg-white/5 rounded-xl px-3 py-1.5 flex items-center justify-between transition-colors duration-300">
                        <span class="text-xs text-slate-400 dark:text-slate-500">{{ p.name }}</span>
                        <span class="font-display text-xs font-semibold text-slate-700 dark:text-slate-200">{{ p.value.toFixed(1) }}</span>
                    </div>
                </div>
            </template>

            <!-- Loading skeleton -->
            <template v-else>
                <div class="flex items-center gap-3 mb-3">
                    <div class="w-14 h-14 rounded-full bg-slate-100 dark:bg-white/10 animate-pulse flex-shrink-0"></div>
                    <div class="flex-1 space-y-2">
                        <div class="h-3 w-full bg-slate-100 dark:bg-white/10 rounded animate-pulse"></div>
                        <div class="h-3 w-2/3 bg-slate-100 dark:bg-white/10 rounded animate-pulse"></div>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-1.5">
                    <div v-for="i in 4" :key="i" class="h-7 bg-slate-50 dark:bg-white/5 rounded-xl animate-pulse"></div>
                </div>
            </template>
        </div>

        <!-- Map card — 1/3 width, no padding so iframe fills fully -->
        <div class="col-span-12 md:col-span-4 overflow-hidden rounded-2xl border border-slate-100 shadow-sm dark:border-white/10">
            <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3958.31350226444!2d109.90474991411338!3d-7.205029272731311!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e700cfe8a2a15eb%3A0xcfd9233d8b8bbb51!2sCandi%20Arjuna!5e0!3m2!1sid!2sid!4v1597120369515!5m2!1sid!2sid"
                width="100%" height="100%" frameborder="0" style="border:0; display:block; min-height:180px;" allowfullscreen=""
                aria-hidden="false" tabindex="0"></iframe>
        </div>
    </div>
</template>

<script>
import { ref, computed, watch, onUpdated } from 'vue';
import VueApexCharts from 'vue3-apexcharts';
import moment from 'moment/min/moment-with-locales';
import { useDarkMode } from '../composables/useDarkMode.js';
moment.locale('id');

export default {
    components: {
        apexchart: VueApexCharts,
    },
    props: ['data', 'daily', 'chartLoading', 'prediction', 'analytics', 'aqiData'],
    setup(props) {
        const { isDark } = useDarkMode();

        const aqiLevels = {
            1: { label: 'Baik',         color: '#10b981', text: 'text-emerald-500', desc: 'Udara bersih dan sehat' },
            2: { label: 'Sedang',       color: '#eab308', text: 'text-yellow-500',  desc: 'Kualitas udara cukup baik' },
            3: { label: 'Cukup Buruk',  color: '#f97316', text: 'text-orange-500',  desc: 'Kelompok sensitif waspada' },
            4: { label: 'Buruk',        color: '#ef4444', text: 'text-red-500',     desc: 'Kurangi aktivitas luar ruang' },
            5: { label: 'Sangat Buruk', color: '#a855f7', text: 'text-purple-500',  desc: 'Hindari aktivitas luar ruang' },
        }
        const aqiInfo = computed(() => {
            if (!props.aqiData) return null
            return aqiLevels[props.aqiData.main.aqi]
        })
        const pollutants = computed(() => {
            if (!props.aqiData) return []
            const c = props.aqiData.components
            return [
                { name: 'PM2.5', value: c.pm2_5, unit: 'μg/m³' },
                { name: 'PM10',  value: c.pm10,  unit: 'μg/m³' },
                { name: 'O₃',    value: c.o3,    unit: 'μg/m³' },
                { name: 'NO₂',   value: c.no2,   unit: 'μg/m³' },
            ]
        })
        const arrange = ref(false);
        const dataSuhu = ref([]);
        const formatDaily = ref(false);
        const simpanSuhu = ref([0]);
        const activeChart = ref('suhu');
        const allSeries = ref({ suhu: [], lembap: [], tekanan: [] });

        const chartTabs = [
            { key: 'suhu',    label: 'Suhu' },
            { key: 'lembap',  label: 'Kelembapan' },
            { key: 'tekanan', label: 'Tekanan' },
            { key: 'angin',   label: 'Angin' },
        ]

        const chartColors = {
            suhu:    '#0ea5e9',
            lembap:  '#10b981',
            tekanan: '#a855f7',
            angin:   '#f59e0b',
        }

        const chartMeta = {
            suhu:    { yTitle: 'Temperatur (°C)',   title: 'Suhu' },
            lembap:  { yTitle: 'Kelembapan (%)',    title: 'Kelembapan' },
            tekanan: { yTitle: 'Tekanan (mBar)',    title: 'Tekanan Udara' },
            angin:   { yTitle: 'Kecepatan (m/s)',   title: 'Prakiraan Angin 24 Jam Ke Depan' },
        }

        const windData = computed(() => {
            if (!props.prediction?.list) return []
            const now = new Date()
            const pad = (n) => String(n).padStart(2, '0')
            const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
            const currentHour = now.getHours()
            const future = props.prediction.list.filter(item => {
                const [date, time] = item.dt_txt.split(' ')
                const hour = parseInt(time.slice(0, 2), 10)
                if (date > todayStr) return true
                if (date === todayStr && hour > currentHour) return true
                return false
            })
            return future.slice(0, 8).map(item => ({
                x: item.dt_txt.split(' ')[1].slice(0, 5),
                y: parseFloat(item.wind.speed.toFixed(1)),
            }))
        })

        const dataRekap = ref([{ name: 'Suhu', data: [] }]);

        const updateChartSeries = () => {
            if (activeChart.value === 'angin') {
                dataRekap.value = [{ name: 'Angin (m/s)', data: windData.value }]
                return
            }
            const map = {
                suhu:    { name: 'Suhu (°C)',       data: allSeries.value.suhu },
                lembap:  { name: 'Kelembapan (%)',  data: allSeries.value.lembap },
                tekanan: { name: 'Tekanan (mBar)',  data: allSeries.value.tekanan },
            }
            dataRekap.value = [map[activeChart.value]]
        }

        const optionRekap = computed(() => {
            const dark = isDark.value;
            const labelColor = dark ? '#64748b' : '#94a3b8';
            const gridColor = dark ? '#ffffff10' : '#e2e8f0';
            const titleColor = dark ? '#f1f5f9' : '#0f172a';
            const axisColor = dark ? '#1e293b' : '#e2e8f0';
            const meta = chartMeta[activeChart.value]
            const color = chartColors[activeChart.value]
            const periodLabel = formatDaily.value ? 'periode ini' : '24 jam terakhir'
            const chartTitle = activeChart.value === 'angin' ? meta.title : `${meta.title} — ${periodLabel}`

            return {
                chart: {
                    height: 250,
                    type: 'line',
                    background: 'transparent',
                    foreColor: labelColor,
                    zoom: { enabled: false },
                    toolbar: { show: false },
                },
                theme: { mode: dark ? 'dark' : 'light' },
                colors: [color],
                dataLabels: { enabled: false },
                stroke: { width: [2.5], curve: 'smooth', dashArray: [0] },
                title: {
                    text: chartTitle,
                    align: 'left',
                    style: {
                        color: titleColor,
                        fontSize: '13px',
                        fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
                        fontWeight: 600,
                    },
                },
                legend: {
                    tooltipHoverFormatter: function (val, opts) {
                        return val + ' - <strong>' + opts.w.globals.series[opts.seriesIndex][opts.dataPointIndex] + '</strong>';
                    },
                },
                markers: { size: 0, hover: { sizeOffset: 6 } },
                yaxis: {
                    title: {
                        text: meta.yTitle,
                        style: { color: labelColor, fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif' },
                    },
                    labels: {
                        style: { colors: labelColor, fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif' },
                    },
                },
                xaxis: {
                    type: 'category',
                    tickAmount: 10,
                    labels: {
                        style: { colors: labelColor, fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif' },
                    },
                    axisBorder: { color: axisColor },
                    axisTicks: { color: axisColor },
                },
                grid: { borderColor: gridColor },
                tooltip: {
                    theme: dark ? 'dark' : 'light',
                    style: { fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif' },
                },
            };
        });

        const arrangeData = (data) => {
            const suhuArr = [], lembapArr = [], tekananArr = [], suhuRaw = []

            data.forEach((detail) => {
                const xLabel = formatDaily.value
                    ? moment(detail.created_at).format('DD MMM')
                    : moment(detail.created_at).format('HH:mm')

                suhuRaw.push(parseFloat(detail.field1))
                suhuArr.push({ x: xLabel, y: parseFloat(detail.field1) })
                lembapArr.push({ x: xLabel, y: detail.field2 != null ? parseFloat(detail.field2) : null })
                tekananArr.push({ x: xLabel, y: detail.field3 != null ? parseFloat(detail.field3) : null })
            })

            if (!formatDaily.value) {
                suhuArr.shift(); lembapArr.shift(); tekananArr.shift(); suhuRaw.shift()
            }

            allSeries.value = { suhu: suhuArr, lembap: lembapArr, tekanan: tekananArr }
            simpanSuhu.value = suhuRaw.length ? suhuRaw : [0]
            updateChartSeries()
            arrange.value = true
        };

        watch(() => props.data, (data) => {
            arrange.value = false;
            dataSuhu.value = data;
            if (data?.feeds) arrangeData(data.feeds);
        });

        watch(() => props.daily, (data) => {
            formatDaily.value = data;
        });

        watch(activeChart, () => {
            updateChartSeries()
        })

        watch(() => props.prediction, () => {
            if (activeChart.value === 'angin') updateChartSeries()
        })

        onUpdated(() => {
            if (!arrange.value && props.data?.feeds) {
                arrangeData(props.data.feeds);
            }
        });

        return {
            arrange,
            dataSuhu,
            formatDaily,
            simpanSuhu,
            dataRekap,
            optionRekap,
            activeChart,
            allSeries,
            chartTabs,
            aqiInfo,
            pollutants,
        };
    },
};
</script>
