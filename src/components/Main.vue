<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useDarkMode } from '../composables/useDarkMode.js'
import {
    TransitionRoot,
    TransitionChild,
    Dialog,
    DialogPanel,
    DialogTitle,
    Popover, PopoverButton, PopoverPanel
} from '@headlessui/vue'
import { RouterLink } from 'vue-router'
import { getKondisi } from '../utils/kondisi.js'
import { relativeTime } from '../utils/relativeTime.js'
import moment from 'moment'
import 'moment/locale/id'
moment.locale('id')

const props = defineProps(['data', 'loading']);
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
        name: 'Twibbon Suhu',
        to: '/twibbon',
        iconPath: 'M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z M12 17a4 4 0 100-8 4 4 0 000 8z',
        isNew: true,
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

const lastUpdate = computed(() => {
    if (!props.data?.created_at) return null
    return moment.parseZone(props.data.created_at).utcOffset(7)
})

const timeHM = computed(() => lastUpdate.value ? lastUpdate.value.format('HH:mm') : '--:--')
const timeSS = computed(() => lastUpdate.value ? lastUpdate.value.format('ss') : '--')
// Intl instead of moment: moment's 'id' locale doesn't reliably load, which showed English day names
const dateFmt = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' })
const dateNow = computed(() => lastUpdate.value ? dateFmt.format(lastUpdate.value.toDate()) : '-')

const heroTemp = computed(() => Math.floor(parseFloat(props.data.field1)));
const realFeel = computed(() => heroTemp.value + 7);

// Tap the illustration for a little wiggle
const wiggling = ref(false);
const wiggle = () => {
    wiggling.value = false;
    requestAnimationFrame(() => { wiggling.value = true });
};

// Stat cards flip to a short plain-language reading of the value
const flipped = ref(null);
const toggleFlip = (key) => { flipped.value = flipped.value === key ? null : key };
const pressureNote = computed(() => {
    const p = parseFloat(props.data.field3);
    if (p >= 798.5) return 'Tinggi · stabil';
    if (p > 794) return 'Normal';
    return 'Rendah · hujan?';
});
const humidityNote = computed(() => {
    const h = parseFloat(props.data.field2);
    if (h >= 90) return 'Rawan kabut';
    if (h >= 70) return 'Lembap';
    if (h >= 40) return 'Nyaman';
    return 'Kering';
});

const stats = computed(() => [
    { key: 'tekanan', label: 'Tekanan', icon: '/img/compressor.webp', value: props.data.field3, suffix: 'mBar', note: pressureNote.value },
    { key: 'feel', label: 'Real Feel', icon: '/img/temperature.webp', value: realFeel.value, suffix: '°C', note: 'Suhu terasa' },
    { key: 'lembap', label: 'Kelembapan', icon: '/img/humidity.webp', value: props.data.field2, suffix: '%', note: humidityNote.value },
]);

// "x menit lalu" next to the clock, ticking every 30s
const now = ref(Date.now());
let nowTimer = null;
const updatedAgo = computed(() => {
    if (!lastUpdate.value) return null;
    return relativeTime(lastUpdate.value.valueOf(), now.value);
});

function setIsOpenPopup(value) {
    isOpenPopup.value = value;
}

function install() {
    if (deferredPrompt.value) {
        deferredPrompt.value.prompt();
    }
}

onMounted(() => {
    nowTimer = setInterval(() => { now.value = Date.now() }, 30000);
    window.addEventListener("beforeinstallprompt", e => {
        e.preventDefault();
        deferredPrompt.value = e;
    });

    window.addEventListener("appinstalled", () => {
        deferredPrompt.value = null;
    });

});

onUnmounted(() => clearInterval(nowTimer));

watch(() => props.data, (value) => {
    if (value?.field3) kondisi.value = getKondisi(value.field3, value.field5);
});
</script>

