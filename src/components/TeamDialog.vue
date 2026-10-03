<script setup>
import BannerModal from './BannerModal.vue'
import { ICONS } from '../utils/icons.js'
import { team, initials, AVATAR_GRADIENTS } from '../data/team.js'

defineProps(['open'])
const emit = defineEmits(['close'])

const LINKS = {
    instagram: { label: 'Instagram', icon: ICONS.instagram },
    linkedin: { label: 'LinkedIn', icon: ICONS.linkedin },
    website: { label: 'Website', icon: ICONS.globe },
}
</script>

<template>
    <BannerModal :open="open" @close="emit('close')" wide title="Tim di Balik Cuaca Dieng"
        subtitle="Yang merawat stasiun dan situs ini" :icon="ICONS.users">
        <ul class="grid gap-2 sm:grid-cols-3 sm:gap-3">
            <li v-for="(member, i) in team" :key="member.name" :style="{ animationDelay: `${120 + i * 60}ms` }"
                class="rise flex flex-col rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5 dark:shadow-none sm:items-center sm:text-center">

                <!-- Mobile: avatar beside the name. Desktop: stacked and centered. -->
                <div class="flex items-center gap-3 sm:flex-col">
                    <img v-if="member.photo" :src="member.photo" :alt="member.name" loading="lazy" width="64" height="64"
                        class="h-12 w-12 shrink-0 rounded-full object-cover bg-slate-100 dark:bg-white/10 sm:h-16 sm:w-16" />
                    <span v-else aria-hidden="true"
                        class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-display text-base font-bold text-white shadow-md shadow-sky-500/20 sm:h-16 sm:w-16 sm:text-xl"
                        :class="AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length]">
                        {{ initials(member.name) }}
                    </span>

                    <div class="min-w-0">
                        <p v-if="member.role" class="text-[10px] font-bold uppercase tracking-widest text-sky-500 dark:text-sky-400">
                            {{ member.role }}
                        </p>
                        <p class="mt-0.5 font-display text-base font-bold leading-tight text-slate-800 dark:text-slate-100">
                            {{ member.name }}
                        </p>
                    </div>
                </div>

                <p v-if="member.bio" class="mt-3 flex-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    {{ member.bio }}
                </p>

                <div class="mt-3 flex gap-1 border-t border-slate-100 pt-3 dark:border-white/10 sm:w-full sm:justify-center">
                    <a v-for="(url, kind) in member.links" :key="kind" :href="url" target="_blank" rel="noopener"
                        :aria-label="`${LINKS[kind].label} ${member.name}`" :title="LINKS[kind].label"
                        class="press flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-sky-50 hover:text-sky-500 dark:text-slate-500 dark:hover:bg-sky-500/10 dark:hover:text-sky-400">
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                            <path :d="LINKS[kind].icon" />
                        </svg>
                    </a>
                </div>
            </li>
        </ul>

        <!-- Contact strip, styled like the time strip on the main screen -->
        <a href="https://www.instagram.com/cuacadieng/" target="_blank" rel="noopener"
            class="rise interactive group mt-3 flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/5"
            :style="{ animationDelay: `${120 + team.length * 60}ms` }">
            <span class="flex flex-col">
                <span class="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">Punya masukan?</span>
                <span class="mt-0.5 text-sm font-semibold text-slate-700 dark:text-slate-200">Sapa kami di @cuacadieng</span>
            </span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                stroke-linecap="round" stroke-linejoin="round"
                class="shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 dark:text-slate-600">
                <path :d="ICONS.chevron" />
            </svg>
        </a>
    </BannerModal>
</template>
