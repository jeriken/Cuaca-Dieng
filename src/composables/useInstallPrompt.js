import { ref, computed } from 'vue'

// Captured at module load rather than in a component: Chrome fires
// beforeinstallprompt once, often before the menu mounts, and a listener added
// on every mount would pile up each time the user returns to the home page.
const deferredPrompt = ref(null)

if (typeof window !== 'undefined') {
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault()
        deferredPrompt.value = e
    })
    window.addEventListener('appinstalled', () => { deferredPrompt.value = null })
}

export function useInstallPrompt() {
    const canInstall = computed(() => deferredPrompt.value !== null)

    const install = () => {
        const e = deferredPrompt.value
        if (!e) return
        // A prompt event can only be used once — Chrome sends a fresh one if it's dismissed
        deferredPrompt.value = null
        e.prompt()
    }

    return { canInstall, install }
}
