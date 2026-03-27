import { useScroll } from 'framer-motion';
import { useRef } from 'react';

/**
 * useScrollProgress
 * Returns scrollYProgress (0→1) for the entire page or a ref'd element.
 */
export function useScrollProgress(targetRef = null) {
  const { scrollYProgress } = useScroll(
    targetRef ? { target: targetRef, offset: ['start end', 'end start'] } : {}
  );
  return scrollYProgress;
}
