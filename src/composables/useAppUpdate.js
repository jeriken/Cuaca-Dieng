import { ref } from 'vue'

// Module-level so the service worker is registered once and the toast in App.vue
// sees the same state wherever it's read.
const needRefresh = ref(false)
let updateSW = null

export async function registerAppUpdate() {
    if (updateSW) return
    const { registerSW } = await import('virtual:pwa-register')
    updateSW = registerSW({
        immediate: true,
        // A new deploy has finished downloading and is waiting; let the user pick when to
        // reload so nothing they're in the middle of (e.g. a twibbon) gets wiped.
        onNeedRefresh() {
            needRefresh.value = true
        },
        onRegisteredSW(swUrl, r) {
            if (!r) return
            const check = () => {
                if (r.installing || !navigator.onLine) return
                r.update()
            }
            // Check for a new deploy hourly and whenever the tab/PWA is brought back to front
            setInterval(check, 60 * 60 * 1000)
            document.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'visible') check()
            })
        },
    })
}

export function useAppUpdate() {
    // Activates the waiting service worker; the page reloads once it takes control
    const refresh = () => updateSW?.(true)
    const dismiss = () => { needRefresh.value = false }

    return { needRefresh, refresh, dismiss }
}
