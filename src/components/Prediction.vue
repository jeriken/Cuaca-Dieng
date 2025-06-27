<script setup>
import { computed } from 'vue';

// Props
const props = defineProps(['data', 'daily']);

// Flatten and process data
const processedData = computed(() => {
    const result = [];
    if (props.data && props.data.list) {
        const currentDate = new Date();
        const currentHour = currentDate.getHours();
        const today = currentDate.toISOString().split('T')[0];

        props.data.list.forEach((item) => {
            const date = item.dt_txt.split(' ')[0]; // Extract the date
            const entryHour = new Date(item.dt_txt).getHours();

            if (props.daily) {
                // Check if the date already exists in the result
                const existingEntry = result.find((entry) => entry.date === date);

                if (!existingEntry) {
                    // Check if there's an entry for the next hour
                    const nextHourEntry = props.data.list.find((entry) => {
                        const entryDate = entry.dt_txt.split(' ')[0];
                        const entryHour = new Date(entry.dt_txt).getHours();
                        return entryDate === date && entryHour > currentHour;
                    });

                    if (nextHourEntry) {
                        result.push({ date, ...nextHourEntry });
                    } else {
                        // Get the last data for the day if no next hour entry exists
                        const dayEntries = props.data.list.filter((entry) => entry.dt_txt.split(' ')[0] === date);
                        const lastEntry = dayEntries[dayEntries.length - 1];
                        if (lastEntry) {
                            result.push({ date, ...lastEntry });
                        }
                    }
                }
            } else {
                // Add only today's data after the current hour
                if (date === today && entryHour > currentHour) {
                    result.push({ date, ...item });
                }
            }
        });

        // If fewer than 5 entries, add data from the next day
        if (result.length < 5) {
            props.data.list.forEach((item) => {
                const date = item.dt_txt.split(' ')[0]; // Extract the date
                const entryHour = new Date(item.dt_txt).getHours();

                if (!props.daily && date !== today) {
                    // Add next day's data if today's data is insufficient
                    result.push({ date, ...item });
                }

                // Stop once we have 5 entries
                if (result.length === 5) {
                    return;
                }
            });
        }
    }
    return result.slice(0, 5); // Limit to 5 entries
});
</script>

<template>
    <div class="overflow-x-auto w-full">
        <div class="grid grid-cols-5 gap-4 mb-8 min-w-[1080px]">
            <div v-for="entry in processedData" :key="entry.dt">
                <div class="bg-stone-50 border rounded-2xl shadow-xl p-4 mb-2">
                    <div class="flex flex-col items-center">
                        <h3 class="text-lg font-semibold mb-4">{{ props.daily ? new
                            Date(entry.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' }) :
                            entry.dt_txt.split(' ')[1].slice(0, 5).replace(':', '.') }}</h3>
                        <img :src="`/img/weather/${entry.weather[0].icon}.svg`" class="w-28 h-24 mb-1" alt="Weather Icon">
                        <p class="text-lg capitalize">{{ entry.weather[0].description }}</p>
                        <!-- <p>{{ entry.main.temp }}°C</p> -->
                    </div>
                </div>
                <div class="bg-stone-50 border rounded-2xl shadow-xl p-4">
                    <div class="flex flex-col items-start">
                        <p class="text-sm"><span class="font-semibold">Suhu: </span>{{ entry.main.temp }}°C</p>
                        <p class="text-sm"><span class="font-semibold">Kelembapan: </span> {{ entry.main.humidity }}%</p>
                        <p class="text-sm"><span class="font-semibold">Kecepatan Angin: </span> {{ entry.wind.speed }} m/s</p>
                        <p class="text-sm"><span class="font-semibold">Tertutup Awan: </span>{{ entry.clouds.all }}%</p>
                        <!-- <p><strong>Tekanan: </strong> {{ entry.main.pressure }} hPa</p> -->
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
