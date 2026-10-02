// Minimal EXIF reader: finds when a JPEG photo was taken, so the twibbon can use
// the sensor reading from that moment instead of "now".

const TAG_EXIF_IFD = 0x8769
const TAG_DATETIME = 0x0132
const TAG_DATETIME_ORIGINAL = 0x9003
const TAG_OFFSET_TIME_ORIGINAL = 0x9011
const TYPE_ASCII = 2
const WIB_OFFSET_MINUTES = 7 * 60

export async function readCaptureTime(file) {
    try {
        const buffer = await file.slice(0, 256 * 1024).arrayBuffer()
        return parseCaptureTime(new DataView(buffer))
    } catch {
        return null
    }
}

export function parseCaptureTime(view) {
    if (view.byteLength < 4 || view.getUint16(0) !== 0xFFD8) return null
    let offset = 2
    while (offset + 4 <= view.byteLength) {
        if (view.getUint8(offset) !== 0xFF) return null
        const marker = view.getUint8(offset + 1)
        if (marker === 0xDA || marker === 0xD9) return null // image data starts: no EXIF found
        const length = view.getUint16(offset + 2)
        if (marker === 0xE1 && hasExifHeader(view, offset + 4)) {
            const tiffStart = offset + 10
            return readTiff(view, tiffStart, Math.min(view.byteLength, offset + 2 + length))
        }
        offset += 2 + length
    }
    return null
}

function hasExifHeader(view, offset) {
    const bytes = [0x45, 0x78, 0x69, 0x66, 0x00, 0x00] // "Exif\0\0"
    return offset + bytes.length <= view.byteLength && bytes.every((b, i) => view.getUint8(offset + i) === b)
}

function readTiff(view, start, end) {
    const order = view.getUint16(start)
    const little = order === 0x4949
    if (!little && order !== 0x4D4D) return null
    if (view.getUint16(start + 2, little) !== 0x2A) return null

    const ifd0 = readIfd(view, start, start + view.getUint32(start + 4, little), end, little)
    let exif = {}
    if (ifd0[TAG_EXIF_IFD] != null) {
        exif = readIfd(view, start, start + ifd0[TAG_EXIF_IFD], end, little)
    }
    const raw = exif[TAG_DATETIME_ORIGINAL] || ifd0[TAG_DATETIME]
    return toDate(raw, exif[TAG_OFFSET_TIME_ORIGINAL])
}

// Returns { tag: value } for the few tags we care about (ASCII strings or LONG offsets).
function readIfd(view, tiffStart, ifdOffset, end, little) {
    const result = {}
    if (ifdOffset + 2 > end) return result
    const count = view.getUint16(ifdOffset, little)
    for (let i = 0; i < count; i++) {
        const entry = ifdOffset + 2 + i * 12
        if (entry + 12 > end) break
        const tag = view.getUint16(entry, little)
        if (tag === TAG_EXIF_IFD) {
            result[tag] = view.getUint32(entry + 8, little)
        } else if (tag === TAG_DATETIME || tag === TAG_DATETIME_ORIGINAL || tag === TAG_OFFSET_TIME_ORIGINAL) {
            if (view.getUint16(entry + 2, little) !== TYPE_ASCII) continue
            const length = view.getUint32(entry + 4, little)
            const valueOffset = length > 4 ? tiffStart + view.getUint32(entry + 8, little) : entry + 8
            if (valueOffset + length > end) continue
            let text = ''
            for (let j = 0; j < length; j++) {
                const code = view.getUint8(valueOffset + j)
                if (code === 0) break
                text += String.fromCharCode(code)
            }
            result[tag] = text.trim()
        }
    }
    return result
}

// "2026:08:12 05:14:09" (+ optional "+07:00") → Date. Without an offset we assume WIB.
function toDate(raw, offsetText) {
    const match = /^(\d{4}):(\d{2}):(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/.exec(raw || '')
    if (!match) return null
    const [, y, mo, d, h, mi, s] = match.map(Number)
    let offset = WIB_OFFSET_MINUTES
    const tz = /^([+-])(\d{2}):(\d{2})$/.exec(offsetText || '')
    if (tz) offset = (tz[1] === '-' ? -1 : 1) * (Number(tz[2]) * 60 + Number(tz[3]))

    const date = new Date(Date.UTC(y, mo - 1, d, h, mi, s) - offset * 60 * 1000)
    const tooOld = y < 2015
    const inFuture = date.getTime() > Date.now() + 24 * 60 * 60 * 1000
    return Number.isNaN(date.getTime()) || tooOld || inFuture ? null : date
}
