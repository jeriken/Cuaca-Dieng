<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

// The site's signature sun-and-clouds, redrawn as vector art so it stays sharp
// and can react to the sky: the sun sinks behind the clouds as it gets
// cloudier, and rain falls from them when the station reports Hujan.
const props = defineProps({
    kondisi: { type: String, default: 'Cerah' },
})

const MOODS = {
    'Cerah': 'cerah',
    'Cerah Berawan': 'cerah',
    'Berawan': 'berawan',
    'Hujan': 'hujan',
    'Hujan Lebat': 'lebat',
}
const mood = computed(() => MOODS[props.kondisi] ?? 'cerah')

// The idle animations loop forever — pause them while scrolled out of view
const root = ref(null)
const inView = ref(true)
let observer = null
onMounted(() => {
    if (typeof IntersectionObserver === 'undefined') return
    observer = new IntersectionObserver(([entry]) => { inView.value = entry.isIntersecting })
    observer.observe(root.value)
})
onUnmounted(() => observer?.disconnect())
</script>

<template>
    <svg viewBox="0 0 512 400" ref="root" class="wx" :class="[`is-${mood}`, { paused: !inView }]" aria-hidden="true">
        <defs>
            <clipPath id="wx-disc"><circle cx="253.2" cy="190.8" r="104.6" /></clipPath>
            <!-- The sun sets into the clouds, never below them -->
            <clipPath id="wx-horizon"><rect x="-64" y="-64" width="640" height="366" /></clipPath>
            <radialGradient id="wx-glow">
                <stop offset="0" stop-color="#ffca28" stop-opacity=".6" />
                <stop offset=".55" stop-color="#ffca28" stop-opacity=".18" />
                <stop offset="1" stop-color="#ffca28" stop-opacity="0" />
            </radialGradient>
        </defs>

        <!-- Sun: glow, rays and a three-tone disc. Separate wrappers so the mood
             transition, entrance and idle bob never fight over one transform. -->
        <g clip-path="url(#wx-horizon)">
            <g class="sun-pos">
                <g class="sun-enter">
                    <g class="sun-bob">
                        <g class="glow"><circle class="glow-pulse" cx="253.2" cy="190.8" r="170" fill="url(#wx-glow)" /></g>
                        <g class="rays">
                            <g class="rays-sway" stroke-width="13.4" stroke-linecap="round">
                                <line class="ray" x1="112.9" y1="198.2" x2="78.9" y2="195.1" style="--i: 0" />
                                <line class="ray" x1="153.5" y1="110" x2="110.6" y2="67.1" style="--i: 1" />
                                <line class="ray" x1="244.2" y1="63.3" x2="242.5" y2="32.4" style="--i: 2" />
                                <line class="ray" x1="347.5" y1="98.9" x2="393.3" y2="55.8" style="--i: 3" />
                                <line class="ray" x1="377.1" y1="192.1" x2="404.1" y2="191.9" style="--i: 4" />
                            </g>
                        </g>
                        <circle class="sun-mid" cx="253.2" cy="190.8" r="104.6" />
                        <g clip-path="url(#wx-disc)">
                            <path class="sun-low" d="M142.1 181.7c1.1-.6 4-.7 5.4-.6c1.4 0 .8-1.4 3.1.9c2.2 2.3 6.5 9.3 10.1 12.8c3.7 3.5 8.4 6.3 11.8 8.2c3.5 1.9 3.9 1.9 8.9 3.1c5 1.2 16.5 3 21 4.1c4.4 1 4 1.4 5.7 2.2c1.6.9 2.8 1.7 4.1 2.9c1.3 1.2 2.6 2.6 3.6 4.4c1.1 1.8 1.7 1.5 2.8 6.2c1.1 4.8 2.7 17.2 3.8 22.3c1.1 5 1.5 5.6 2.8 8.1c1.4 2.4 3.7 5.3 5.2 6.8c1.5 1.5 2.5 1.8 3.7 2.3c1.2.5 2.1.8 3.4.8c1.3 0 2 .2 4.5-.7c2.4-1 6-2.2 10-5c4-2.8 10.1-9.4 13.9-12.1c3.8-2.6 5.9-3.4 8.9-4c3-.6 3.8-1 8.9.3c5.1 1.3 17.2 6.3 21.7 7.6c4.5 1.2 3.5.3 5.4.1c1.8-.3 3.8-.9 5.4-1.7c1.6-.7 2.8-1.5 4.3-2.7c1.4-1.3 1.3-.1 4.4-4.6c3.1-4.6 10.2-17.3 14.1-22.9c3.9-5.6 7.1-8.1 9.5-10.5c2.5-2.4 3.7-3.1 5.1-3.9c1.3-.8 1.3-.9 2.9-1c1.7-.1 5.4.1 6.7.3c1.3.1.8.3 1 .7c.2.5 1.1-1.8.2 1.9c-.8 3.8-3 14.5-5.2 20.7c-2.1 6.2-4.9 11.9-7.4 16.6c-2.5 4.7-4.8 7.9-7.4 11.6c-2.7 3.7-4.9 6.8-8.5 10.5c-3.5 3.8-7.7 8-13 12c-5.4 4-12.3 8.7-18.9 12.1c-6.7 3.3-14.4 6.1-21 8c-6.6 1.9-11.5 2.9-18.5 3.4c-7.1.6-16.4.7-23.9-.1c-7.5-.8-14.4-2.3-21.3-4.6c-7-2.2-13.8-5.2-20.3-8.7c-6.4-3.6-13.1-8.2-18.4-12.6c-5.4-4.3-9.3-8.3-13.5-13.5c-4.3-5.2-8.8-11.6-12.2-17.8c-3.5-6.2-6.6-14.3-8.6-19.4c-1.9-5.1-2.1-6.8-3-11c-.9-4.1-1.8-8.6-2.2-13.7c-.4-5.2-.2-13.7 0-17c.1-3.3 0-2.3 1-2.8z" />
                            <path class="sun-top" d="M246 78.5c5.4-.6 7.7-.7 12.5-.4c4.7.3 9.4.6 15.9 2.1c6.5 1.5 16.2 4.2 22.9 7c6.8 2.7 12.6 6.3 17.6 9.4c5 3.2 8.8 6.2 12.5 9.5c3.8 3.2 7.2 6.8 10.1 9.9c2.8 3.2 5.8 7.2 6.9 9.1c1.1 1.9 1 1.9-.3 2.4c-1.3.5-5.9.5-7.4.7c-1.6.3-.8-.9-2 1c-1.2 2-4.1 7.9-5.1 10.9c-1.1 2.9-1 4.4-1.1 6.7c-.1 2.2-.9 1.5.3 6.7c1.2 5.2 5.6 18.7 6.8 24.4c1.1 5.6.5 6.9.3 9.6c-.2 2.6-.8 4.3-1.5 6.4c-.8 2.1-1.7 4.1-3 6c-1.3 1.9-2.9 3.8-4.6 5.4c-1.7 1.6-3.6 3.1-5.7 4.3c-2.1 1.2-4.5 2.3-7 3c-2.4.7-5.1 1.2-7.6 1.3c-2.5.2-4.9 0-7.4-.5c-2.5-.5-5.4-1.5-7.5-2.5c-2.2-1-3.8-2.2-5.5-3.5c-1.6-1.4-1.9-.9-4.4-4.6c-2.5-3.7-7.5-14-10.4-17.6c-2.9-3.6-4.9-3.3-6.9-4.1c-2-.8-3.1-.7-4.8-.7c-1.8.1-.7-1.1-5.9.9c-5.1 2-19.9 8.9-25 10.9c-5.1 2-3.5 1.1-5.5 1.3c-2.1.3-4.3.4-6.6.2c-2.3-.2-4.8-.7-7.2-1.6c-2.4-.9-4.9-2.3-7.1-3.9c-2.2-1.6-4.2-3.5-6.2-5.8c-2-2.4-3.4-3.6-5.7-8.3c-2.4-4.6-5.8-11.5-8.4-19.6c-2.6-8.1-5.7-23.8-7.1-28.8c-1.5-5 0-1-1.7-1.4c-1.6-.4-6.7-.3-8.1-.9c-1.3-.6-1.1-.7.1-2.6c1.3-1.9 4.4-5.8 7.3-8.8c2.9-2.9 5.5-5.5 10.1-8.9c4.6-3.5 11.7-8.5 17.4-11.6c5.7-3.1 12.4-5.6 16.8-7.2c4.3-1.7 4.3-1.8 9.2-2.8c4.9-.9 14.6-2.4 20-3z" />
                        </g>
                        <ellipse class="sun-mid" cx="256.9" cy="129.1" rx="7.1" ry="4.9" transform="rotate(83 256.9 129.1)" />
                        <ellipse class="sun-mid" cx="260.3" cy="155.5" rx="10.6" ry="7.5" transform="rotate(78 260.3 155.5)" />
                    </g>
                </g>
            </g>
        </g>

        <!-- Small cloud (back) -->
        <g class="cloud-l">
            <g class="cloud-l-enter">
                <g class="drift-l">
                    <g class="rain">
                        <line class="drop" x1="74" y1="298" x2="71" y2="314" style="--d: 0s" />
                        <line class="drop" x1="108" y1="298" x2="105" y2="314" style="--d: -0.62s" />
                        <line class="drop" x1="142" y1="298" x2="139" y2="314" style="--d: -0.25s" />
                        <line class="drop" x1="176" y1="298" x2="173" y2="314" style="--d: -0.9s" />
                        <line class="drop" x1="206" y1="298" x2="203" y2="314" style="--d: -0.45s" />
                        <line class="drop heavy" x1="91" y1="298" x2="88" y2="314" style="--d: -0.1s" />
                        <line class="drop heavy" x1="125" y1="298" x2="122" y2="314" style="--d: -0.75s" />
                        <line class="drop heavy" x1="159" y1="298" x2="156" y2="314" style="--d: -0.4s" />
                        <line class="drop heavy" x1="192" y1="298" x2="189" y2="314" style="--d: -0.15s" />
                    </g>
                    <path class="shade" d="M164 219.5c3.5-.1 8.1.1 11.5.5c3.3.5 5.9 1.3 8.6 2.4c2.8 1.1 5.5 2.5 7.8 4.2c2.3 1.7 4.5 4.2 6 6c1.5 1.9 2.1 3.4 2.9 5.1c.8 1.7 1.3 2.7 1.7 5.3c.3 2.6.7 7.2.3 10.5c-.5 3.2-1.4 5.9-2.9 8.9c-1.5 3-6.8 7.5-6.2 8.9c.6 1.3 7.2-.8 9.8-.8c2.6 0 3.9.2 5.9.7c1.9.5 4 1.3 5.7 2.2c1.7.9 3.2 2.1 4.6 3.4c1.3 1.4 2.4 2.9 3.3 4.7c.8 1.8 1.4 4.4 1.6 6.1c.2 1.7.3 2.1-.4 4.1c-.6 2.1-3 6.7-3.5 8.1c-.5 1.5-.6.4.4.9c1 .4.7 1.2 5.6 1.9c4.9.7 19.1 1.7 23.8 2.3c4.7.7 3.5 1.3 4.3 1.8c.8.4.6.5.5.8c0 .4 1 .7-.9 1.3c-2 .7-5.8 2-10.6 2.6c-4.8.6 11.1 1-18.3 1.2c-29.4.2-128.7.3-158 .1c-29.3-.1-13.4-.6-17.7-1.1c-4.4-.5-6.2-1.1-8.2-1.7c-2-.6-3.2-1.4-3.9-2.1c-.7-.6-.6-1.3-.3-2c.3-.6-.5-.9 2.1-1.8c2.7-.8 10.6-.8 13.6-3.3c3-2.5 3.3-9.1 4.6-11.5c1.2-2.5 1.7-2.2 2.9-3.1c1.3-.9 2.8-1.9 4.5-2.5c1.7-.6 3.7-1.1 5.5-1.3c1.8-.1 1.6-.7 5.3.3c3.6 1 14.4 6.8 16.4 5.7c1.9-1.1-3.9-8.9-4.8-12.2c-1-3.3-1-5-.9-7.6c.1-2.6.6-5.4 1.6-7.8c1-2.3 2.6-4.8 4.5-6.5c1.9-1.7 4.5-3.3 7-3.9c2.6-.6 5.6-.5 8.3.2c2.6.8 5.1 2.1 7.8 4.2c2.7 2.1 7.2 8.6 8.5 8.4c1.4-.1-.4-6.9-.3-9.6c.2-2.7.5-4.5 1.2-6.8c.7-2.3 1.7-4.8 2.9-7.1c1.3-2.2 2.9-4.4 4.7-6.3c1.7-2 3.6-3.6 5.8-5.2c2.3-1.5 5.1-3.1 7.7-4.3c2.7-1.2 5.3-2.1 8.2-2.8c3-.7 6-1.3 9.5-1.5z" />
                    <path class="puff" d="M164 219.5c3.5-.1 8 0 11.5.6c3.4.5 6.4 1.4 9.3 2.6c2.9 1.2 5.8 2.9 8.2 4.8c2.4 2 4.4 4.1 6.1 6.9c1.6 2.9 3.1 6.9 3.7 10.2c.5 3.4.3 7-.5 10.1c-.8 3.1-2.1 5.7-4.3 8.7c-2.3 3.1-7.7 7.2-9.4 9.7c-1.8 2.4-1.3 3.9-1.2 5.1c0 1.3.9 1.7 1.6 2.3c.7.6-.5 1.2 2.8 1.1c3.2-.1 13.3-1.4 16.7-1.5c3.3-.2 2.4.2 3.4.5c.9.4 1.4.5 2.3 1.7c.9 1.3 2.4 3.7 3.2 5.9c.7 2.1 1.1 5.1 1.2 7.2c0 2.1-.5 3.8-1.2 5.5c-.7 1.7-2.1 3.6-3.3 4.7c-1.2 1.1-2.4 1.8-3.9 2c-1.5.3-1.2 1.6-5-.3c-3.9-1.8-14-8.7-18.1-10.9c-4.1-2.2-4.2-1.6-6.8-2.1c-2.6-.6-5.9-1.1-8.8-1.2c-2.9-.2-5.7-.1-8.9.2c-3.1.3-2.5-.3-10.1 1.7c-7.5 2.1-26.6 8.4-35.3 10.7c-8.7 2.3-12.6 2.5-16.7 3c-4.2.5-5.1.3-7.9 0c-2.8-.3-6.6-.9-9.2-1.6c-2.6-.7-4.6-1.6-6.4-2.6c-1.8-1-3.3-2.1-4.5-3.5c-1.2-1.4-2.4-3.5-2.9-5c-.6-1.6-.7-3.1-.6-4.5c.1-1.4.3-2.7 1.1-3.9c.7-1.3 2.4-2.8 3.5-3.6c1-.7 2-.8 2.9-.9c1-.2.1-.6 2.7.2c2.7.9 11.9 5.8 13.3 4.8c1.4-1.1-3.8-8-4.8-11.3c-1-3.2-1.2-5.5-1.1-8.3c.1-2.8.8-6 1.9-8.5c1.1-2.4 2.9-4.6 4.7-6.3c1.9-1.6 4.1-2.9 6.5-3.4c2.5-.5 5.6-.5 8.3.2c2.6.8 5.1 2.1 7.8 4.2c2.7 2.1 7.2 8.6 8.5 8.5c1.4-.2-.4-7-.3-9.7c.2-2.7.5-4.5 1.2-6.8c.7-2.3 1.7-4.8 2.9-7.1c1.3-2.2 2.9-4.4 4.7-6.3c1.7-2 3.6-3.6 5.8-5.2c2.3-1.5 5.1-3.1 7.7-4.3c2.7-1.2 5.3-2.1 8.2-2.8c3-.7 6-1.3 9.5-1.5z" />
                    <ellipse class="shade" cx="129.8" cy="273.6" rx="4" ry="2.8" transform="rotate(72 129.8 273.6)" />
                    <ellipse class="shade" cx="133.5" cy="283.5" rx="2.7" ry="1.5" transform="rotate(75 133.5 283.5)" />
                </g>
            </g>
        </g>

        <!-- Big cloud (front) -->
        <g class="cloud-r">
            <g class="cloud-r-enter">
                <g class="drift-r">
                    <g class="rain">
                        <line class="drop" x1="238" y1="352" x2="235" y2="368" style="--d: -0.3s" />
                        <line class="drop" x1="282" y1="352" x2="279" y2="368" style="--d: -0.85s" />
                        <line class="drop" x1="324" y1="352" x2="321" y2="368" style="--d: -0.1s" />
                        <line class="drop" x1="366" y1="352" x2="363" y2="368" style="--d: -0.6s" />
                        <line class="drop" x1="408" y1="352" x2="405" y2="368" style="--d: -0.35s" />
                        <line class="drop" x1="446" y1="352" x2="443" y2="368" style="--d: -0.95s" />
                        <line class="drop heavy" x1="260" y1="352" x2="257" y2="368" style="--d: -0.5s" />
                        <line class="drop heavy" x1="303" y1="352" x2="300" y2="368" style="--d: -0.2s" />
                        <line class="drop heavy" x1="345" y1="352" x2="342" y2="368" style="--d: -0.7s" />
                        <line class="drop heavy" x1="387" y1="352" x2="384" y2="368" style="--d: -0.05s" />
                        <line class="drop heavy" x1="427" y1="352" x2="424" y2="368" style="--d: -0.55s" />
                    </g>
                    <path class="ground" d="M374.1 216.6c3.8-.6 9.3-1 13.4-.7c4.1.2 7.6.8 11 2.1c3.5 1.2 7.1 3.1 9.8 5.2c2.8 2 5 4.9 6.7 7.3c1.7 2.5 2.7 4.8 3.7 7.3c.9 2.5 1.6 5 2.1 7.8c.5 2.8.8 5.9.8 8.9c0 3 .2 4.6-.8 8.9c-1 4.3-2.3 10.1-5.2 16.7c-2.8 6.7-10.2 19.2-11.9 23.1c-1.8 3.9-.8.8 1.5.4c2.3-.4 8.1-2.2 12.3-2.6c4.2-.3 8.3-.4 12.7.4c4.4.8 9.5 2.3 13.6 4.3c4.2 2 8.5 4.9 11.5 7.5c3 2.7 5 5.4 6.5 8.5c1.6 3 2.8 6.8 2.9 9.8c0 3-.8 5.6-2.5 8.2c-1.7 2.6-7.1 5.3-7.5 7.3c-.4 2 3.8 2.9 5.1 4.7c1.4 1.8.8 4.5 3.1 6c2.3 1.6 8.7 2.4 10.7 3.3c2 .8 1.2 1 1.3 1.6c0 .6 1 1.1-.8 2c-1.8.8-6.1 2.2-10 2.9c-4 .7 29.2 1.1-13.6 1.3c-42.8.2-199.7.2-243 0c-43.3-.2-12.6-.6-16.8-1.1c-4.1-.6-6.2-1.3-8-1.9c-1.9-.6-2.6-1.2-3.2-1.9c-.5-.6-.3-1.4-.1-2c.3-.5-.6-.5 1.7-1.3c2.3-.8 10.6-1.4 12.2-3.3c1.6-1.9-2.4-5.6-2.9-8.2c-.4-2.6-.6-4.7-.1-7.4c.5-2.7 1.8-6.2 3.2-8.7c1.4-2.5 3.5-4.8 5.5-6.5c1.9-1.8 3.9-2.9 6-4c2.2-1 4.4-1.7 6.8-2.1c2.4-.4 4.7-.5 7.7-.3c3 .1 9.1 2.9 10 1c1-1.9-4.1-7.6-4.5-12.6c-.3-5.1 1.1-12.6 2.4-17.7c1.3-5 3.1-8.8 5.5-12.4c2.4-3.6 5.3-6.7 8.8-9.3c3.4-2.5 7.6-4.7 11.9-6c4.3-1.3 8.9-2 13.8-1.7c4.8.2 10.2 1.5 15.4 3.3c5.2 1.8 13 7.4 15.5 7.5c2.5.1-.6-4.8-.4-6.7c.1-1.9.4-3.3 1.3-4.8c.9-1.5 2.4-3.1 4-4c1.5-1 3.6-1.4 5.3-1.5c1.7-.1 3.2.3 4.8 1c1.5.7 3.4 2.1 4.6 3.4c1.2 1.3 1.8 2.3 2.8 4.2c.9 2 1.8 8.2 2.7 7.5c.9-.7 1.8-8.4 2.7-11.7c1-3.3 1.7-5.2 3-8c1.3-2.8 3.3-6.4 5-9c1.7-2.6 3.2-4.4 5.3-6.7c2.1-2.2 4.6-4.7 7.2-6.8c2.6-2.1 5.4-3.9 8.4-5.6c3-1.7 6.4-3.2 9.6-4.4c3.2-1.1 5.7-2 9.5-2.5z" />
                    <path class="shade" d="M374.1 216.6c4.2-.5 11-1 15.4-.6c4.4.4 7.8 1.3 11.2 2.8c3.4 1.4 6.6 3.3 9.3 5.7c2.6 2.5 5.2 6.5 6.8 9.2c1.6 2.7 2.2 4.8 2.9 7.1c.7 2.3 1.1 4.3 1.4 6.7c.3 2.4.6 5.2.5 8c-.1 2.7.1 4.6-.9 8.7c-1 4.2-2.2 9.4-5.1 15.9c-2.8 6.5-10.2 19.2-11.9 23.1c-1.8 3.9-.8.8 1.5.4c2.3-.4 8.8-2.2 12.3-2.5c3.5-.4 5.5-1 8.6.4c3 1.4 7 5.7 9.7 8.2c2.7 2.5 4.3 4 6.3 6.7c1.9 2.7 4.2 6.3 5.5 9.5c1.2 3.2 2 6.6 2 9.6c.1 3.1-.5 6.2-1.7 8.9c-1.2 2.7-3.9 5.8-5.6 7.4c-1.7 1.7-2.9 2-4.4 2.6c-1.5.6-.8 1.2-4.4.8c-3.6-.3-13.4-2.4-17.1-2.9c-3.8-.4-3.4-.1-5.3.3c-1.9.3-2.2.1-6.1 1.9c-4 1.7-13.3 6.7-17.5 8.5c-4.3 1.7-5.4 1.5-8 1.9c-2.7.4-4.6.6-8 .4c-3.4-.3-6.7.1-12.4-1.9c-5.7-2-16.4-8.1-21.8-10.2c-5.5-2-7-1.9-10.8-2.1c-3.8-.2-6.3 0-11.8 1.2c-5.5 1.1-15.3 4.3-21.2 5.7c-5.9 1.5-9 2.2-14.1 2.8c-5 .7-10.6 1.2-15.9 1.2c-5.3 0-11-.5-15.9-1.2c-5-.6-10.1-1.8-14.1-2.8c-3.9-1-7-2.2-9.7-3.3c-2.7-1.2-4.5-2.2-6.4-3.6c-1.9-1.4-3.6-2.5-5.2-4.8c-1.6-2.3-3.5-6.5-4.3-8.8c-.8-2.2-.5-3.3-.4-4.7c0-1.5.2-2.5.8-4c.7-1.5 1.8-3.5 3.1-4.9c1.3-1.4 1.6-2.9 4.6-3.4c3-.4 12 2.6 13.6.6c1.5-2-4.2-7.7-4.6-12.6c-.3-4.9 1.1-12 2.2-16.8c1.2-4.9 2.6-8.4 4.9-12.1c2.3-3.7 5.6-7.3 9-10c3.5-2.7 7.5-4.8 11.7-6.2c4.3-1.4 8.8-2.2 13.7-2.1c4.8.2 10.3 1.3 15.6 3.1c5.3 1.8 13.6 7.6 16.2 7.8c2.6.2-.6-4.8-.4-6.7c.1-1.9.4-3.3 1.3-4.8c.9-1.5 2.4-3.1 4-4c1.5-1 3.6-1.4 5.3-1.5c1.7-.1 3.2.3 4.8 1c1.5.7 3.4 2.1 4.6 3.4c1.2 1.3 1.8 2.3 2.8 4.2c.9 2 1.8 8.2 2.7 7.5c.9-.7 1.8-8.4 2.7-11.7c1-3.3 1.7-5.2 3-8c1.3-2.8 3.3-6.4 5-9c1.7-2.6 3.2-4.4 5.3-6.7c2.1-2.2 4.6-4.7 7.2-6.8c2.6-2.1 5.4-3.9 8.4-5.6c3-1.7 6.4-3.2 9.6-4.4c3.2-1.1 5.4-2 9.5-2.5z" />
                    <path class="puff" d="M374.1 216.6c4.3-.5 11.7-1 16.4-.5c4.6.5 8.2 1.6 11.6 3.3c3.5 1.6 6.8 3.9 9.4 6.6c2.6 2.8 4.9 7 6.3 9.7c1.4 2.7 1.7 4.3 2.3 6.7c.6 2.5 1.2 4.2 1.3 7.9c.1 3.6.3 8.8-.7 13.9c-1 5.1-2.5 10.2-5.4 16.6c-2.8 6.4-9.8 18.1-11.7 21.9c-1.9 3.8-1.1.4.4.9c1.6.4 6.6 1.2 9.1 1.9c2.4.6 4 1.4 5.7 2.2c1.6.9 2.8 1.7 4.1 2.8c1.4 1.2 2.8 2.6 3.9 4.2c1.1 1.6 2 3.6 2.6 5.4c.5 1.8.7 3.6.7 5.4c-.1 1.8-.3 3.5-.9 5.2c-.7 1.7-1.7 3.5-3.1 4.9c-1.4 1.5-3.4 2.9-5.3 3.7c-1.9.7-4.5.8-6.3.7c-1.8-.1-1.8 0-4.6-1.4c-2.7-1.5-9.3-5.8-11.9-7.1c-2.6-1.2-2.4-.5-3.5-.5c-1.1.1-2.1.2-3.2.8c-1.1.5-2.4 1.6-3.4 2.6c-.9 1.1-1.3.9-2.2 3.8c-1 2.9-2.4 10.5-3.4 13.6c-.9 3.1-1.2 3.4-2.3 4.8c-1.1 1.4-2.5 2.8-4.2 3.7c-1.8.8-4.1 1.5-6.3 1.6c-2.2.1-4.8-.2-7-.8c-2.3-.6-1.8.7-6.3-2.8c-4.4-3.6-16.2-14.8-20.6-18.4c-4.4-3.6-3.6-2.5-5.6-3.4c-1.9-.9-4.1-1.6-6-2c-1.9-.3-3.4-.3-5.1 0c-1.8.2-1.6-.6-5.3 1.6c-3.8 2.2-12.9 9.1-17.4 11.6c-4.5 2.5-7 2.6-9.8 3.1c-2.7.6-4.5.3-6.9.1c-2.3-.3-4.9-.9-7.2-1.6c-2.4-.8-4.8-2-6.9-3.2c-2.1-1.2-3.8-2.3-5.8-4.2c-1.9-1.9-4.2-4.5-5.9-7.1c-1.7-2.7-3.1-5.6-4.1-8.9c-1.1-3.2-1.9-7.1-2.3-10.5c-.4-3.4-.3-6.3 0-9.8c.4-3.4 1.1-7.1 2.1-10.7c1.1-3.6 2.6-7.3 4.3-10.7c1.7-3.5 3.5-6.6 5.9-10.1c2.4-3.4 6.4-8.6 8.4-10.6c2-2 1.7-1.5 3.5-1.5c1.9 0 5.1.8 7.5 1.5c2.5.7 4.2 1.2 7.4 2.6c3.2 1.5 10 6.4 11.9 6.1c1.9-.3-.6-5.5-.3-7.7c.3-2.1.9-3.6 2-5c1.1-1.4 2.8-2.8 4.5-3.5c1.8-.7 4.1-.8 5.8-.6c1.7.1 2.9.7 4.3 1.5c1.3.8 2.3.9 3.7 3.3c1.5 2.4 3.8 11.2 5.1 11.1c1.3-.1 1.8-8.4 2.8-11.7c.9-3.3 1.7-5.3 2.9-8c1.3-2.7 2.9-5.7 4.6-8.4c1.8-2.6 3.6-4.9 5.7-7.3c2.2-2.3 4.7-4.7 7.2-6.8c2.6-2 5.4-3.9 8.4-5.6c3-1.7 6.4-3.2 9.6-4.4c3.2-1.1 5.2-2 9.5-2.5z" />
                    <ellipse class="shade" cx="306" cy="284.8" rx="6.1" ry="3.5" transform="rotate(65 306 284.8)" />
                    <ellipse class="shade" cx="311.6" cy="297.5" rx="3.9" ry="2.2" transform="rotate(65 311.6 297.5)" />
                    <ellipse class="shade" cx="393.7" cy="310.9" rx="5.6" ry="3.4" transform="rotate(134 393.7 310.9)" />
                    <ellipse class="shade" cx="382.7" cy="320.7" rx="4.2" ry="2.9" transform="rotate(138 382.7 320.7)" />
                </g>
            </g>
        </g>
    </svg>
