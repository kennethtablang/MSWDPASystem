/**
 * Scroll- and mount-driven reveal components for the public-facing pages.
 *
 * `useReducedMotion` collapses every animation here to an instant, fully-visible
 * end state. index.css also carries a global reduced-motion kill switch; this is
 * the JS-driven half of the same contract, because Framer writes inline styles
 * that a CSS `!important` rule cannot reach.
 *
 * Reveal/Stagger animate once on scroll-in — replaying on every scroll-past
 * reads as noise on a page this long.
 *
 * Timing constants live in ./tokens, hooks in ./hooks: this module exports
 * components only, to keep the fast-refresh boundary intact.
 */
import { motion, useReducedMotion } from 'motion/react';
import { DURATION, EASE, SLIDE } from './tokens';

/** Fade + rise, for a single element entering the viewport. */
export function Reveal({
  children,
  delay = 0,
  y = SLIDE,
  as = 'div',
  className = '',
  ...props
}) {
  const reduced = useReducedMotion();
  const Comp = motion[as] ?? motion.div;

  return (
    <Comp
      className={className}
      initial={reduced ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: DURATION.slow, ease: EASE, delay }}
      {...props}
    >
      {children}
    </Comp>
  );
}

/**
 * Wraps a group so its children reveal in sequence. Pair with `StaggerItem`.
 * 60ms between children: enough to read as ordered, short enough that the last
 * card in a six-card grid is not left waiting.
 */
export function Stagger({ children, className = '', gap = 0.06, as = 'div', ...props }) {
  const reduced = useReducedMotion();
  const Comp = motion[as] ?? motion.div;

  return (
    <Comp
      className={className}
      initial={reduced ? false : 'hidden'}
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: reduced ? 0 : gap } },
      }}
      {...props}
    >
      {children}
    </Comp>
  );
}

export function StaggerItem({ children, className = '', y = SLIDE, as = 'div', ...props }) {
  const Comp = motion[as] ?? motion.div;

  return (
    <Comp
      className={className}
      variants={{
        hidden: { opacity: 0, y },
        visible: { opacity: 1, y: 0, transition: { duration: DURATION.base, ease: EASE } },
      }}
      {...props}
    >
      {children}
    </Comp>
  );
}

/**
 * Hero content entrance — runs on mount rather than on scroll, since the hero
 * is above the fold. Same variant names as Stagger so children compose.
 */
export function HeroStagger({ children, className = '', ...props }) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduced ? false : 'hidden'}
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: reduced ? 0 : 0.08, delayChildren: 0.05 } },
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
