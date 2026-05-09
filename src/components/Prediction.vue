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
                <div class="bg-white border border-slate-100 shadow-sm dark:bg-white/5 dark:backdrop-blur-md dark:border-white/10 dark:shadow-none rounded-2xl p-4 mb-3 transition-colors duration-300">
                    <div class="flex flex-col items-center">
                        <h3 class="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3 tracking-wider uppercase">{{ props.daily ? new
                            Date(entry.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' }) :
                            entry.dt_txt.split(' ')[1].slice(0, 5).replace(':', '.') }}</h3>
                        <img :src="`/img/weather/${entry.weather[0].icon}.svg`" class="w-24 h-20 mb-2" alt="Weather Icon">
                        <p class="text-sm text-slate-600 dark:text-slate-300 capitalize text-center leading-tight">{{ entry.weather[0].description }}</p>
                    </div>
                </div>
                <div class="bg-white border border-slate-100 shadow-sm dark:bg-white/5 dark:backdrop-blur-md dark:border-white/10 dark:shadow-none rounded-2xl p-4 transition-colors duration-300">
                    <div class="flex flex-col gap-2">
                        <div class="flex justify-between items-center">
                            <span class="text-xs text-slate-400 dark:text-slate-500">Suhu</span>
                            <span class="font-display text-xs font-semibold text-slate-700 dark:text-slate-200">{{ entry.main.temp }}°C</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-xs text-slate-400 dark:text-slate-500">Lembap</span>
                            <span class="font-display text-xs font-semibold text-slate-700 dark:text-slate-200">{{ entry.main.humidity }}%</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-xs text-slate-400 dark:text-slate-500">Angin</span>
                            <span class="font-display text-xs font-semibold text-slate-700 dark:text-slate-200">{{ entry.wind.speed }} m/s</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-xs text-slate-400 dark:text-slate-500">Awan</span>
                            <span class="font-display text-xs font-semibold text-slate-700 dark:text-slate-200">{{ entry.clouds.all }}%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
