import { useReducedMotion } from 'motion/react';
import { DURATION, EASE } from './tokens';

/**
 * Card hover lift. Returns props rather than a component so it can be spread
 * onto whatever element a section already renders.
 *
 * `willChange` is deliberately omitted — promoting dozens of cards costs more
 * than the lift is worth; the transform alone is enough to composite.
 *
 * Returns an empty object under reduced motion, so the card simply does not
 * move rather than moving instantly.
 */
export function useHoverLift({ y = -4, scale = 1 } = {}) {
  const reduced = useReducedMotion();
  if (reduced) return {};
  return {
    whileHover: { y, scale },
    transition: { duration: DURATION.fast, ease: EASE },
  };
}
