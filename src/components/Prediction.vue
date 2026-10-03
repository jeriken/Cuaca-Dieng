<script setup>
import { ref, computed } from 'vue';

// Props
const props = defineProps(['data', 'daily']);

// Flatten and process data
const processedData = computed(() => {
    const result = [];
    if (props.data && props.data.list) {
        const currentDate = new Date();
        const currentHour = currentDate.getHours();
        const currentMinute = currentDate.getMinutes();
        const pad = (n) => String(n).padStart(2, '0');
        const today = `${currentDate.getFullYear()}-${pad(currentDate.getMonth() + 1)}-${pad(currentDate.getDate())}`;

        props.data.list.forEach((item) => {
            const date = item.dt_txt.split(' ')[0]; // Extract the date
            const entryHour = parseInt(item.dt_txt.split(' ')[1].slice(0, 2), 10);

            if (props.daily) {
                // Check if the date already exists in the result
                const existingEntry = result.find((entry) => entry.date === date);

                if (!existingEntry) {
                    // Check if there's an entry for the next hour
                    const nextHourEntry = props.data.list.find((entry) => {
                        const entryDate = entry.dt_txt.split(' ')[0];
                        const h = parseInt(entry.dt_txt.split(' ')[1].slice(0, 2), 10);
                        return entryDate === date && h >= currentHour;
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
                // Add only today's data from the next available slot after the current hour
                if (date === today && entryHour > currentHour) {
                    result.push({ date, ...item });
                }
            }
        });

        // If fewer than 5 entries, add data from the next day
        if (result.length < 5) {
            for (const item of props.data.list) {
                const date = item.dt_txt.split(' ')[0];

                if (!props.daily && date !== today) {
                    result.push({ date, ...item });
                }

                if (result.length === 5) break;
            }
        }
    }
    return result.slice(0, 5); // Limit to 5 entries
});

// Tap a forecast column to flip its top card to the detail view
const selected = ref(null);
const toggle = (dt) => { selected.value = selected.value === dt ? null : dt };

const compass = ['U', 'TL', 'T', 'Tg', 'S', 'BD', 'B', 'BL'];
const windDir = (deg) => compass[Math.round(deg / 45) % 8];
</script>

<template>
    <div class="overflow-x-auto w-full">
        <!-- Skeleton — reserves the same height as the real 5-card grid so it never pops in and shifts the sections below -->
        <div v-if="!processedData.length" class="grid grid-cols-5 gap-4 mb-8 min-w-[1080px]">
            <div v-for="i in 5" :key="i">
                <div class="h-[167.5px] mb-3 rounded-2xl bg-slate-100 dark:bg-white/5 animate-pulse"></div>
                <div class="h-[122px] rounded-2xl bg-slate-100 dark:bg-white/5 animate-pulse"></div>
            </div>
        </div>
        <div v-else class="grid grid-cols-5 gap-4 mb-8 min-w-[1080px]">
            <div v-for="(entry, i) in processedData" :key="entry.dt" class="rise" :style="{ animationDelay: `${i * 60}ms` }">
                <button type="button" @click="toggle(entry.dt)" :aria-pressed="selected === entry.dt"
                    :title="selected === entry.dt ? 'Kembali' : 'Lihat detail'"
                    class="group interactive lift w-full h-[167.5px] border shadow-sm dark:backdrop-blur-md dark:shadow-none rounded-2xl p-4 mb-3 text-left"
                    :class="selected === entry.dt
                        ? 'bg-sky-50 border-sky-200 dark:bg-sky-500/10 dark:border-sky-400/30'
                        : 'bg-white border-slate-100 dark:bg-white/5 dark:border-white/10'">
                    <Transition name="swap" mode="out-in">
                        <div v-if="selected !== entry.dt" key="front" class="flex flex-col items-center">
                            <h3 class="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3 tracking-wider uppercase">{{ props.daily ? new
                                Date(entry.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' }) :
                                entry.dt_txt.split(' ')[1].slice(0, 5).replace(':', '.') }}</h3>
                            <img :src="`/img/weather/${entry.weather[0].icon}.svg`" class="w-24 h-20 mb-2 transition-transform duration-300 group-hover:scale-110" alt="Weather Icon">
                            <p class="text-sm text-slate-600 dark:text-slate-300 capitalize text-center leading-tight">{{ entry.weather[0].description }}</p>
                        </div>
                        <div v-else key="back" class="flex flex-col h-full">
                            <h3 class="text-[10px] font-bold text-sky-500 dark:text-sky-400 mb-2 tracking-widest uppercase text-center">Detail</h3>
                            <dl class="flex flex-col gap-1.5 text-xs flex-1 justify-center">
                                <div class="flex justify-between"><dt class="text-slate-400 dark:text-slate-500">Terasa</dt><dd class="font-display font-semibold text-slate-700 dark:text-slate-200">{{ Math.round(entry.main.feels_like) }}°C</dd></div>
                                <div class="flex justify-between"><dt class="text-slate-400 dark:text-slate-500">Min / Maks</dt><dd class="font-display font-semibold text-slate-700 dark:text-slate-200">{{ Math.round(entry.main.temp_min) }}° / {{ Math.round(entry.main.temp_max) }}°</dd></div>
                                <div class="flex justify-between"><dt class="text-slate-400 dark:text-slate-500">Peluang Hujan</dt><dd class="font-display font-semibold text-sky-600 dark:text-sky-400">{{ Math.round((entry.pop ?? 0) * 100) }}%</dd></div>
                                <div class="flex justify-between"><dt class="text-slate-400 dark:text-slate-500">Arah Angin</dt><dd class="font-display font-semibold text-slate-700 dark:text-slate-200">{{ windDir(entry.wind.deg) }}</dd></div>
                            </dl>
                        </div>
                    </Transition>
                </button>
                <div class="bg-white border shadow-sm dark:bg-white/5 dark:backdrop-blur-md dark:shadow-none rounded-2xl p-4 transition-colors duration-300"
                    :class="selected === entry.dt ? 'border-sky-200 dark:border-sky-400/30' : 'border-slate-100 dark:border-white/10'">
                    <div class="flex flex-col gap-2">
                        <div class="flex justify-between items-center">
                            <span class="text-xs text-slate-400 dark:text-slate-500">Suhu</span>
                            <span class="font-display text-xs font-semibold text-slate-700 dark:text-slate-200">{{ entry.main.temp }}°C</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-xs text-slate-400 dark:text-slate-500">Kelembapan</span>
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
