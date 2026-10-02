// Per-device conveniences: last used options and the badge collection.
// Storage can be unavailable (private mode, blocked site data), so every access is guarded.

const PREFS_KEY = 'cuaca-twibbon-prefs'
const COLLECTION_KEY = 'cuaca-twibbon-collection'

function read(key, fallback) {
    try {
        const value = JSON.parse(localStorage.getItem(key))
        return value && typeof value === 'object' ? value : fallback
    } catch {
        return fallback
    }
}

function write(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value))
    } catch {
        // Not critical: the page works the same without persistence.
    }
}

export const loadPrefs = () => read(PREFS_KEY, {})
export const savePrefs = (prefs) => write(PREFS_KEY, prefs)

export function loadCollection() {
    const value = read(COLLECTION_KEY, {})
    return { badges: value.badges || {}, coldest: value.coldest || null }
}

// Called when a twibbon is shared or saved. Reports what is new so the UI can celebrate.
export function recordTwibbon({ badgeId, temp, time, spotName }) {
    const collection = loadCollection()
    const entry = { temp, time: new Date(time).toISOString(), spot: spotName }
    const newBadge = Boolean(badgeId) && !collection.badges[badgeId]
    const colder = temp != null && (!collection.coldest || temp < collection.coldest.temp)
    // Only celebrate a record when it beats an earlier one.
    const newRecord = colder && Boolean(collection.coldest)

    if (newBadge) collection.badges[badgeId] = entry
    if (colder) collection.coldest = entry
    if (newBadge || colder) write(COLLECTION_KEY, collection)
    return { collection, newBadge, newRecord }
}
