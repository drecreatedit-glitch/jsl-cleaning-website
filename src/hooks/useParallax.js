import { useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

/**
 * useParallax
 * @param {number} distance - px range to shift element (e.g. 80 = moves 80px on scroll)
 * @returns { ref, y } — attach ref to container, apply y to the parallax element
 */
export function useParallax(distance = 80) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [-distance, distance]);
  return { ref, y };
}