</template>

<style scoped>
/* Palette — the original illustration's colours, as tokens so the sky can change mood */
.wx {
    --puff: #34b8fd;
    --shade: #19345d;
    --ground: #000;
    --drop: #0ea5e9;
    --sun-top: #ffca28;
    --sun-mid: #ff9f1c;
    --sun-low: #f58210;
    --glow: .55;

    /* Mood knobs, eased between weather states */
    --sun-y: 0px;
    --sun-o: 1;
    --ray-s: 1;
    --ray-o: 1;
    --cloud-in: 0px;

    overflow: visible;
}
:global(.dark) .wx {
    --shade: #1d3d6b;
    --ground: #02060d;
    --drop: #7dd3fc;
    --glow: .9;
}

/* Berawan: the sun slips lower and the clouds close in */
.wx.is-berawan { --sun-y: 30px; --ray-s: .8; --ray-o: .85; --glow: .3; --cloud-in: 6px; }
/* Hujan: the sun is mostly hidden, rain falls */
.wx.is-hujan { --sun-y: 88px; --ray-s: .6; --ray-o: 0; --glow: .12; --cloud-in: 10px; --puff: #2ea6e8; }
/* Hujan Lebat: no sun, heavier and darker clouds */
.wx.is-lebat { --sun-y: 130px; --sun-o: 0; --ray-s: .5; --ray-o: 0; --glow: 0; --cloud-in: 12px; --puff: #2790d2; }

.puff { fill: var(--puff); transition: fill 1s ease; }
.shade { fill: var(--shade); transition: fill .3s ease; }
.ground { fill: var(--ground); transition: fill .3s ease; }
.sun-top { fill: var(--sun-top); }
.sun-mid { fill: var(--sun-mid); }
.sun-low { fill: var(--sun-low); }
.ray { stroke: var(--sun-mid); }
.drop { stroke: var(--drop); stroke-width: 6; stroke-linecap: round; }

/* Every moving part pivots in the viewBox, around the sun where it matters */
.wx g, .wx line, .wx circle { transform-box: view-box; }

.sun-pos {
    transform: translateY(var(--sun-y));
    opacity: var(--sun-o);
    transition: transform 1.4s cubic-bezier(.45, 0, .2, 1), opacity 1s ease;
}
.sun-enter { animation: wx-sun-rise 1.3s cubic-bezier(.2, .8, .2, 1) both; }
.sun-bob { animation: wx-bob 6s ease-in-out infinite; }

.glow { opacity: var(--glow); transition: opacity 1s ease; }
.glow-pulse { transform-origin: 253.2px 190.8px; animation: wx-glow 4s ease-in-out infinite; }

.rays {
    transform-origin: 253.2px 190.8px;
    transform: scale(var(--ray-s));
    opacity: var(--ray-o);
    transition: transform 1s cubic-bezier(.34, 1.4, .64, 1), opacity .8s ease;
}
.rays-sway { transform-origin: 253.2px 190.8px; animation: wx-sway 9s ease-in-out infinite; }
.ray {
    transform-origin: 253.2px 190.8px;
    animation: wx-ray 2.8s ease-in-out infinite;
    animation-delay: calc(var(--i) * .28s - 2.8s);
}

/* Weather closes the clouds in; hover parts them a little */
.cloud-l { transform: translateX(calc(var(--cloud-in) - var(--part, 0px))); transition: transform 1.4s cubic-bezier(.45, 0, .2, 1); }
.cloud-r { transform: translateX(calc(var(--part, 0px) - var(--cloud-in))); transition: transform 1.4s cubic-bezier(.45, 0, .2, 1); }
.cloud-l-enter { animation: wx-in-l 1s cubic-bezier(.2, .8, .2, 1) .1s both; }
.cloud-r-enter { animation: wx-in-r 1s cubic-bezier(.2, .8, .2, 1) both; }
.drift-l { animation: wx-drift-l 7s ease-in-out infinite alternate; }
.drift-r { animation: wx-drift-r 9s ease-in-out -3s infinite alternate; }

/* Rintik-rintik: drops slip out from under the clouds */
.rain { opacity: 0; transition: opacity .8s ease; }
.drift-l .rain { --fall: 96px; }
.drift-r .rain { --fall: 82px; }
.drop { opacity: 0; }
.heavy { display: none; }
.is-hujan .rain, .is-lebat .rain { opacity: 1; }
.is-hujan .drop, .is-lebat .drop { animation: wx-drop 1.25s cubic-bezier(.5, 0, .9, .6) var(--d) infinite; }
.is-lebat .heavy { display: inline; }
.is-lebat .drop { animation-duration: .8s; animation-name: wx-drop-slant; }
.paused, .paused * { animation-play-state: paused !important; }

/* Hover: the clouds slide apart and the sun peeks up — quick in, slow drift back */
@media (hover: hover) {
    .wx:hover { --hover-sun: -8px; --hover-ray: 1.1; --part: 14px; }
    .sun-pos { transform: translateY(calc(var(--sun-y) + var(--hover-sun, 0px))); }
    .rays { transform: scale(calc(var(--ray-s) * var(--hover-ray, 1))); }
    .wx:hover .sun-pos, .wx:hover .cloud-l, .wx:hover .cloud-r { transition-duration: .7s; }
}

/* Reduced motion: hold a still frame — rain shown mid-fall instead of not at all */
@media (prefers-reduced-motion: reduce) {
    .is-hujan .drop, .is-lebat .drop { opacity: 1; transform: translateY(28px); }
}

@keyframes wx-sun-rise { from { transform: translateY(90px); } }
@keyframes wx-in-l { from { transform: translateX(-36px); opacity: 0; } }
@keyframes wx-in-r { from { transform: translateX(36px); opacity: 0; } }
@keyframes wx-bob { 50% { transform: translateY(-8px); } }
@keyframes wx-glow { 0%, 100% { transform: scale(.92); opacity: .75; } 50% { transform: scale(1.06); opacity: 1; } }
@keyframes wx-sway { 0%, 100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }
@keyframes wx-ray { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.08); } }
@keyframes wx-drift-l { to { transform: translate(10px, -3px); } }
@keyframes wx-drift-r { to { transform: translate(-9px, 2px); } }
@keyframes wx-drop {
    0% { transform: translateY(0); opacity: 0; }
    15% { opacity: 1; }
    75% { opacity: 1; }
    100% { transform: translateY(var(--fall)); opacity: 0; }
}
@keyframes wx-drop-slant {
    0% { transform: translate(0, 0); opacity: 0; }
    12% { opacity: 1; }
    80% { opacity: 1; }
    100% { transform: translate(-14px, var(--fall)); opacity: 0; }
}
</style>
