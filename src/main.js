import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import moment from 'moment'
import 'moment/locale/id'
import OneSignalVuePlugin from '@onesignal/onesignal-vue3'

moment.locale('id')

const app = createApp(App)

app.config.globalProperties.$filters = {
    tanggal(date) {
        return moment(date).format("DD MMMM YYYY")
    },
    time(date) {
        return moment(date).format("HH")
    },
}
app.use(OneSignalVuePlugin, {
    appId: 'd8019b30-63f4-4c3d-b99e-8fb3dbcaa31c',
})
app.use(router)
app.mount('#app')

