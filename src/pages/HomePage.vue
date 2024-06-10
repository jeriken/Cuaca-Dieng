<script setup>
import Main from '../components/Main.vue'
import Header from '../components/Header.vue'
import Highlight from '../components/Highlight.vue'
</script>

<template>
    <div class="grid grid-cols-11">
        <div class="col-span-11 md:col-span-5 lg:col-span-4 xl:col-span-3 md:h-screen md:sticky top-0 bg-stone-50 pb-8">
            <Main :data="mainData" />
        </div>
        <div class="col-span-11 md:col-span-6 lg:col-span-7 xl:col-span-8 bg-stone-100 p-8">
            <Header />
            <Highlight :data="feedData" />
        </div>
    </div>
</template>

<script>
import axios from 'axios'

export default {
    data() {
        return {
            mainData: [],
            feedData: []
        }
    },
    methods: {
        async getData() {
            this.mainData = await this.callApi("https://api.thingspeak.com/channels/1082329/feed/last.json");
            this.feedData = await this.callApi("https://api.thingspeak.com/channels/1082329/feeds.json?results=270&timescale=60");
        },
        async callApi(url) {
            const { data } = await axios.get(url);
            return data;
        },
    },
    beforeMount() {
        this.getData();
    }
}
</script>