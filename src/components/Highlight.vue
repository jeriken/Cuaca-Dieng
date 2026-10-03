<template>
    <div class="grid grid-cols-12 gap-4">

        <!-- Chart card — 2/3 width -->
        <div ref="chartCard" class="rise col-span-12 xl:col-span-8 scroll-mt-4 bg-white border border-slate-100 shadow-sm dark:bg-white/5 dark:backdrop-blur-md dark:border-white/10 dark:shadow-none rounded-2xl p-4 transition-colors duration-300 flex flex-col">
            <!-- Chart type toggle -->
            <div class="flex gap-2 mb-3 flex-wrap justify-center">
                <button v-for="tab in chartTabs" :key="tab.key" @click="activeChart = tab.key"
                    :class="activeChart === tab.key
                        ? 'bg-sky-500 text-white'
                        : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'"
                    class="press text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors duration-200">
                    {{ tab.label }}
                </button>
            </div>
            <!-- Skeleton -->
            <div v-if="chartLoading" class="flex-1 min-h-[300px] rounded-xl bg-slate-100 dark:bg-white/5 animate-pulse"></div>
            <!-- Grows to fill the card when the analysis column is taller. The chart is
                 absolutely positioned so its own height never feeds back into the row's. -->
            <div v-else ref="chartBox" id="chart" class="relative flex-1 min-h-[300px]">
                <div class="absolute inset-0">
                    <apexchart ref="chart" type="area" :height="chartHeight" :options="optionRekap" :series="dataRekap"></apexchart>
                </div>
            </div>
        </div>

        <!-- Analytics card — 1/3 width, stretches to match chart card height -->
        <div class="rise col-span-12 xl:col-span-4 bg-white border border-slate-100 shadow-sm dark:bg-white/5 dark:backdrop-blur-md dark:border-white/10 dark:shadow-none rounded-2xl p-4 transition-colors duration-300 flex flex-col">
            <h3 class="font-semibold text-slate-600 dark:text-slate-300 mb-3 tracking-wide text-xs uppercase">Analisis</h3>

            <!-- Skeleton -->
            <div v-if="!insightCards.some(c => c.insight)" class="flex flex-col gap-3">
                <div v-for="i in 4" :key="i" class="h-12 rounded-xl bg-slate-50 dark:bg-white/5 animate-pulse"></div>
            </div>

            <!-- Insight list — each row links to the chart that backs it up. Rows share
                 the card's height evenly so it lines up with the chart beside it. -->
            <div v-else class="flex-1 flex flex-col divide-y divide-slate-100 dark:divide-white/5">
                <template v-for="card in insightCards" :key="card.key">
                    <button v-if="card.insight" type="button" @click="showChart(card.chart)" title="Lihat grafik"
                        class="group interactive flex-1 -mx-2 px-2 py-2 flex gap-3 items-center rounded-xl text-left hover:bg-slate-50 dark:hover:bg-white/5">
                        <div class="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6"
                            :class="card.iconBg">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" :class="card.stroke" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" v-html="card.icon"></svg>
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-[10px] font-semibold uppercase tracking-wide leading-none" :class="card.label">{{ card.title }}</p>
                            <p class="font-display text-[15px] font-bold leading-tight text-slate-800 dark:text-slate-100 mt-1">{{ card.insight.value }}</p>
                            <p class="text-[11px] leading-snug text-slate-400 dark:text-slate-500 mt-0.5 [text-wrap:pretty]">{{ card.insight.text }}</p>
                        </div>
                    </button>
                </template>
            </div>
        </div>

        <!-- Suhu Ekstrem — 1/3 width -->
        <div class="rise col-span-12 md:col-span-4 min-h-[180px] bg-white border border-slate-100 shadow-sm dark:bg-white/5 dark:backdrop-blur-md dark:border-white/10 dark:shadow-none rounded-2xl px-5 py-4 transition-colors duration-300 flex flex-col justify-center" style="animation-delay: 80ms">
            <h3 class="font-semibold text-slate-600 dark:text-slate-300 mb-2 tracking-wide text-xs uppercase">Suhu Ekstrem</h3>
            <!-- Tap a row to pin that point on the temperature chart -->
            <div class="flex flex-col gap-1">
                <button v-for="ex in extremes" :key="ex.key" type="button" @click="focusExtreme(ex.key)"
                    :aria-pressed="pinnedExtreme === ex.key" title="Tandai di grafik"
                    class="group interactive -mx-2 px-2 py-1.5 rounded-xl flex items-center gap-3 text-left"
                    :class="pinnedExtreme === ex.key ? ex.activeBg : 'hover:bg-slate-50 dark:hover:bg-white/5'">
                    <img class="w-7 h-7 transition-transform duration-300 group-hover:scale-110" :src="ex.icon" width="28" height="28" alt="" />
                    <div class="flex-1 min-w-0">
                        <p class="text-sm text-slate-700 dark:text-slate-200 font-medium truncate">{{ ex.label }}</p>
                        <!-- Single line, short text in both states so the row height never changes -->
                        <p class="text-xs text-slate-400 dark:text-slate-500 truncate">
                            {{ pinnedExtreme === ex.key ? `Tercatat ${ex.at}` : 'Periode ini' }}
                        </p>
                    </div>
                    <p class="font-display text-lg font-bold" :class="ex.valueClass">{{ ex.value }}°<span class="text-sm font-normal text-slate-400"> C</span></p>
                </button>
            </div>
            <!-- Sunrise / Sunset today — tap to toggle clock time vs. countdown -->
            <div class="mt-2 pt-2 border-t border-slate-100 dark:border-white/10 text-xs">
                <button v-if="sunriseTime && sunsetTime" type="button" @click="sunRelative = !sunRelative"
                    class="interactive -mx-2 px-2 py-1 rounded-lg flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5"
                    style="width: calc(100% + 1rem)"
                    :title="sunRelative ? 'Tampilkan jam' : 'Tampilkan hitung mundur'">
                    <span class="flex items-center gap-1.5">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                            class="stroke-amber-400 flex-shrink-0" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                            <path d="M12 2v4M4.93 10.93l2.83 2.83M1 18h4M19 18h4M18.07 10.93l-2.83 2.83M12 6a6 6 0 010 12M2 18h20" />
                        </svg>
                        <span class="text-slate-400 dark:text-slate-500">Terbit</span>
                        <Transition name="swap" mode="out-in">
                            <span :key="sunRelative" class="font-display font-semibold text-slate-700 dark:text-slate-200 tabular-nums">{{ sunRelative ? sunriseRel : sunriseTime }}</span>
                        </Transition>
                    </span>
                    <span class="flex items-center gap-1.5">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                            class="stroke-orange-400 flex-shrink-0" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                            <path d="M12 10v4M4.93 10.93l2.83 2.83M1 18h4M19 18h4M18.07 10.93l-2.83 2.83M12 6a6 6 0 010 12M2 18h20M5 22l7-4 7 4" />
                        </svg>
                        <span class="text-slate-400 dark:text-slate-500">Terbenam</span>
                        <Transition name="swap" mode="out-in">
                            <span :key="sunRelative" class="font-display font-semibold text-slate-700 dark:text-slate-200 tabular-nums">{{ sunRelative ? sunsetRel : sunsetTime }}</span>
                        </Transition>
                    </span>
                </button>
                <div v-else class="h-6 w-full rounded-md bg-slate-100 dark:bg-white/5 animate-pulse"></div>
            </div>
        </div>

        <!-- Air Quality widget — 1/3 width -->
        <div class="rise col-span-12 md:col-span-4 min-h-[180px] bg-white border border-slate-100 shadow-sm dark:bg-white/5 dark:backdrop-blur-md dark:border-white/10 dark:shadow-none rounded-2xl p-4 transition-colors duration-300 flex flex-col justify-center" style="animation-delay: 140ms">
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
                                stroke-linecap="round" :stroke-dasharray="`${ringReady ? (aqiData.main.aqi / 5) * 100 : 0}, 100`"
                                style="transition: stroke-dasharray 0.9s cubic-bezier(0.2, 0.8, 0.2, 1)" />
                        </svg>
                        <div class="absolute inset-0 flex flex-col items-center justify-center">
                            <span class="font-display font-bold text-base text-slate-800 dark:text-slate-100 leading-none">{{ aqiData.main.aqi }}</span>
                            <span class="text-[9px] text-slate-400 dark:text-slate-500">/ 5</span>
                        </div>
                    </div>
                    <Transition name="swap" mode="out-in">
                        <p :key="activePollutant?.name || 'desc'" class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed flex-1 line-clamp-2">
                            <template v-if="activePollutant">
                                <span class="font-semibold text-slate-700 dark:text-slate-200">{{ activePollutant.name }} · {{ activePollutant.value.toFixed(1) }} {{ activePollutant.unit }}</span><br />{{ activePollutant.desc }}
                            </template>
                            <template v-else>{{ aqiInfo.desc }}</template>
                        </p>
                    </Transition>
                </div>

                <!-- Pollutant grid -->
                <div class="grid grid-cols-2 gap-1.5">
                    <button v-for="p in pollutants" :key="p.name" type="button"
                        @click="selectedPollutant = selectedPollutant === p.name ? null : p.name"
                        :aria-pressed="selectedPollutant === p.name"
                        class="interactive rounded-xl px-3 py-1.5 flex items-center justify-between border"
                        :class="selectedPollutant === p.name
                            ? 'bg-sky-50 border-sky-200 dark:bg-sky-500/10 dark:border-sky-400/30'
                            : 'bg-slate-50 border-transparent hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10'">
                        <span class="text-xs text-slate-400 dark:text-slate-500">{{ p.name }}</span>
                        <span class="font-display text-xs font-semibold text-slate-700 dark:text-slate-200">{{ p.value.toFixed(1) }}</span>
                    </button>
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

        <!-- Travelink promo banner — 1/3 width -->
        <a href="https://travelink.fun" target="_blank" rel="noopener"
            class="group relative col-span-12 md:col-span-4 overflow-hidden rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm dark:shadow-none min-h-[180px] flex flex-col justify-between p-4 interactive hover:-translate-y-0.5 hover:shadow-lg hover:shadow-cyan-500/20 rise" style="animation-delay: 200ms">
            <!-- Gradient backdrop -->
            <div class="absolute inset-0 bg-gradient-to-br from-sky-500 via-cyan-500 to-emerald-500 dark:from-transparent dark:via-transparent dark:to-transparent dark:bg-white/5"></div>
            <div class="absolute inset-0 hidden dark:block bg-gradient-to-br from-sky-500/10 via-cyan-500/10 to-emerald-500/10"></div>

            <!-- Decorative blobs -->
            <div class="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10 dark:bg-sky-400/10 blur-xl group-hover:scale-110 transition-transform duration-500"></div>
            <div class="absolute -bottom-10 -left-6 w-28 h-28 rounded-full bg-white/10 dark:bg-emerald-400/10 blur-xl group-hover:scale-110 transition-transform duration-500"></div>

            <!-- Mountain silhouette -->
            <svg class="absolute bottom-0 left-0 w-full h-16 opacity-25 dark:opacity-10" viewBox="0 0 200 60" preserveAspectRatio="none" fill="none">
                <path d="M0 60 L30 20 L55 42 L85 8 L115 38 L150 15 L175 40 L200 25 L200 60 Z" class="fill-white dark:fill-sky-200" />
            </svg>

            <!-- Top row: badge -->
            <div class="relative z-10 flex items-center justify-between">
                <span class="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-white/90 dark:text-sky-300 bg-white/15 dark:bg-sky-500/10 backdrop-blur-sm px-2 py-1 rounded-full">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" class="stroke-white dark:stroke-sky-300" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                    Rekomendasi
                </span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="stroke-white/70 dark:stroke-slate-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                    stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5">
                    <path d="M7 17L17 7M7 7h10v10" />
                </svg>
            </div>

            <!-- Bottom: content -->
            <div class="relative z-10">
                <h3 class="font-display font-bold text-xl text-white dark:text-slate-100 leading-tight drop-shadow-sm dark:drop-shadow-none">
                    Jelajahi Dieng<br />bersama kami
                </h3>
                <p class="text-[11px] text-white/85 dark:text-slate-400 mt-1 leading-relaxed">
                    Destinasi, jeep tour, penginapan & rencana perjalanan instan — semua dalam satu platform.
                </p>
                <span class="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold text-sky-700 dark:text-sky-300 bg-white dark:bg-transparent border border-transparent dark:border-sky-400/30 px-3 py-1.5 rounded-xl group-hover:bg-white/90 dark:group-hover:bg-sky-500/10 transition-colors">
                    Kunjungi travelink.fun
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" class="stroke-sky-700 dark:stroke-sky-300" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5">
                        <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                </span>
            </div>
        </a>
    </div>
