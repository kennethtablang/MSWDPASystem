import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * FR-1.9: terminate a session after a period of inactivity.
 *
 * Activity is shared across tabs through localStorage — a user typing in one tab
 * must not be signed out by an idle timer in another. The countdown is derived
 * from a stored timestamp rather than a decrementing counter, so a machine that
 * slept through the idle window expires on wake instead of resuming mid-count.
 */
const ACTIVITY_KEY = 'lastActivityAt';
const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'touchstart', 'scroll', 'wheel'];

// Activity writes are throttled: routing every event to localStorage would be
// needlessly expensive on the low-spec office machines this runs on.
const WRITE_THROTTLE_MS = 5000;
const TICK_MS = 1000;

export default function useIdleTimeout({
  timeoutMinutes,
  warnSeconds = 60,
  onTimeout,
  enabled = true,
}) {
  const [secondsLeft, setSecondsLeft] = useState(null); // null = not warning

  const lastWriteRef = useRef(0);
  const expiredRef = useRef(false);
  // Mirrors `secondsLeft` for the activity listener, which must not be
  // re-subscribed on every tick of the countdown.
  const warningRef = useRef(false);
  const onTimeoutRef = useRef(onTimeout);

  // Synced in an effect rather than during render: mutating a ref while
  // rendering is not safe under concurrent rendering.
  useEffect(() => { onTimeoutRef.current = onTimeout; }, [onTimeout]);

  const timeoutMs = Math.max(1, Number(timeoutMinutes) || 0) * 60_000;

  const markActive = useCallback((force = false) => {
    const now = Date.now();
    if (!force && now - lastWriteRef.current < WRITE_THROTTLE_MS) return;
    lastWriteRef.current = now;
    localStorage.setItem(ACTIVITY_KEY, String(now));
  }, []);

  /** Dismiss the warning and restart the idle window. */
  const extend = useCallback(() => {
    expiredRef.current = false;
    warningRef.current = false;
    setSecondsLeft(null);
    markActive(true);
  }, [markActive]);

  useEffect(() => {
    if (!enabled || !timeoutMinutes) return undefined;

    markActive(true);

    const onActivity = () => {
      // Once the warning is visible only an explicit "Stay signed in" may extend
      // the session; a stray scroll must not silently cancel the countdown.
      if (warningRef.current || expiredRef.current) return;
      markActive();
    };

    ACTIVITY_EVENTS.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));

    const tick = setInterval(() => {
      const last = Number(localStorage.getItem(ACTIVITY_KEY)) || Date.now();
      const remaining = timeoutMs - (Date.now() - last);

      if (remaining <= 0) {
        if (expiredRef.current) return;
        expiredRef.current = true;
        warningRef.current = false;
        setSecondsLeft(0);
        onTimeoutRef.current?.();
        return;
      }

      const remainingSeconds = Math.ceil(remaining / 1000);
      const next = remainingSeconds <= warnSeconds ? remainingSeconds : null;
      warningRef.current = next !== null;
      setSecondsLeft((prev) => (prev === next ? prev : next));
    }, TICK_MS);

    return () => {
      clearInterval(tick);
      ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, onActivity));
    };
  }, [enabled, timeoutMinutes, timeoutMs, warnSeconds, markActive]);

  return { secondsLeft, isWarning: secondsLeft !== null, extend };
}
