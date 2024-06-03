<template>
    <!-- Header -->
    <div class="flex justify-between m-4">
        <button class="p-2">
            <svg fill="#000000" width="40px" height="40px" viewBox="0 0 24 24" id="menu" data-name="Flat Line"
                xmlns="http://www.w3.org/2000/svg" class="icon flat-line">
                <path id="primary" d="M3,12H21M9,18H21M3,6H15"
                    style="fill: none; stroke: rgb(0, 0, 0); stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;">
                </path>
            </svg>
        </button>
        <h1 class="my-4">Dieng Kulon</h1>
        <button class="p-2">
            <img class="w-7 h-7" src="/icon/tips.svg" />
        </button>
    </div>

    <!-- Main -->
    <div class="flex justify-center md:mt-28">
        <img class="w-60" src="/img/summertime.png" />
    </div>
    <div class="flex justify-center">
        <h1 class="text-gray-800 font-serif font-semibold tracking-tighter text-9xl">19</h1>
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
</template>