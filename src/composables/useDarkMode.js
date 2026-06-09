import { ref, watch } from 'vue'

// Sync with DOM/localStorage immediately at module load
const isDark = ref(
    typeof window !== 'undefined' && localStorage.getItem('cuaca-theme') === 'dark'
)

// Browser UI (Chrome address bar) color per theme
const THEME_COLOR = { dark: '#0a1524', light: '#fafaf9' }

function syncThemeColor(value) {
    if (typeof document === 'undefined') return
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', value ? THEME_COLOR.dark : THEME_COLOR.light)
}

// Initialize on load
function syncDarkMode(value) {
    if (typeof window !== 'undefined') {
        if (value) {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
        syncThemeColor(value)
    }
}

syncDarkMode(isDark.value)

export function useDarkMode() {
    const toggle = () => {
        isDark.value = !isDark.value
        localStorage.setItem('cuaca-theme', isDark.value ? 'dark' : 'light')
        syncDarkMode(isDark.value)
    }

    // Watch for changes and sync with DOM
    watch(isDark, (newVal) => {
        syncDarkMode(newVal)
    })

    return { isDark, toggle }
}
