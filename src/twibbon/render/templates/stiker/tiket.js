// Tiket sticker — the boarding pass on its own, without a photo behind it.

import { drawTicket, ticketHeight, TICKET_CAPTION } from '../tiket.js'
import { STICKER } from './common.js'

const MARGIN = { x: 60, top: 40, bottom: 76 } // room for the card's drop shadow

export default {
    ...STICKER,
    id: 'stiker-tiket',
    pair: 'tiket', // the photo design it comes from
    name: 'Tiket',
    hint: 'Boarding pass',
    caption: TICKET_CAPTION,
    size: { width: 1080, height: Math.round(MARGIN.top + ticketHeight(1, 2) + MARGIN.bottom) },
    safe: { top: MARGIN.top, bottom: MARGIN.bottom, x: MARGIN.x },
    draw(ctx, s) {
        drawTicket(ctx, s, { x: MARGIN.x, y: MARGIN.top, w: s.W - MARGIN.x * 2, k: 1, rows: 2 })
    },
}
