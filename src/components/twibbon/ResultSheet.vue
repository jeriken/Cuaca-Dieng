<script setup>
import { computed } from 'vue'
import { TransitionRoot, TransitionChild, Dialog, DialogPanel, DialogTitle } from '@headlessui/vue'
import { BRAND_HANDLE, TREND_HASHTAG } from '../../twibbon/config.js'
import BadgeEmblem from './BadgeEmblem.vue'

const props = defineProps({
    open: { type: Boolean, default: false },
    // { url, file, transparent, achievement: { newBadge, newRecord, badge } }
    result: { type: Object, default: null },
    canShare: { type: Boolean, default: false },
    inAppBrowser: { type: String, default: null },
})
const emit = defineEmits(['close', 'share', 'download', 'copy-caption'])

const isTouch = typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches
const achievement = computed(() => props.result?.achievement)
</script>

<template>
    <TransitionRoot appear :show="open" as="template">
        <Dialog as="div" class="relative z-50" @close="emit('close')">
            <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0" enter-to="opacity-100"
                leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0">
                <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" />
            </TransitionChild>

            <div class="fixed inset-0 overflow-y-auto">
                <div class="flex min-h-full items-end sm:items-center justify-center sm:p-4">
                    <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0 translate-y-8 sm:translate-y-0 sm:scale-95"
                        enter-to="opacity-100 translate-y-0 sm:scale-100" leave="duration-200 ease-in"
                        leave-from="opacity-100 translate-y-0 sm:scale-100" leave-to="opacity-0 translate-y-8 sm:translate-y-0 sm:scale-95">
                        <DialogPanel class="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl bg-white dark:bg-[#162032] border border-slate-100 dark:border-white/10 shadow-2xl p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
                            <div class="flex items-start justify-between gap-3 mb-4">
                                <div>
                                    <DialogTitle class="text-lg font-semibold text-slate-800 dark:text-slate-100">Twibbon siap!</DialogTitle>
                                    <p class="text-sm text-slate-500 dark:text-slate-400">
                                        Unggah ke story atau feed, lalu tag {{ BRAND_HANDLE }}.
                                    </p>
                                </div>
                                <button type="button" class="w-9 h-9 shrink-0 rounded-xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                                    aria-label="Tutup" @click="emit('close')">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" class="stroke-slate-500" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                                </button>
                            </div>

                            <div v-if="achievement?.newBadge || achievement?.newRecord"
                                class="flex items-center gap-3 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 px-3 py-2.5 mb-4">
                                <BadgeEmblem v-if="achievement.badge" :badge="achievement.badge" :size="40" />
                                <div class="text-sm leading-snug">
                                    <p v-if="achievement.newBadge" class="font-semibold text-amber-800 dark:text-amber-300">
                                        Lencana baru: {{ achievement.badge.name }}!
                                    </p>
                                    <p v-if="achievement.newRecord" class="text-amber-700 dark:text-amber-400/90">
                                        Ini suhu terdingin yang pernah kamu abadikan.
                                    </p>
                                </div>
                            </div>

                            <div class="rounded-2xl overflow-hidden flex justify-center bg-slate-100 dark:bg-black/30"
                                :class="result?.transparent ? 'result-checker' : ''">
                                <img v-if="result" :src="result.url" alt="Twibbon hasil" class="max-h-[46vh] w-auto object-contain" />
                            </div>
                            <p v-if="isTouch || inAppBrowser" class="mt-2 text-xs text-center text-slate-500 dark:text-slate-400">
                                Tombol simpan tidak bekerja? Tekan lama gambar di atas, lalu pilih simpan.
                            </p>

                            <div class="grid gap-2 mt-4" :class="canShare ? 'grid-cols-2' : 'grid-cols-1'">
                                <button v-if="canShare" type="button"
                                    class="rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-sm py-3 transition-colors"
                                    @click="emit('share')">
                                    Bagikan
                                </button>
                                <button type="button"
                                    :class="canShare
                                        ? 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/15'
                                        : 'bg-sky-500 hover:bg-sky-600 text-white'"
                                    class="rounded-xl font-semibold text-sm py-3 transition-colors"
                                    @click="emit('download')">
                                    {{ result?.downloaded ? 'Unduh lagi' : 'Unduh gambar' }}
                                </button>
                            </div>
                            <button type="button"
                                class="w-full mt-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 font-semibold text-sm py-3 transition-colors"
                                @click="emit('copy-caption')">
                                Salin caption {{ TREND_HASHTAG }}
                            </button>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </div>
        </Dialog>
    </TransitionRoot>
</template>

<style scoped>
.result-checker {
    background: repeating-conic-gradient(#334155 0 25%, #1e293b 0 50%) 0 0 / 20px 20px;
}
</style>
