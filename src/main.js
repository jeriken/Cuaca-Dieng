import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import VueApexCharts from "vue3-apexcharts";
import moment from 'moment/min/moment-with-locales'

moment.locale('id')

const app = createApp(App)

app.config.globalProperties.$filters = {
    tanggal(date) {
        return moment(date).format("DD MMMM YYYY")
    },
}
app.use(router)
app.use(VueApexCharts)
app.mount('#app')

