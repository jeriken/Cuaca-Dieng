<script setup>
import { TransitionRoot, TransitionChild, Dialog, DialogPanel, DialogTitle } from '@headlessui/vue'
import { ICONS } from '../utils/icons.js'

// Shared popup shell: a gradient banner whose bottom edge is a mountain ridge,
// over a plain body. Used by the Tips and Team popups.
defineProps({
    open: Boolean,
    title: String,
    subtitle: String,
    icon: String,
    // Tailwind gradient stops for the banner
    banner: { type: String, default: 'from-sky-500 to-indigo-500' },
    // Wider panel from the sm breakpoint up, for multi-column content
    wide: Boolean,
})
const emit = defineEmits(['close'])
</script>

<template>
    <TransitionRoot appear :show="open" as="template">
        <Dialog as="div" @close="emit('close')" class="relative z-30">
            <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0"
                enter-to="opacity-100" leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0">
                <div class="fixed inset-0 bg-slate-900/30 dark:bg-black/50 backdrop-blur-sm" />
            </TransitionChild>

            <div class="fixed inset-0 overflow-y-auto">
                <div class="flex min-h-full items-center justify-center p-4">
                    <TransitionChild as="template" enter="duration-300 ease-out"
                        enter-from="opacity-0 scale-95 translate-y-2" enter-to="opacity-100 scale-100 translate-y-0"
                        leave="duration-200 ease-in" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95">
                        <DialogPanel :class="wide ? 'max-w-sm sm:max-w-2xl' : 'max-w-sm'"
                            class="w-full overflow-hidden rounded-3xl bg-white dark:bg-[#162032] border border-slate-100 dark:border-white/10 shadow-2xl transition-all">

                            <!-- Banner -->
                            <div class="relative overflow-hidden px-6 pt-6 pb-12 bg-gradient-to-br text-white" :class="banner">
                                <span class="absolute -top-12 -right-10 w-40 h-40 rounded-full bg-white/10" aria-hidden="true"></span>
                                <span class="absolute top-10 -left-8 w-20 h-20 rounded-full bg-white/10" aria-hidden="true"></span>

                                <div class="relative flex items-start justify-between">
                                    <span class="w-11 h-11 rounded-2xl bg-white/20 ring-1 ring-white/30 flex items-center justify-center">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                            stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                                            <path :d="icon" />
                                        </svg>
                                    </span>
                                    <button type="button" @click="emit('close')" aria-label="Tutup"
                                        class="press w-9 h-9 -mr-2 -mt-1 rounded-xl flex items-center justify-center bg-white/15 hover:bg-white/25 transition-colors focus-visible:ring-white/70 focus-visible:ring-offset-0">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                            stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5">
                                            <path :d="ICONS.close" />
                                        </svg>
                                    </button>
                                </div>
                                <DialogTitle as="h2" class="relative mt-4 font-display text-xl font-bold leading-tight">
                                    {{ title }}
                                </DialogTitle>
                                <p v-if="subtitle" class="relative mt-1 text-xs text-white/80">{{ subtitle }}</p>

                                <!-- Ridge line: a faint far range, then the near one in the panel's own color -->
                                <svg class="absolute inset-x-0 -bottom-px w-full h-9" viewBox="0 0 400 40" preserveAspectRatio="none" aria-hidden="true">
                                    <path class="fill-white/15"
                                        d="M0 40V20C30 16 55 4 90 6s45 14 75 12 50-16 85-14 45 14 75 12 50-10 75-8v32z" />
                                    <path class="fill-white dark:fill-[#162032]"
                                        d="M0 40V30C40 28 60 16 95 18s45 10 75 8 55-20 90-18 40 14 70 14 50-8 70-6v24z" />
                                </svg>
                            </div>

                            <div class="px-4 pb-4 sm:px-5 sm:pb-5">
                                <slot />
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </div>
        </Dialog>
    </TransitionRoot>
</template>
