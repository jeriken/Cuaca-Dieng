import { ref, watch } from 'vue'

// Sync with DOM/localStorage immediately at module load
const isDark = ref(
    typeof window !== 'undefined' && localStorage.getItem('cuaca-theme') === 'dark'
)

// Initialize on load
function syncDarkMode(value) {
    if (typeof window !== 'undefined') {
        if (value) {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
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
