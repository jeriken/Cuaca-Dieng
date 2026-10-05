<script setup>
import { computed } from 'vue'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'
import { RouterLink, useRoute } from 'vue-router'
import { useInstallPrompt } from '../composables/useInstallPrompt.js'
import { ICONS } from '../utils/icons.js'
import { team, AVATAR_GRADIENTS } from '../data/team.js'

const emit = defineEmits(['tips', 'team'])

const route = useRoute()
const { canInstall, install } = useInstallPrompt()

// The app's own pages and features
const appLinks = computed(() => [
    { key: 'home', label: 'Beranda', to: '/', icon: ICONS.home, onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
    { key: 'twibbon', label: 'Foto Suhu', to: '/foto-suhu', icon: ICONS.camera, isNew: true },
    { key: 'tips', label: 'Tips Embun Es', icon: ICONS.bulb, onClick: () => emit('tips') },
    // Only offered when the browser has handed us an install prompt
    canInstall.value && { key: 'install', label: 'Install Aplikasi', icon: ICONS.install, onClick: install },
].filter(Boolean))

const socialLinks = [
    { label: 'Bot Telegram', href: 'https://t.me/CuacaDieng_Bot', icon: ICONS.telegram, hover: 'group-hover:text-sky-500' },
    { label: 'Instagram', href: 'https://www.instagram.com/cuacadieng/', icon: ICONS.instagram, hover: 'group-hover:text-pink-500' },
    { label: 'Twitter / X', href: 'https://x.com/CuacaDieng', icon: ICONS.x, filled: true, hover: 'group-hover:text-slate-900 dark:group-hover:text-white' },
]
</script>

<template>
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
            enter-from-class="-translate-y-1 scale-95 opacity-0" enter-to-class="translate-y-0 scale-100 opacity-100"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="translate-y-0 scale-100 opacity-100" leave-to-class="-translate-y-1 scale-95 opacity-0">
            <PopoverPanel class="absolute left-0 top-full z-20 mt-2 w-64 origin-top-left">
                <div class="rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#162032]">

                    <!-- App -->
                    <div class="p-2">
                        <p class="px-3 pt-1 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">Aplikasi</p>
                        <component v-for="item in appLinks" :key="item.key"
                            :is="item.to ? RouterLink : 'button'"
                            v-bind="item.to ? { to: item.to } : { type: 'button' }"
                            :aria-current="route.path === item.to ? 'page' : undefined"
                            @click="item.onClick?.(); close()"
                            class="press group w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-colors"
                            :class="route.path === item.to ? 'bg-sky-50 dark:bg-sky-500/10' : 'hover:bg-slate-50 dark:hover:bg-white/10'">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                class="shrink-0 transition-colors"
                                :class="route.path === item.to ? 'text-sky-500 dark:text-sky-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'">
                                <path :d="item.icon" />
                            </svg>
                            <span class="text-sm font-medium transition-colors"
                                :class="route.path === item.to
                                    ? 'text-sky-700 dark:text-sky-300'
                                    : 'text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100'">
                                {{ item.label }}
                            </span>
                            <span v-if="item.isNew"
                                class="ml-auto text-[10px] font-bold uppercase tracking-wide bg-amber-400 text-slate-900 px-1.5 py-0.5 rounded-md">
                                Baru
                            </span>
                        </component>
                    </div>

                    <div class="h-px mx-3 bg-slate-100 dark:bg-white/10"></div>

                    <!-- Follow -->
                    <div class="p-2">
                        <p class="px-3 pt-1 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">Ikuti Kami</p>
                        <div class="grid grid-cols-3 gap-1">
                            <a v-for="item in socialLinks" :key="item.label" :href="item.href" target="_blank" rel="noopener"
                                @click="close()"
                                class="press group flex flex-col items-center gap-1.5 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/10 transition-colors">
                                <svg width="16" height="16" viewBox="0 0 24 24"
                                    class="text-slate-400 dark:text-slate-500 transition-colors" :class="item.hover"
                                    v-bind="item.filled
                                        ? { fill: 'currentColor' }
                                        : { fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }">
                                    <path :d="item.icon" />
                                </svg>
                                <span class="text-[10px] font-medium text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">
                                    {{ item.label }}
                                </span>
                            </a>
                        </div>
                    </div>

                    <!-- Team: opens its own popup -->
                    <div class="p-2 bg-slate-50/70 dark:bg-white/[0.03] border-t border-slate-100 dark:border-white/10">
                        <button type="button" @click="emit('team'); close()"
                            class="press group w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white dark:hover:bg-white/10 transition-colors text-left">
                            <span class="flex -space-x-1.5 shrink-0" aria-hidden="true">
                                <template v-for="(member, i) in team" :key="member.name">
                                    <img v-if="member.photo" :src="member.photo" alt="" loading="lazy" width="24" height="24"
                                        class="w-6 h-6 rounded-full object-cover ring-2 ring-white dark:ring-[#162032]" />
                                    <span v-else
                                        class="w-6 h-6 rounded-full bg-gradient-to-br ring-2 ring-white dark:ring-[#162032] flex items-center justify-center text-[10px] font-bold text-white"
                                        :class="AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length]">
                                        {{ member.name[0] }}
                                    </span>
                                </template>
                            </span>
                            <span class="flex-1 text-sm font-medium text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">
                                Tim Kami
                            </span>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                                stroke-linecap="round" stroke-linejoin="round"
                                class="shrink-0 text-slate-300 dark:text-slate-600 transition-transform group-hover:translate-x-0.5">
                                <path :d="ICONS.chevron" />
                            </svg>
                        </button>
                    </div>
                </div>
            </PopoverPanel>
        </transition>
    </Popover>
</template>
