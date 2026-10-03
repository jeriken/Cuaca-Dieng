// Indonesian "x menit lalu" / "x jam lagi" — independent of moment's locale
// loading, which is unreliable once locales are imported separately.
export function relativeTime(target, now = Date.now()) {
    const diff = target - now
    const mins = Math.round(Math.abs(diff) / 60000)
    if (mins < 1) return 'baru saja'
    const text = mins < 60 ? `${mins} menit` : `${Math.round(mins / 60)} jam`
    return diff < 0 ? `${text} lalu` : `${text} lagi`
}
