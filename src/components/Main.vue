<script setup>
import { ref, computed, onMounted, watch } from "vue";
import {
    TransitionRoot,
    TransitionChild,
    Dialog,
    DialogPanel,
    DialogTitle,
    Popover, PopoverButton, PopoverPanel
} from '@headlessui/vue'
import { useDarkMode } from '../composables/useDarkMode.js'
import moment from 'moment/min/moment-with-locales'
moment.locale('id')

const props = defineProps(['data', 'loading', 'sunData']);

const { isDark, toggle: toggleDark } = useDarkMode()

const isOpenPopup = ref(false);
const kondisi = ref("Cerah");
const deferredPrompt = ref(null);

const navLinks = [
    {
        name: 'Beranda',
        href: '/',
        target: '_self',
        iconPath: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2zM9 22V12h6v10',
    },
    {
        name: 'Telegram Bot',
        href: 'https://t.me/CuacaDieng_Bot',
        target: '_blank',
        iconPath: 'M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z',
    },
    {
        name: 'Instagram',
        href: 'https://www.instagram.com/cuacadieng/',
        target: '_blank',
        iconPath: 'M4 4m0 4a4 4 0 014-4h8a4 4 0 014 4v8a4 4 0 01-4 4H8a4 4 0 01-4-4z M12 12m-3 0a3 3 0 106 0 3 3 0 10-6 0 M17.5 6.5h.01',
    },
    {
        name: 'Twitter / X',
        href: 'https://x.com/CuacaDieng',
        target: '_blank',
        iconPath: null,
        isX: true,
    },
];

const sunriseTime = computed(() => {
    if (!props.sunData?.sunrise) return null
    return moment.unix(props.sunData.sunrise).utcOffset(7).format('HH:mm')
})

const sunsetTime = computed(() => {
    if (!props.sunData?.sunset) return null
    return moment.unix(props.sunData.sunset).utcOffset(7).format('HH:mm')
})

function setIsOpenPopup(value) {
    isOpenPopup.value = value;
}

function getKondisi(pressure, rain) {
    if (pressure >= 798.5 && rain > 950) {
        kondisi.value = "Cerah";
    } else if (pressure > 796.5 && rain > 950) {
        kondisi.value = "Cerah Berawan";
    } else if (pressure > 794.0) {
        kondisi.value = "Berawan";
    } else if (pressure < 794.0 && rain < 950) {
        kondisi.value = "Hujan";
    } else if (pressure < 792.0 && rain < 950) {
        kondisi.value = "Hujan Lebat";
    } else {
        kondisi.value = "Berawan";
    }
}

function install() {
    if (deferredPrompt.value) {
        deferredPrompt.value.prompt();
    }
}

onMounted(() => {
    window.addEventListener("beforeinstallprompt", e => {
        e.preventDefault();
        deferredPrompt.value = e;
    });

    window.addEventListener("appinstalled", () => {
        deferredPrompt.value = null;
    });
});

watch(() => props.data, (value) => {
    if (value?.field3) getKondisi(value.field3, value.field5);
});
</script>

