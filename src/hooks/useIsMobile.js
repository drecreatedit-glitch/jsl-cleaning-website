import { useEffect, useState } from 'react';

/**
 * Returns true when the viewport is at or below `breakpoint` px wide.
 * Defaults to 768px (tablet/phone). Updates on resize/orientation change.
 */
export default function useIsMobile(breakpoint = 768) {
  const query = `(max-width: ${breakpoint}px)`;

  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false
  );

  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = (e) => setIsMobile(e.matches);

    // Sync immediately in case it changed before the listener attached
    setIsMobile(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);

  return isMobile;
}
