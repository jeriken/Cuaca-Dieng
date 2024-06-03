<template>
    <!-- Header -->
    <div class="flex justify-between m-4">
        <div class="p-2">
            <Popover v-slot="{ open }" class="relative">
                <PopoverButton>
                    <span>
                        <svg fill="#000000" width="40px" height="40px" viewBox="0 0 24 24" id="menu" data-name="Flat Line"
                            xmlns="http://www.w3.org/2000/svg" class="icon flat-line">
                            <path id="primary" d="M3,12H21M9,18H21M3,6H15"
                                style="fill: none; stroke: rgb(0, 0, 0); stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;">
                            </path>
                        </svg>
                    </span>
                </PopoverButton>

                <transition enter-active-class="transition duration-200 ease-out" enter-from-class="translate-y-1 opacity-0"
                    enter-to-class="translate-y-0 opacity-100" leave-active-class="transition duration-150 ease-in"
                    leave-from-class="translate-y-0 opacity-100" leave-to-class="translate-y-1 opacity-0">
                    <PopoverPanel class="absolute left-1/2 z-10 mt-3 w-64 max-w-sm transform px-4 sm:px-0 lg:max-w-3xl">
                        <div class="overflow-hidden rounded-lg shadow-lg ring-1 ring-black/5">
                            <div class="relative grid gap-8 bg-white p-4">
                                <a v-for="item in solutions" :key="item.name" :href="item.href"
                                    class="-m-3 flex items-center rounded-lg p-2 transition duration-150 ease-in-out hover:bg-gray-50 focus:outline-none focus-visible:ring focus-visible:ring-orange-500/50">
                                    <div class="ml-4">
                                        <p class="text-sm font-medium text-gray-900">
                                            {{ item.name }}
                                        </p>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </PopoverPanel>
                </transition>
            </Popover>
        </div>
        <h1 class="my-4">Dieng Kulon</h1>
        <button class="p-2" @click="setIsOpenPopup(true)">
            <img class="w-7 h-7" src="/icon/tips.svg" />
        </button>
    </div>

    <!-- Main -->
    <div class="flex justify-center md:mt-28">
        <img class="w-60" src="/img/summertime.png" />
    </div>
    <div class="flex justify-center">
        <h1 class="text-gray-800 font-semibold tracking-tighter text-9xl">19</h1>
        <i class="text-gray-800 text-7xl">°</i>
    </div>
    <h2 class="flex justify-center font-serif text-gray-400 text-2xl mt-1">Berawan</h2>

    <!-- Footer -->
    <div class="flex justify-center gap-4 justify-center mt-8 mb-4">
        <div class="text-center border rounded-xl shadow-xl px-4 py-2">
            <div class="flex justify-center items-center py-1">
                <img class="w-6 h-6" src="/img/compressor.png" />
            </div>
            <p class="text-sm font-semibold">798.3 mBar</p>
            <p class="text-xs text-gray-400">Tekanan Udara</p>
        </div>
        <div class="text-center border rounded-xl shadow-xl px-4 py-2">
            <div class="flex justify-center py-1">
                <img class="w-6 h-6" src="/img/temperature.png" />
            </div>
            <p class="text-sm font-semibold">13°</p>
            <p class="text-xs text-gray-400">Real Feel</p>
        </div>
        <div class="text-center border rounded-xl shadow-xl px-4 py-2">
            <div class="flex justify-center items-center py-1">
                <img class="w-6 h-6" src="/img/humidity.png" />
            </div>
            <p class="text-sm font-semibold">95.84%</p>
            <p class="text-xs text-gray-400">Kelembapan</p>
        </div>
    </div>

    <div class="flex justify-start gap-4 border rounded-xl shadow-xl m-8 p-4">
        <div class="flex justify-center items-center">
            <img class="w-11 h-10" src="/icon/alarm.png" />
        </div>
        <div>
            <h1 class="font-serif text-gray-800">Install Aplikasi</h1>
            <h3 class="text-sm font-serif text-gray-600">Dapatkan informasi embun es dieng</h3>
        </div>
    </div>

    <!-- Tips Popup-->
    <TransitionRoot appear :show="isOpenPopup" as="template">
        <Dialog as="div" @close="setIsOpenPopup(false)" class="relative z-10">
            <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0" enter-to="opacity-100"
                leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0">
                <div class="fixed inset-0 bg-black/25" />
            </TransitionChild>

            <div class="fixed inset-0 overflow-y-auto">
                <div class="flex min-h-full items-center justify-center p-4 text-center">
                    <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0 scale-95"
                        enter-to="opacity-100 scale-100" leave="duration-200 ease-in" leave-from="opacity-100 scale-100"
                        leave-to="opacity-0 scale-95">
                        <DialogPanel
                            class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                            <DialogTitle as="h1" class="text-xl font-medium leading-6 text-gray-900">
                                Tips Prediksi Embun Es
                            </DialogTitle>
                            <div class="mt-4">
                                <p class="text-gray-500">
                                    Embun es di predisi akan muncul besok harinya jika saat pukul 22.00 suhu sudah dibawah
                                    6° C
                                </p>
                            </div>

                            <div class="mt-4">
                                <button type="button"
                                    class="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                    @click="setIsOpenPopup(false)">
                                    Sudah paham
                                </button>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </div>
        </Dialog>
    </TransitionRoot>
</template>

<script setup>
import { ref } from "vue";
import {
    TransitionRoot,
    TransitionChild,
    Dialog,
    DialogPanel,
    DialogTitle,
    Popover, PopoverButton, PopoverPanel
} from '@headlessui/vue'

const isOpenPopup = ref(false)
const solutions = [
    {
        name: 'Home',
        description: 'Measure actions your users take',
        href: '##',
        icon: '/img/compressor.png',
    },
    {
        name: 'Suhu',
        description: 'Measure actions your users take',
        href: '##',
        icon: '/img/compressor.png',
    },
    {
        name: 'Kelembapan',
        description: 'Create your own targeted content',
        href: '##',
        icon: '/img/compressor.png'
    },
    {
        name: 'Tekanan Udara',
        description: 'Keep track of your growth',
        href: '##',
        icon: '/img/compressor.png'
    },
]

function setIsOpenPopup(value) {
    isOpenPopup.value = value
}
</script>
