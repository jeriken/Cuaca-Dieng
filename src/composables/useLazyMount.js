import { ref, onUnmounted, watch } from 'vue'

// `ready` is a caller-supplied signal (e.g. a ref that flips once the async
// data driving the page layout has settled). The observer only attaches once
// `ready` is true, so its first callback reflects real, stabilized layout
// instead of the short skeleton the page shows while still loading.
export function useLazyMount(ready, rootMargin = '200px') {
    const target = ref(null)
    const isVisible = ref(false)
    let observer = null

    const start = () => {
        if (observer || isVisible.value) return
        if (!target.value || typeof IntersectionObserver === 'undefined') {
            isVisible.value = true
            return
        }
        observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                isVisible.value = true
                observer.disconnect()
            }
        }, { rootMargin })
        observer.observe(target.value)
    }

    watch(ready, (val) => { if (val) start() }, { immediate: true, flush: 'post' })

    onUnmounted(() => observer?.disconnect())

    return { target, isVisible }
}
