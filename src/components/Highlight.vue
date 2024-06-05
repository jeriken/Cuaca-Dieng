<template>
    <div class="grid grid-cols-11 grid-rows-2 lg:grid-flow-row-dense xl:grid-flow-col gap-4">
        <div class="col-span-11 xl:col-span-5 row-span-2 bg-stone-50 border rounded-2xl shadow-xl p-4">
            <div id="chart">
                <apexchart type="line" height="250" :options="optionRekap" :series="dataRekap"></apexchart>
            </div>
        </div>
        <div class="col-span-11 lg:col-span-6 xl:col-span-3 row-span-1 bg-stone-50 border rounded-2xl shadow-xl py-4 px-8 lg:px-4">
            <!-- <h3 class="font-semibold text-center">Suhu</h3> -->
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
                            <p class="text-right">25° C</p>
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
                            <p class="text-right">-3° C</p>
                        </div>
                    </div>
                </div>
            </div>
            <!-- <p class="mt-2 text-sm">Suhu hari ini mengalami penurunan sebanyak 3° dibandingkan hari lalu</p> -->
        </div>
        <div class="col-span-11 lg:col-span-6 xl:col-span-3 row-span-1 bg-stone-50 border rounded-2xl shadow-xl p-4">
            <!-- <h3 class="font-semibold">Tekanan Udara</h3> -->
            <p class="mt-2 text-sm">Terjadi banyak penurunan suhu minggu ini, munculnya embun es bisa terjadi kapan saja</p>
        </div>
        <div class="col-span-11 lg:col-span-5 xl:col-span-3 row-span-2 bg-stone-50 border rounded-2xl shadow-xl p-4">
            <h3 class="font-semibold text-center mb-2">Lokasi</h3>
            <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3958.31350226444!2d109.90474991411338!3d-7.205029272731311!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e700cfe8a2a15eb%3A0xcfd9233d8b8bbb51!2sCandi%20Arjuna!5e0!3m2!1sid!2sid!4v1597120369515!5m2!1sid!2sid" width="100%" overflow="auto" height="230" frameborder="0" style="border:0;" allowfullscreen="" aria-hidden="false" tabindex="0"></iframe>
            <!-- <div id="chart" class="mt-2">
                <apexchart type="radialBar" :options="optionSuhu" :series="dataSuhu"></apexchart>
            </div>
            <p class="mt-2 text-sm">Kelembapan hari ini mengalami penurunan sebanyak 3° dibandingkan hari lalu</p> -->

        </div>
    </div>
</template>

<script>
import VueApexCharts from 'vue3-apexcharts'

export default {
    el: '#app',
    components: {
        apexchart: VueApexCharts,
    },
    data() {
        return {
            dataRekap: [{
                name: "Suhu",
                data: [3, 5, 1, -1, -4, 0, 3, 7]
            },
            {
                name: "Kelembapan",
                data: [35, 41, 62, 42, 13, 18, 29, 37]
            },
            {
                name: 'Tekanan Udara',
                data: [87, 57, 74, 99, 75, 38, 62, 47]
            }
            ],
            optionRekap: {
                chart: {
                    height: 250,
                    type: 'line',
                    zoom: {
                        enabled: false
                    },
                },
                dataLabels: {
                    enabled: false
                },
                stroke: {
                    width: [2, 2, 2],
                    curve: 'smooth',
                    dashArray: [0, 0, 0]
                },
                title: {
                    text: 'Data 24 jam terakhir',
                    align: 'left'
                },
                legend: {
                    tooltipHoverFormatter: function (val, opts) {
                        return val + ' - <strong>' + opts.w.globals.series[opts.seriesIndex][opts.dataPointIndex] + '</strong>'
                    }
                },
                markers: {
                    size: 0,
                    hover: {
                        sizeOffset: 6
                    }
                },
                xaxis: {
                    categories: ['01 Jan', '02 Jan', '03 Jan', '04 Jan', '05 Jan', '06 Jan', '07 Jan', '08 Jan', '09 Jan',
                        '10 Jan', '11 Jan', '12 Jan'
                    ],
                },
                grid: {
                    borderColor: '#f1f1f1',
                }
            },
            dataSuhu: [70],
            optionSuhu: {
                chart: {
                    type: 'radialBar',
                    offsetY: -20,
                    sparkline: {
                        enabled: true
                    }
                },
                plotOptions: {
                    radialBar: {
                        startAngle: -90,
                        endAngle: 90,
                        track: {
                            background: "#e7e7e7",
                            strokeWidth: '97%',
                            margin: 5, // margin is in pixels
                            dropShadow: {
                                enabled: true,
                                top: 2,
                                left: 0,
                                color: '#999',
                                opacity: 1,
                                blur: 2
                            }
                        },
                        dataLabels: {
                            name: {
                                show: false
                            },
                            value: {
                                offsetY: -2,
                                fontSize: '22px'
                            }
                        }
                    }
                },
                grid: {
                    padding: {
                        top: -10
                    }
                },
            },

        }
    },

};
</script>