/**
 * Motion tokens for the public-facing pages.
 *
 * House rules, kept here so call sites cannot drift:
 *  - 200-400ms, ease-in-out. Government UI: motion clarifies, never performs.
 *  - Transform + opacity only, so everything stays on the compositor.
 *
 * Separate from `./index.jsx` because that file exports components only —
 * mixing constants in breaks react-refresh's fast-refresh boundary.
 */
export const EASE = [0.4, 0, 0.2, 1]; // ease-in-out

export const DURATION = { fast: 0.2, base: 0.3, slow: 0.4 };

/** Distance a revealing element travels, in px. Small on purpose. */
export const SLIDE = 16;
