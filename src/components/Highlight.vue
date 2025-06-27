<template>
    <div class="grid grid-cols-11 grid-rows-2 lg:grid-flow-row-dense xl:grid-flow-col gap-4">
        <div class="col-span-11 xl:col-span-5 row-span-2 bg-stone-50 border rounded-2xl shadow-xl p-4">
            <div id="chart">
                <apexchart ref="chart" type="line" height="250" :options="optionRekap" :series="dataRekap"></apexchart>
            </div>
        </div>
        <div
            class="col-span-11 lg:col-span-6 xl:col-span-3 row-span-1 bg-stone-50 border rounded-2xl shadow-xl py-4 px-8 lg:px-4">
            <div class="grid grid-cols-12 gap-2 h-full items-center">
                <div class="col-span-12">
                    <div class="grid grid-cols-12 gap-4 items-center">
                        <div class="col-span-3">
                            <img class="w-8 h-8" src="/icon/hot.png" />
                        </div>
                        <div class="col-span-6">
                            <p class="text-sm">Suhu Tertinggi</p>
                            <p class="text-xs text-gray-500">Turun 5° C</p>
                        </div>
                        <div class="col-span-3">
                            <p class="text-right">{{ Math.floor(Math.max(...simpanSuhu)) }}° C</p>
                        </div>
                    </div>
                </div>
                <div class="col-span-12">
                    <div class="grid grid-cols-12 gap-4 items-center">
                        <div class="col-span-3">
                            <img class="w-8 h-8" src="/icon/cold.png" />
                        </div>
                        <div class="col-span-6">
                            <p class="text-sm">Suhu Terendah</p>
                            <p class="text-xs text-gray-500">Naik 2° C</p>
                        </div>
                        <div class="col-span-3">
                            <p class="text-right">{{ Math.floor(Math.min(...simpanSuhu)) }}° C</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-span-11 lg:col-span-6 xl:col-span-3 row-span-1 bg-stone-50 border rounded-2xl shadow-xl p-4">
            <p class="mt-2 text-base">Terjadi banyak penurunan suhu minggu ini, munculnya embun es bisa terjadi kapan saja</p>
        </div>
        <div class="col-span-11 lg:col-span-5 xl:col-span-3 row-span-2 bg-stone-50 border rounded-2xl shadow-xl p-4">
            <h3 class="font-semibold text-center mb-2">Lokasi</h3>
            <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3958.31350226444!2d109.90474991411338!3d-7.205029272731311!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e700cfe8a2a15eb%3A0xcfd9233d8b8bbb51!2sCandi%20Arjuna!5e0!3m2!1sid!2sid!4v1597120369515!5m2!1sid!2sid"
                width="100%" overflow="auto" height="230" frameborder="0" style="border:0;" allowfullscreen=""
                aria-hidden="false" tabindex="0"></iframe>
        </div>
    </div>
</template>

<script>
import { ref, watch, onUpdated } from 'vue';
import VueApexCharts from 'vue3-apexcharts';
import moment from 'moment/min/moment-with-locales';
moment.locale('id');

export default {
    components: {
        apexchart: VueApexCharts,
    },
    props: ['data', 'daily'],
    setup(props) {
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
        const optionRekap = ref({
            chart: {
                height: 250,
                type: 'line',
                zoom: {
                    enabled: false,
                },
            },
            dataLabels: {
                enabled: false,
            },
            stroke: {
                width: [2],
                curve: 'smooth',
                dashArray: [0],
            },
            title: {
                text: 'Data 24 jam terakhir',
                align: 'left',
            },
            legend: {
                tooltipHoverFormatter: function (val, opts) {
                    return (
                        val +
                        ' - <strong>' +
                        opts.w.globals.series[opts.seriesIndex][opts.dataPointIndex] +
                        '</strong>'
                    );
                },
            },
            markers: {
                size: 0,
                hover: {
                    sizeOffset: 6,
                },
            },
            yaxis: {
                title: {
                    text: 'Temperatur',
                },
            },
            xaxis: {
                type: 'category',
                tickAmount: 10,
            },
            grid: {
                borderColor: '#f1f1f1',
            },
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