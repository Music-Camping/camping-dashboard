import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Tracks user inactivity across mousemove, click, and keydown events.
 * Returns true when idle for at least `timeoutMs`, false otherwise.
 *
 * Three events cover all interaction surfaces:
 * - mousemove: desktop mouse users
 * - click: TV remote button press (remotes rarely emit mousemove)
 * - keydown: keyboard users and TV remote d-pad navigation
 *
 * When enabled === false the hook is fully inert: no listeners attached,
 * always returns false. This ensures normal dashboard mode is unaffected.
 */
export function useIdleTimer(timeoutMs: number, enabled: boolean): boolean {
  const [isIdle, setIsIdle] = useState(false);
  // useRef avoids re-render on every clearTimeout/setTimeout call.
  // Only state transitions (false→true, true→false) trigger reconciler work.
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimer = useCallback(() => {
    if (!enabled) return;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    // setIsIdle(false) on every event is safe — React dedupes same-value
    // state updates, so repeated false→false calls are free.
    setIsIdle(false);
    timerRef.current = setTimeout(() => setIsIdle(true), timeoutMs);
  }, [enabled, timeoutMs]);

  useEffect(() => {
    if (!enabled) {
      setIsIdle(false);
      return undefined;
    }

    // Start the idle countdown immediately on mount or when enabled flips on.
    resetTimer();

    const events = ["mousemove", "click", "keydown"] as const;
    events.forEach((event) => {
      // passive: true prevents scroll-jank (not critical on TV but good practice).
      window.addEventListener(event, resetTimer, { passive: true });
    });

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [enabled, resetTimer]);

  return isIdle;
}
