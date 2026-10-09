// Shared bits of the sticker designs: transparent PNGs without a photo, sized to
// their content so they can be pasted on any photo or video in a story.

// `caption: false` hides the title field; a sticker that prints it sets its own.
export const STICKER = { kind: 'stiker', usesPhoto: false, transparent: true, caption: false }

// Text sits straight on the viewer's photo, so it needs a stronger shadow than on a scrim.
export const SHADOW = 'rgba(0, 0, 0, 0.55)'

// White "die-cut" edge around a sticker shape, like a printed vinyl sticker.
export const DIE_CUT = 'rgba(0, 0, 0, 0.28)'