<template>
    <div class="relative flex flex-col flex-1 min-h-[92svh] md:h-full md:min-h-full transition-colors duration-300">

        <!-- Header -->
        <div class="flex justify-between items-center px-3 pt-4 pb-2 md:px-5 md:pt-5">

            <!-- Left: Hamburger menu -->
            <Popover v-slot="{ open, close }" class="relative">
                <PopoverButton aria-label="Buka menu"
                    class="press w-9 h-9 rounded-xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/10 transition-colors focus:outline-none"
                    :class="open ? 'bg-slate-100 dark:bg-white/10' : ''">
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
                                    <component :is="item.to ? RouterLink : 'a'"
                                        v-bind="item.to ? { to: item.to } : { href: item.href, target: item.target }"
                                        class="press flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/10 transition-colors group"
                                        @click="close()">
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
                                        <span v-if="item.isNew"
                                            class="ml-auto text-[10px] font-bold uppercase tracking-wide bg-amber-400 text-slate-900 px-1.5 py-0.5 rounded-md">
                                            Baru
                                        </span>
                                    </component>
                                </template>
                            </div>

                        <!-- Tips (mobile only — desktop has header button) + Install (all sizes, when available) -->
                        <div :class="deferredPrompt ? '' : 'md:hidden'">
                            <div class="h-px mx-3 bg-slate-100 dark:bg-white/10"></div>
                            <div class="p-2">
                                <button @click="() => { setIsOpenPopup(true); close() }"
                                    class="md:hidden w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors group text-left">
                                    <img src="/icon/tips.svg" class="w-4 h-4 opacity-60 flex-shrink-0" width="16" height="16" alt="" />
                                    <span class="text-sm font-medium text-slate-600 dark:text-slate-300 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                                        Tips Embun Es
                                    </span>
                                </button>
                                <button v-if="deferredPrompt" @click="() => { install(); close() }"
                                    class="mt-1 md:mt-0 w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/10 transition-colors group text-left">
                                    <img src="/icon/alarm.png" class="w-4 h-4 opacity-60 flex-shrink-0" width="16" height="16" alt="" />
                                    <span class="text-sm font-medium text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">
                                        Install Aplikasi
                                    </span>
                                </button>
                            </div>
                        </div>

                        </div>
                    </PopoverPanel>
                </transition>
            </Popover>

            <!-- Center: Title -->
            <h1 class="font-semibold text-sm text-slate-700 dark:text-slate-200 tracking-wider uppercase">
                Dieng Kulon
            </h1>

            <!-- Right: mobile = dark/light toggle | desktop = tips button -->
            <div class="flex items-center">
                <!-- Mobile only: dark/light toggle -->
                <button @click="toggleDark"
                    class="press md:hidden w-9 h-9 rounded-xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                    :title="isDark ? 'Mode Terang' : 'Mode Gelap'">
                    <svg v-if="!isDark" width="18" height="18" viewBox="0 0 24 24" fill="none"
                        class="stroke-slate-500 transition-colors"
                        stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                    </svg>
                    <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none"
                        class="stroke-amber-400 transition-colors"
                        stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                        <circle cx="12" cy="12" r="5" />
                        <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                        <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                    </svg>
                </button>

                <!-- Desktop only: tips button using tips.svg -->
                <button @click="setIsOpenPopup(true)"
                    class="press hidden md:flex w-9 h-9 rounded-xl items-center justify-center hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors"
                    title="Tips Embun Es">
                    <img src="/icon/tips.svg" class="w-5 h-5 opacity-70 dark:opacity-60 hover:opacity-100 transition-opacity" width="20" height="20" alt="Tips" />
                </button>
            </div>
        </div>

        <!-- Watermark -->
        <a v-if="!loading" href="https://www.instagram.com/cuacadieng/" target="_blank" rel="noopener" class="group absolute top-[38%] left-0 -translate-y-1/2 z-10 select-none">
            <span class="text-[11px] font-semibold tracking-widest uppercase bg-slate-800 dark:bg-sky-600/70 text-white backdrop-blur-sm px-2 py-3 block cursor-pointer rounded-r-lg transition-all duration-200 group-hover:pl-3 group-hover:bg-gradient-to-b group-hover:from-pink-500 group-hover:to-amber-400 group-active:pl-3" style="writing-mode: vertical-rl;">
                @cuacadieng
            </span>
        </a>

        <!-- Main content -->
        <div class="flex-auto flex flex-col h-full">
            <div class="flex-grow h-full flex flex-col justify-between">

                <!-- Weather display — skeleton mirrors real content's block heights (image + huge temp number + condition text) so no shift occurs when data arrives -->
                <div class="flex-1 flex items-center justify-center">
                    <div v-if="loading" class="flex flex-col items-center gap-2 md:gap-3 w-52">
                        <div class="w-full h-[162px] rounded-2xl bg-slate-200 dark:bg-white/10 animate-pulse"></div>
                        <div class="h-32 w-40 rounded-2xl bg-slate-200 dark:bg-white/10 animate-pulse"></div>
                        <div class="h-7 w-24 rounded-full bg-slate-200 dark:bg-white/10 animate-pulse"></div>
                    </div>
                    <div v-else class="flex flex-col items-center gap-2 md:gap-3">
                        <button type="button" @click="wiggle" class="press rounded-2xl" aria-label="Ilustrasi cuaca">
                            <img class="w-52 drop-shadow-xl animate-float" src="/img/summertime.webp" width="280" height="218"
                                alt="Ilustrasi cuaca cerah" fetchpriority="high"
                                :class="wiggling ? 'animate-wiggle' : ''" @animationend="wiggling = false" />
                        </button>
                        <div class="flex justify-center items-start">
                            <h1 class="font-display font-bold tracking-tighter text-9xl text-slate-800 dark:text-slate-100 tabular-nums">
                                {{ heroTemp }}
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
                    <!-- Skeleton cards — mirrors the real layout (stat row + time strip) so no block pops in later -->
                    <template v-if="loading">
                        <div class="flex justify-center gap-3 mt-6 px-3 md:px-4">
                            <div v-for="i in 3" :key="i" class="h-[89px] flex-1 rounded-2xl bg-slate-200 dark:bg-white/10 animate-pulse"></div>
                        </div>
                        <div class="h-[64px] mx-3 md:mx-4 mt-3 mb-1 rounded-2xl bg-slate-200 dark:bg-white/10 animate-pulse"></div>
                    </template>

                    <!-- Real stat cards -->
                    <template v-else>
                        <!-- Tap a card to flip it to a plain-language reading of the value -->
                        <div class="flex justify-center gap-2 mt-6 px-3 md:px-4">
                            <button v-for="(stat, i) in stats" :key="stat.key" type="button"
                                @click="toggleFlip(stat.key)" :aria-pressed="flipped === stat.key"
                                :style="{ animationDelay: `${i * 60}ms` }"
                                class="rise interactive lift text-center border shadow-sm dark:shadow-none backdrop-blur-md rounded-2xl px-3 py-3 flex-1 h-[89px] flex flex-col items-center justify-center"
                                :class="flipped === stat.key
                                    ? 'bg-sky-50 border-sky-200 dark:bg-sky-500/10 dark:border-sky-400/30'
                                    : 'bg-white border-slate-100 dark:bg-white/5 dark:border-white/10'">
                                <Transition name="swap" mode="out-in">
                                    <span v-if="flipped !== stat.key" key="front" class="flex flex-col items-center">
                                        <img class="w-5 h-5 mb-2 opacity-50 dark:opacity-60" :src="stat.icon" width="20" height="20" alt="" />
                                        <span class="font-display font-semibold text-sm text-slate-800 dark:text-slate-100 leading-none">
                                            {{ stat.value }}<span class="text-[10px] font-normal text-slate-400 dark:text-slate-500 ml-0.5">{{ stat.suffix }}</span>
                                        </span>
                                        <span class="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 tracking-wide">{{ stat.label }}</span>
                                    </span>
                                    <span v-else key="back" class="flex flex-col items-center">
                                        <span class="text-[9px] font-bold uppercase tracking-widest text-sky-500 dark:text-sky-400">{{ stat.label }}</span>
                                        <span class="text-xs font-semibold text-slate-700 dark:text-slate-200 mt-1 leading-tight">{{ stat.note }}</span>
                                    </span>
                                </Transition>
                            </button>
                        </div>

                        <!-- Time & date strip -->
                        <div class="rise mx-3 md:mx-4 mt-3 mb-1 px-3 md:px-4 py-3 bg-white border border-slate-100 shadow-sm dark:bg-white/5 dark:border-white/10 rounded-2xl flex items-center justify-between gap-2 transition-colors duration-300" style="animation-delay: 180ms">
                            <div class="flex flex-col">
                                <span class="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 whitespace-nowrap">
                                    Update<span v-if="updatedAgo" class="normal-case tracking-normal font-medium"> · {{ updatedAgo }}</span>
                                </span>
                                <div class="flex items-baseline gap-1 mt-0.5">
                                    <span class="font-display font-bold text-xl leading-none tracking-tight text-slate-800 dark:text-slate-100 tabular-nums">{{ timeHM }}</span>
                                    <span class="font-display text-xs leading-none text-slate-400 dark:text-slate-500 tabular-nums">{{ timeSS }}</span>
                                    <span class="text-[10px] font-bold uppercase tracking-widest text-sky-500 dark:text-sky-400">WIB</span>
                                </div>
                            </div>
                            <div class="flex flex-col items-end">
                                <span class="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">Tanggal</span>
                                <span class="text-xs font-semibold text-slate-700 dark:text-slate-200 mt-0.5">{{ dateNow }}</span>
                            </div>
                        </div>
                    </template>

                    <!-- Twibbon CTA — below the weather info so the temperature stays the hero of screenshots.
                         Data-independent, so it renders during loading too and never shifts layout. -->
                    <RouterLink to="/twibbon"
                        class="interactive group flex items-center gap-3 mx-3 md:mx-4 mt-3 rounded-2xl px-4 py-3 bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-lg shadow-sky-500/20 hover:shadow-sky-500/40">
                        <span class="w-9 h-9 shrink-0 rounded-xl bg-white/20 flex items-center justify-center transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                stroke-linecap="round" stroke-linejoin="round">
                                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                                <circle cx="12" cy="13" r="4" />
                            </svg>
                        </span>
                        <span class="flex-1 min-w-0">
                            <span class="flex items-center gap-1.5 text-sm font-semibold leading-tight">
                                Pamer Dinginnya Dieng
                                <span class="text-[9px] font-bold uppercase tracking-wide bg-amber-400 text-slate-900 px-1.5 py-0.5 rounded-md">Baru</span>
                            </span>
                            <span class="block text-xs text-sky-100 truncate mt-0.5">Pasang suhu hari ini di fotomu</span>
                        </span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                            stroke-linecap="round" stroke-linejoin="round" class="shrink-0 transition-transform group-hover:translate-x-0.5">
                            <path d="M9 18l6-6-6-6" />
                        </svg>
                    </RouterLink>
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
                                    class="inline-flex justify-center rounded-xl border border-sky-200 dark:border-sky-500/30 bg-sky-50 dark:bg-sky-500/10 px-5 py-2 text-sm font-medium text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-500/20 focus:outline-none transition-colors press"
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
