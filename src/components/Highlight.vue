<template>
    <div class="grid grid-cols-11 grid-rows-2 lg:grid-flow-row-dense xl:grid-flow-col gap-4">
        <div class="col-span-11 xl:col-span-5 row-span-2 bg-white border border-slate-100 shadow-sm dark:bg-white/5 dark:backdrop-blur-md dark:border-white/10 dark:shadow-none rounded-2xl p-4 transition-colors duration-300">
            <div id="chart">
                <apexchart ref="chart" type="line" height="250" :options="optionRekap" :series="dataRekap"></apexchart>
            </div>
        </div>
        <div class="col-span-11 lg:col-span-6 xl:col-span-3 row-span-1 bg-white border border-slate-100 shadow-sm dark:bg-white/5 dark:backdrop-blur-md dark:border-white/10 dark:shadow-none rounded-2xl py-5 px-6 transition-colors duration-300">
            <div class="flex flex-col gap-4 h-full justify-center">
                <div class="flex items-center gap-4">
                    <img class="w-8 h-8" src="/icon/hot.png" />
                    <div class="flex-1">
                        <p class="text-sm text-slate-700 dark:text-slate-200 font-medium">Suhu Tertinggi</p>
                        <p class="text-xs text-slate-400 dark:text-slate-500">Turun 5° C</p>
                    </div>
                    <p class="font-display text-lg font-bold text-slate-800 dark:text-slate-100">{{ Math.floor(Math.max(...simpanSuhu)) }}°<span class="text-sm font-normal text-slate-400"> C</span></p>
                </div>
                <div class="h-px bg-slate-100 dark:bg-white/10"></div>
                <div class="flex items-center gap-4">
                    <img class="w-8 h-8" src="/icon/cold.png" />
                    <div class="flex-1">
                        <p class="text-sm text-slate-700 dark:text-slate-200 font-medium">Suhu Terendah</p>
                        <p class="text-xs text-slate-400 dark:text-slate-500">Naik 2° C</p>
                    </div>
                    <p class="font-display text-lg font-bold text-sky-500 dark:text-sky-400">{{ Math.floor(Math.min(...simpanSuhu)) }}°<span class="text-sm font-normal text-slate-400"> C</span></p>
                </div>
            </div>
        </div>
        <div class="col-span-11 lg:col-span-6 xl:col-span-3 row-span-1 bg-white border border-slate-100 shadow-sm dark:bg-white/5 dark:backdrop-blur-md dark:border-white/10 dark:shadow-none rounded-2xl p-5 transition-colors duration-300">
            <p class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">Terjadi banyak penurunan suhu minggu ini, munculnya embun es bisa terjadi kapan saja</p>
        </div>
        <div class="col-span-11 lg:col-span-5 xl:col-span-3 row-span-2 bg-white border border-slate-100 shadow-sm dark:bg-white/5 dark:backdrop-blur-md dark:border-white/10 dark:shadow-none rounded-2xl p-4 transition-colors duration-300">
            <h3 class="font-semibold text-slate-600 dark:text-slate-300 text-center mb-3 tracking-wide text-xs uppercase">Lokasi</h3>
            <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3958.31350226444!2d109.90474991411338!3d-7.205029272731311!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e700cfe8a2a15eb%3A0xcfd9233d8b8bbb51!2sCandi%20Arjuna!5e0!3m2!1sid!2sid!4v1597120369515!5m2!1sid!2sid"
                width="100%" overflow="auto" height="230" frameborder="0" style="border:0; border-radius: 12px;" allowfullscreen=""
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
    props: ['data', 'daily'],
    setup(props) {
        const { isDark } = useDarkMode();
        const arrange = ref(false);
        const dataSuhu = ref([]);
        const formatDaily = ref(false);
        const simpanSuhu = ref([]);
        const dataRekap = ref([
            {
                name: "Suhu",
                data: [3, 5, 1, -1, -4, 0, 3, 7],
            },
        ]);
        const optionRekap = computed(() => {
            const dark = isDark.value;
            const labelColor = dark ? '#64748b' : '#94a3b8';
            const gridColor = dark ? '#ffffff10' : '#e2e8f0';
            const titleColor = dark ? '#f1f5f9' : '#0f172a';
            const axisColor = dark ? '#1e293b' : '#e2e8f0';
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
                colors: ['#0ea5e9'],
                dataLabels: { enabled: false },
                stroke: { width: [2.5], curve: 'smooth', dashArray: [0] },
                title: {
                    text: 'Data 24 jam terakhir',
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
                        text: 'Temperatur',
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
            const dataSuhuTemp = [];
            const dataSemua = [];
            data.forEach((detail) => {
                dataSuhuTemp.push(parseFloat(detail.field1));
                if (formatDaily.value) {
                    dataSemua.push({
                        x: moment(detail.created_at).format('DD MMMM YYYY'),
                        y: parseFloat(detail.field1),
                    });
                } else {
                    dataSemua.push({
                        x: moment(detail.created_at).format('HH:mm'),
                        y: parseFloat(detail.field1),
                    });
                }
            });
            if (!formatDaily.value) dataSemua.shift();
            dataRekap.value[0].data = dataSemua;
            simpanSuhu.value = dataSuhuTemp;
            arrange.value = true;
        };

        watch(
            () => props.data,
            (data) => {
                arrange.value = false;
                dataSuhu.value = data;
                arrangeData(data.feeds);
            }
        );

        watch(
            () => props.daily,
            (data) => {
                formatDaily.value = data;
            }
        );

        onUpdated(() => {
            if (!arrange.value) {
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
        };
    },
};
</script>