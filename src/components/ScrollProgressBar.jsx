import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function ScrollProgressBar() {
  const barRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(barRef.current, {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: document.body,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0,
        },
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '3px',
      zIndex: 9999,
      background: 'rgba(21,120,229,0.12)',
    }}>
      <div
        ref={barRef}
        style={{
          height: '100%',
          background: 'linear-gradient(90deg, var(--blue) 0%, var(--blue-mid) 100%)',
          transformOrigin: 'left center',
          scaleX: 0,
          willChange: 'transform',
          boxShadow: '0 0 8px rgba(21,120,229,0.6)',
        }}
      />
    </div>
  );
}
