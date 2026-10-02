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
      path: '/twibbon',
      // Loaded on demand so the home page bundle stays the same size.
      component: () => import('./pages/TwibbonPage.vue'),
    }
  ]
})