</template>

<script>
import { ref, computed, watch, onMounted, onUnmounted, onUpdated, defineAsyncComponent } from 'vue';
import moment from 'moment';
import 'moment/locale/id';
import { useDarkMode } from '../composables/useDarkMode.js';
import { relativeTime } from '../utils/relativeTime.js';
moment.locale('id');

export default {
    components: {
        apexchart: defineAsyncComponent(() => import('vue3-apexcharts')),
    },
    props: ['data', 'daily', 'chartLoading', 'prediction', 'analytics', 'aqiData', 'sunData'],
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
                { name: 'PM2.5', value: c.pm2_5, unit: 'μg/m³', desc: 'Partikel halus yang bisa masuk ke paru-paru.' },
                { name: 'PM10',  value: c.pm10,  unit: 'μg/m³', desc: 'Debu & partikel kasar, mis. dari jalan.' },
                { name: 'O₃',    value: c.o3,    unit: 'μg/m³', desc: 'Ozon permukaan, naik saat siang terik.' },
                { name: 'NO₂',   value: c.no2,   unit: 'μg/m³', desc: 'Gas dari asap kendaraan bermotor.' },
            ]
        })
        const selectedPollutant = ref(null)
        const activePollutant = computed(() => pollutants.value.find(p => p.name === selectedPollutant.value) || null)

        // AQI ring animates from empty once the data first arrives
        const ringReady = ref(false)
        watch(() => props.aqiData, (v) => {
            if (v && !ringReady.value) setTimeout(() => { ringReady.value = true }, 50)
        }, { immediate: true })

        // Sunrise/sunset row can flip to a countdown ("3 jam lagi")
        const sunRelative = ref(false)
        const nowTick = ref(Date.now())
        let tickTimer = null
        onMounted(() => { tickTimer = setInterval(() => { nowTick.value = Date.now() }, 60000) })
        onUnmounted(() => clearInterval(tickTimer))
        const relFrom = (unix) => relativeTime(unix * 1000, nowTick.value)
        const sunriseRel = computed(() => props.sunData?.sunrise ? relFrom(props.sunData.sunrise) : null)
        const sunsetRel = computed(() => props.sunData?.sunset ? relFrom(props.sunData.sunset) : null)

        const sunriseTime = computed(() => {
            if (!props.sunData?.sunrise) return null
            return moment.unix(props.sunData.sunrise).utcOffset(7).format('HH:mm')
        })
        const sunsetTime = computed(() => {
            if (!props.sunData?.sunset) return null
            return moment.unix(props.sunData.sunset).utcOffset(7).format('HH:mm')
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
            suhu:    { unit: '°C',    axisUnit: '°', title: 'Suhu' },
            lembap:  { unit: '%',     axisUnit: '%', title: 'Kelembapan' },
            tekanan: { unit: ' mBar', axisUnit: '',  title: 'Tekanan Udara' },
            angin:   { unit: ' m/s',  axisUnit: '',  title: 'Prakiraan Angin 24 Jam Ke Depan' },
        }
        const fmtNum = (n, d = 1) => n.toLocaleString('id-ID', { minimumFractionDigits: d, maximumFractionDigits: d })

        const windData = computed(() => {
            if (!props.prediction?.list) return []
            // dt is unix UTC (dt_txt is UTC too) — show WIB labels
            const now = Date.now() / 1000
            return props.prediction.list
                .filter(item => item.dt > now)
                .slice(0, 8)
                .map(item => ({
                    x: moment.unix(item.dt).utcOffset(7).format('HH:mm'),
                    y: parseFloat(item.wind.speed.toFixed(1)),
                }))
        })

        const dataRekap = ref([{ name: 'Suhu', data: [] }]);

        // Insight cards double as shortcuts to the chart that backs them up
        const chartCard = ref(null)

        // Chart height follows its container (see template) — measured, since
        // ApexCharts needs a pixel height to keep option updates stable.
        const chartBox = ref(null)
        const chartHeight = ref(300)
        let chartObserver = null
        watch(chartBox, (el) => {
            chartObserver?.disconnect()
            if (!el) return
            chartObserver = new ResizeObserver(([entry]) => {
                const h = Math.round(entry.contentRect.height)
                if (h > 0 && h !== chartHeight.value) chartHeight.value = h
            })
            chartObserver.observe(el)
        })
        onUnmounted(() => chartObserver?.disconnect())
        const showChart = (key) => {
            activeChart.value = key
            const el = chartCard.value
            if (!el) return
            const r = el.getBoundingClientRect()
            // Only scroll when the chart is entirely off-screen — if any of it is
            // visible the user can already see the change, and jumping is jarring.
            if (r.bottom < 0 || r.top > window.innerHeight) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
        const insightCards = computed(() => {
            const a = props.analytics
            if (!a) return []
            return [
                { key: 'embun', title: 'Embun Es', insight: a.embunEsPrediction.value, chart: 'suhu',
                  iconBg: 'bg-sky-100 dark:bg-sky-500/20', stroke: 'stroke-sky-500', label: 'text-sky-500 dark:text-sky-400',
                  icon: '<path d="M2 12h20M12 2v20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07" />' },
                { key: 'tren', title: 'Tren Suhu', insight: a.tempTrend.value, chart: 'suhu',
                  iconBg: 'bg-orange-100 dark:bg-orange-500/20', stroke: 'stroke-orange-500', label: 'text-orange-500 dark:text-orange-400',
                  icon: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />' },
                { key: 'kini', title: 'Kondisi Kini', insight: a.currentInsight.value, chart: 'lembap',
                  iconBg: 'bg-emerald-100 dark:bg-emerald-500/20', stroke: 'stroke-emerald-500', label: 'text-emerald-500 dark:text-emerald-400',
                  icon: '<circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />' },
                { key: 'prakiraan', title: 'Prakiraan', insight: a.forecastSummary.value, chart: 'angin',
                  iconBg: 'bg-purple-100 dark:bg-purple-500/20', stroke: 'stroke-purple-500', label: 'text-purple-500 dark:text-purple-400',
                  icon: '<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9z" />' },
            ]
        })

        // Suhu Ekstrem rows pin their point on the temperature chart
        const pinnedExtreme = ref(null)
        const extremePoint = (kind) => {
            const pts = allSeries.value.suhu.filter(p => p.y != null && !isNaN(p.y))
            if (!pts.length) return null
            return pts.reduce((best, p) => (kind === 'max' ? p.y > best.y : p.y < best.y) ? p : best)
        }
        const extremes = computed(() => {
            const max = extremePoint('max'), min = extremePoint('min')
            return [
                { key: 'max', label: 'Suhu Tertinggi', icon: '/icon/hot.webp', value: Math.floor(Math.max(...simpanSuhu.value)), at: max?.x,
                  valueClass: 'text-slate-800 dark:text-slate-100', activeBg: 'bg-orange-50 dark:bg-orange-500/10' },
                { key: 'min', label: 'Suhu Terendah', icon: '/icon/cold.webp', value: Math.floor(Math.min(...simpanSuhu.value)), at: min?.x,
                  valueClass: 'text-sky-500 dark:text-sky-400', activeBg: 'bg-sky-50 dark:bg-sky-500/10' },
            ]
        })
        const focusExtreme = (kind) => {
            if (pinnedExtreme.value === kind) { pinnedExtreme.value = null; return }
            pinnedExtreme.value = kind
            showChart('suhu')
        }

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
            const font = 'Plus Jakarta Sans, system-ui, sans-serif';
            const meta = chartMeta[activeChart.value]
            const color = chartColors[activeChart.value]
            const periodLabel = formatDaily.value ? 'periode ini' : '24 jam terakhir'
            const chartTitle = activeChart.value === 'angin' ? meta.title : `${meta.title} — ${periodLabel}`

            const pinned = activeChart.value === 'suhu' && pinnedExtreme.value ? extremePoint(pinnedExtreme.value) : null
            const pinColor = pinnedExtreme.value === 'max' ? '#f97316' : '#0ea5e9'
            // Anchor the label away from the chart edges so it never gets clipped
            const pinPos = pinned ? allSeries.value.suhu.indexOf(pinned) / Math.max(allSeries.value.suhu.length - 1, 1) : 0
            const pinAnchor = pinPos > 0.75 ? 'end' : pinPos < 0.25 ? 'start' : 'middle'

            return {
                annotations: {
                    points: pinned ? [{
                        x: pinned.x,
                        y: pinned.y,
                        marker: { size: 6, fillColor: pinColor, strokeColor: dark ? '#0a1524' : '#fff', strokeWidth: 3 },
                        label: {
                            text: `${pinnedExtreme.value === 'max' ? 'Tertinggi' : 'Terendah'} ${pinned.y.toFixed(1)}°C`,
                            borderColor: pinColor,
                            textAnchor: pinAnchor,
                            offsetY: -6,
                            style: { background: pinColor, color: '#fff', fontSize: '11px', fontWeight: 600, fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif' },
                        },
                    }] : [],
                },
                chart: {
                    height: chartHeight.value, // must match the <apexchart height> prop, or option updates shrink the chart
                    type: 'area',
                    background: 'transparent',
                    foreColor: labelColor,
                    fontFamily: font,
                    zoom: { enabled: false },
                    toolbar: { show: false },
                },
                theme: { mode: dark ? 'dark' : 'light' },
                colors: [color],
                dataLabels: { enabled: false },
                stroke: { width: 2.5, curve: 'smooth', lineCap: 'round' },
                // Soft wash under the line that fades out toward the axis
                fill: {
                    type: 'gradient',
                    gradient: { shadeIntensity: 0, opacityFrom: dark ? 0.3 : 0.25, opacityTo: 0, stops: [0, 95] },
                },
                title: {
                    text: chartTitle,
                    align: 'left',
                    style: { color: titleColor, fontSize: '13px', fontFamily: font, fontWeight: 600 },
                },
                markers: {
                    size: 0,
                    colors: [color],
                    strokeColors: dark ? '#0a1524' : '#ffffff',
                    strokeWidth: 3,
                    hover: { size: 6 },
                },
                yaxis: {
                    tickAmount: 4,
                    labels: {
                        style: { colors: labelColor, fontFamily: font },
                        formatter: (v) => v == null ? '' : `${fmtNum(v, activeChart.value === 'angin' ? 1 : 0)}${meta.axisUnit}`,
                    },
                },
                xaxis: {
                    type: 'category',
                    tickAmount: 8,
                    labels: { rotate: 0, hideOverlappingLabels: true, style: { colors: labelColor, fontFamily: font } },
                    axisBorder: { show: false },
                    axisTicks: { show: false },
                    crosshairs: { stroke: { color: color, width: 1, dashArray: 4 } },
                    tooltip: { enabled: false },
                },
                grid: {
                    borderColor: gridColor,
                    strokeDashArray: 4,
                    xaxis: { lines: { show: false } },
                    padding: { left: 4, right: 8 },
                },
                // Floating card: time, value, and change from the previous point
                tooltip: {
                    shared: false,
                    intersect: false,
                    custom: ({ series, seriesIndex, dataPointIndex, w }) => {
                        const v = series[seriesIndex][dataPointIndex]
                        if (v == null) return ''
                        const prev = dataPointIndex > 0 ? series[seriesIndex][dataPointIndex - 1] : null
                        const label = w.config.series[seriesIndex].data[dataPointIndex]?.x ?? ''
                        let delta = ''
                        if (prev != null) {
                            const d = v - prev
                            const cls = Math.abs(d) < 0.05 ? 'text-slate-400' : d > 0 ? 'text-orange-500' : 'text-sky-500'
                            const arrow = Math.abs(d) < 0.05 ? '•' : d > 0 ? '▲' : '▼'
                            delta = `<span class="${cls} text-[11px] font-semibold">${arrow} ${fmtNum(Math.abs(d))}</span>`
                        }
                        return `<div class="px-3 py-2 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur border border-slate-100 dark:border-white/10 shadow-lg shadow-slate-900/10">
                            <div class="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                <span class="w-1.5 h-1.5 rounded-full" style="background:${color}"></span>${label}
                            </div>
                            <div class="flex items-baseline gap-2 mt-0.5">
                                <span class="font-display text-base font-bold text-slate-800 dark:text-slate-100">${fmtNum(v)}<span class="text-xs font-medium text-slate-400">${meta.unit}</span></span>
                                ${delta}
                            </div>
                        </div>`
                    },
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
            pinnedExtreme.value = null;
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
            sunriseTime,
            sunsetTime,
            sunRelative,
            sunriseRel,
            sunsetRel,
            selectedPollutant,
            activePollutant,
            ringReady,
            chartCard,
            chartBox,
            chartHeight,
            showChart,
            insightCards,
            extremes,
            pinnedExtreme,
            focusExtreme,
        };
    },
};
</script>
