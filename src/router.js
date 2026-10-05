import { createRouter, createWebHistory } from 'vue-router'
import HomePage from './pages/HomePage.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: HomePage,
    },
    {
      path: '/foto-suhu',
      // Loaded on demand so the home page bundle stays the same size.
      component: () => import('./pages/TwibbonPage.vue'),
    },
    {
      // Old link, kept so previously shared captions still work.
      path: '/twibbon',
      redirect: '/foto-suhu',
    }
  ]
})