<template>
    <div class="relative flex flex-col h-full transition-colors duration-300">

        <!-- Header -->
        <div class="flex justify-between items-center px-5 pt-5 pb-2">

            <!-- Left: Hamburger menu -->
            <Popover v-slot="{ open, close }" class="relative">
                <PopoverButton
                    class="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/10 transition-colors focus:outline-none">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M3 12H21M9 18H21M3 6H15" class="stroke-slate-600 dark:stroke-slate-400"
                            stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
                    </svg>
                </PopoverButton>

                <transition enter-active-class="transition duration-200 ease-out"
                    enter-from-class="translate-y-1 opacity-0" enter-to-class="translate-y-0 opacity-100"
                    leave-active-class="transition duration-150 ease-in"
                    leave-from-class="translate-y-0 opacity-100" leave-to-class="translate-y-1 opacity-0">
                    <PopoverPanel class="absolute left-0 top-full z-20 mt-2 w-56">
                        <div
                            class="rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#162032]">
                            <div class="p-2">
                                <template v-for="item in navLinks" :key="item.name">
                                    <a :href="item.href" :target="item.target"
                                        class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/10 transition-colors group">
                                        <svg v-if="item.isX" width="14" height="14" viewBox="0 0 24 24"
                                            class="fill-slate-400 dark:fill-slate-500 group-hover:fill-slate-600 dark:group-hover:fill-slate-300 transition-colors flex-shrink-0">
                                            <path
                                                d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.736l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                        </svg>
                                        <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none"
                                            class="stroke-slate-400 dark:stroke-slate-500 group-hover:stroke-slate-600 dark:group-hover:stroke-slate-300 transition-colors flex-shrink-0"
                                            stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                                            <path :d="item.iconPath" />
                                        </svg>
                                        <span
                                            class="text-sm font-medium text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">
                                            {{ item.name }}
                                        </span>
                                    </a>
                                </template>
                            </div>

                            <div class="h-px mx-3 bg-slate-100 dark:bg-white/10"></div>

                            <div class="p-2">
                                <button @click="() => { setIsOpenPopup(true); close() }"
                                    class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors group text-left">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                        class="flex-shrink-0 stroke-amber-500 group-hover:stroke-amber-600 transition-colors"
                                        stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                                        <path d="M9.663 17h4.673M12 3v1M3.343 7.343l.707.707M1 17h2M21 17h2M19.657 7.343l-.707.707M15 14.646A3 3 0 1112 3a3 3 0 013 3" />
                                        <path d="M9 17a3 3 0 006 0v-2.354A3.988 3.988 0 0112 7a4 4 0 014 4c0 1.134-.472 2.158-1.228 2.886L14 14.646" />
                                    </svg>
                                    <span
                                        class="text-sm font-medium text-slate-600 dark:text-slate-300 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                                        Tips Embun Es
                                    </span>
                                </button>
                            </div>
                        </div>
                    </PopoverPanel>
                </transition>
            </Popover>

            <!-- Center: Title -->
            <h1 class="font-semibold text-sm text-slate-700 dark:text-slate-200 tracking-wider uppercase">
                Dieng Kulon
            </h1>

            <!-- Right: Dark/Light toggle -->
            <button @click="toggleDark"
                class="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                :title="isDark ? 'Mode Terang' : 'Mode Gelap'">
                <svg v-if="!isDark" width="18" height="18" viewBox="0 0 24 24" fill="none"
                    class="stroke-slate-500 hover:stroke-slate-700 transition-colors"
                    stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                </svg>
                <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none"
                    class="stroke-amber-400 hover:stroke-amber-300 transition-colors"
                    stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
            </button>
        </div>

        <!-- Watermark -->
        <a v-if="!loading" href="https://www.instagram.com/cuacadieng/" target="_blank" class="absolute top-[38%] left-0 -translate-y-1/2 z-10 select-none">
            <span class="text-[11px] font-semibold tracking-widest uppercase bg-slate-800 dark:bg-sky-600/70 text-white backdrop-blur-sm px-2 py-3 block cursor-pointer" style="writing-mode: vertical-rl; transform: rotate(0deg);">
                @cuacadieng
            </span>
        </a>

        <!-- Main content -->
        <div class="flex-auto flex flex-col h-full">
            <div class="flex-grow h-full flex flex-col justify-between">

                <!-- Weather display — skeleton while loading -->
                <div class="flex-1 flex items-center justify-center">
                    <div v-if="loading">
                        <div class="w-52 h-52 rounded-full bg-slate-200 dark:bg-white/10 animate-pulse"></div>
                    </div>
                    <div v-else class="flex flex-col items-center gap-1">
                        <img class="w-52 drop-shadow-xl" src="/img/summertime.png" />
                        <div class="flex justify-center items-start">
                            <h1 class="font-display font-bold tracking-tighter text-9xl text-slate-800 dark:text-slate-100">
                                {{ Math.floor(data.field1) }}
                            </h1>
                            <span class="font-display text-5xl mt-5 font-light text-slate-500 dark:text-slate-300">°</span>
                        </div>
                        <h2 class="text-sky-500 dark:text-sky-400 text-lg font-medium tracking-wide">
                            {{ kondisi }}
                        </h2>
                    </div>
                </div>

                <!-- Stat cards -->
                <div class="pb-4">
                    <!-- Skeleton cards -->
                    <div v-if="loading" class="flex justify-center gap-3 mt-6 mb-4 px-4">
                        <div v-for="i in 3" :key="i" class="h-16 flex-1 rounded-2xl bg-slate-200 dark:bg-white/10 animate-pulse"></div>
                    </div>

                    <!-- Real stat cards -->
                    <template v-else>
                        <div class="flex justify-center gap-3 mt-6 px-4">
                            <!-- Tekanan Udara -->
                            <div class="text-center bg-white border border-slate-100 shadow-sm dark:bg-white/5 dark:border-white/10 dark:shadow-none backdrop-blur-md rounded-2xl px-3 py-3 flex-1 transition-colors duration-300">
                                <div class="flex justify-center items-center mb-2">
                                    <img class="w-5 h-5 opacity-50 dark:opacity-60" src="/img/compressor.png" />
                                </div>
                                <p class="font-display font-semibold text-sm text-slate-800 dark:text-slate-100 leading-none">
                                    {{ data.field3 }}<span class="text-[10px] font-normal text-slate-400 dark:text-slate-500 ml-0.5">mBar</span>
                                </p>
                                <p class="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 tracking-wide">Tekanan</p>
                            </div>

                            <!-- Real Feel -->
                            <div class="text-center bg-white border border-slate-100 shadow-sm dark:bg-white/5 dark:border-white/10 dark:shadow-none backdrop-blur-md rounded-2xl px-3 py-3 flex-1 transition-colors duration-300">
                                <div class="flex justify-center mb-2">
                                    <img class="w-5 h-5 opacity-50 dark:opacity-60" src="/img/temperature.png" />
                                </div>
                                <p class="font-display font-semibold text-sm text-slate-800 dark:text-slate-100 leading-none">
                                    {{ Math.floor(data.field1) + 7 }}<span class="text-[10px] font-normal text-slate-400 dark:text-slate-500 ml-0.5">°C</span>
                                </p>
                                <p class="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 tracking-wide">Real Feel</p>
                            </div>

                            <!-- Kelembapan -->
                            <div class="text-center bg-white border border-slate-100 shadow-sm dark:bg-white/5 dark:border-white/10 dark:shadow-none backdrop-blur-md rounded-2xl px-3 py-3 flex-1 transition-colors duration-300">
                                <div class="flex justify-center items-center mb-2">
                                    <img class="w-5 h-5 opacity-50 dark:opacity-60" src="/img/humidity.png" />
                                </div>
                                <p class="font-display font-semibold text-sm text-slate-800 dark:text-slate-100 leading-none">
                                    {{ data.field2 }}<span class="text-[10px] font-normal text-slate-400 dark:text-slate-500 ml-0.5">%</span>
                                </p>
                                <p class="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 tracking-wide">Kelembapan</p>
                            </div>
                        </div>

                        <!-- Sunrise / Sunset -->
                        <div v-if="sunriseTime && sunsetTime" class="flex gap-3 mx-4 mt-3 mb-1">
                            <!-- Sunrise -->
                            <div class="flex items-center gap-2 bg-white border border-slate-100 shadow-sm dark:bg-white/5 dark:border-white/10 rounded-2xl px-4 py-2.5 flex-1 transition-colors duration-300">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                    class="stroke-amber-400 flex-shrink-0" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                                    <path d="M12 2v4M4.93 10.93l2.83 2.83M1 18h4M19 18h4M18.07 10.93l-2.83 2.83M12 6a6 6 0 010 12M2 18h20" />
                                </svg>
                                <div>
                                    <p class="text-[10px] text-slate-400 dark:text-slate-500 tracking-wide">Terbit</p>
                                    <p class="font-display text-xs font-semibold text-slate-800 dark:text-slate-100">{{ sunriseTime }}</p>
                                </div>
                            </div>
                            <!-- Sunset -->
                            <div class="flex items-center gap-2 bg-white border border-slate-100 shadow-sm dark:bg-white/5 dark:border-white/10 rounded-2xl px-4 py-2.5 flex-1 transition-colors duration-300">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                    class="stroke-orange-400 flex-shrink-0" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                                    <path d="M12 10v4M4.93 10.93l2.83 2.83M1 18h4M19 18h4M18.07 10.93l-2.83 2.83M12 6a6 6 0 010 12M2 18h20M5 22l7-4 7 4" />
                                </svg>
                                <div>
                                    <p class="text-[10px] text-slate-400 dark:text-slate-500 tracking-wide">Terbenam</p>
                                    <p class="font-display text-xs font-semibold text-slate-800 dark:text-slate-100">{{ sunsetTime }}</p>
                                </div>
                            </div>
                        </div>

                        <!-- Install PWA banner -->
                        <div v-if="deferredPrompt"
                            class="flex items-center gap-3 bg-white border border-slate-100 shadow-sm dark:bg-white/5 dark:border-white/10 rounded-2xl mx-4 mb-4 mt-3 p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/10 transition-colors"
                            @click="install">
                            <img class="w-9 h-9 opacity-70" src="/icon/alarm.png" />
                            <div>
                                <p class="font-semibold text-slate-800 dark:text-slate-100 text-sm">Install Aplikasi</p>
                                <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Dapatkan informasi embun es dieng</p>
                            </div>
                        </div>
                    </template>
                </div>

            </div>
        </div>
    </div>

    <!-- Tips Modal -->
    <TransitionRoot appear :show="isOpenPopup" as="template">
        <Dialog as="div" @close="setIsOpenPopup(false)" class="relative z-30">
            <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0"
                enter-to="opacity-100" leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0">
                <div class="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm" />
            </TransitionChild>

            <div class="fixed inset-0 overflow-y-auto">
                <div class="flex min-h-full items-center justify-center p-4">
                    <TransitionChild as="template" enter="duration-300 ease-out"
                        enter-from="opacity-0 scale-95" enter-to="opacity-100 scale-100"
                        leave="duration-200 ease-in" leave-from="opacity-100 scale-100"
                        leave-to="opacity-0 scale-95">
                        <DialogPanel
                            class="w-full max-w-md rounded-2xl bg-white dark:bg-[#162032] border border-slate-100 dark:border-white/10 p-6 shadow-2xl transition-all">
                            <div class="flex items-center gap-3 mb-4">
                                <div class="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                        class="stroke-amber-500" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                                        <path d="M9.663 17h4.673M12 3v1M15 14.646A3 3 0 1112 3a3 3 0 013 3" />
                                        <path d="M9 17a3 3 0 006 0v-2.354A3.988 3.988 0 0112 7a4 4 0 014 4c0 1.134-.472 2.158-1.228 2.886L14 14.646" />
                                    </svg>
                                </div>
                                <DialogTitle as="h1" class="text-lg font-semibold text-slate-800 dark:text-slate-100">
                                    Tips Embun Es
                                </DialogTitle>
                            </div>
                            <p class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                                Embun es diprediksi akan muncul besok harinya jika saat pukul 22.00 suhu sudah
                                dibawah 6° C. Angin juga mempengaruhi terjadi tidaknya pembentukan embun es.
                                Embun es biasanya terjadi antara pukul 04.00–06.00 pagi.
                            </p>
                            <div class="mt-6">
                                <button type="button"
                                    class="inline-flex justify-center rounded-xl border border-sky-200 dark:border-sky-500/30 bg-sky-50 dark:bg-sky-500/10 px-5 py-2 text-sm font-medium text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-500/20 focus:outline-none transition-colors"
                                    @click="setIsOpenPopup(false)">
                                    Paham
                                </button>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </div>
        </Dialog>
    </TransitionRoot>
</template>
