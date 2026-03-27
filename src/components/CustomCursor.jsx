import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function CustomCursor() {
  const dotRef  = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    /* ── Only enable on non-touch / pointer-fine devices ─── */
    const mq = window.matchMedia('(pointer: fine)');
    if (!mq.matches) return;

    const dot  = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    /* Hide default cursor */
    document.documentElement.style.cursor = 'none';

    /* ── quickTo for performance ─────────────────────────── */
    const moveDotX  = gsap.quickTo(dot,  'x', { duration: 0.10, ease: 'power3.out' });
    const moveDotY  = gsap.quickTo(dot,  'y', { duration: 0.10, ease: 'power3.out' });
    const moveRingX = gsap.quickTo(ring, 'x', { duration: 0.35, ease: 'power3.out' });
    const moveRingY = gsap.quickTo(ring, 'y', { duration: 0.35, ease: 'power3.out' });

    const onMove = (e) => {
      moveDotX(e.clientX);
      moveDotY(e.clientY);
      moveRingX(e.clientX);
      moveRingY(e.clientY);
    };
    window.addEventListener('mousemove', onMove);

    /* ── Hover states ────────────────────────────────────── */
    const INTERACTIVE = 'a, button, [data-cursor]';

    const onEnter = (e) => {
      const el = e.currentTarget;
      const type = el.dataset.cursor;

      gsap.to(dot, { scale: 0, duration: 0.2 });

      if (type === 'image') {
        gsap.to(ring, {
          width: 64, height: 64,
          background: 'transparent',
          border: '2px solid rgba(255,255,255,0.8)',
          duration: 0.3, ease: 'power3.out',
        });
      } else {
        gsap.to(ring, {
          width: 40, height: 40,
          background: 'transparent',
          border: '2px solid rgba(21,120,229,0.7)',
          duration: 0.25, ease: 'power3.out',
        });
      }
    };

    const onLeave = () => {
      gsap.to(dot, { scale: 1, duration: 0.2 });
      gsap.to(ring, {
        width: 32, height: 32,
        background: 'rgba(21,120,229,0.12)',
        border: '1.5px solid rgba(21,120,229,0.35)',
        duration: 0.25, ease: 'power3.out',
      });
    };

    /* Attach to all interactives (delegate via document) */
    const delegateEnter = (e) => {
      const el = e.target.closest(INTERACTIVE);
      if (el) { el._cursorEnter = true; onEnter({ currentTarget: el }); }
    };
    const delegateLeave = (e) => {
      const next = e.relatedTarget;
      if (!next?.closest(INTERACTIVE)) { onLeave(); }
    };

    document.addEventListener('mouseover',  delegateEnter);
    document.addEventListener('mouseout',   delegateLeave);

    /* ── Show / hide on window enter/leave ──────────────── */
    const show = () => gsap.to([dot, ring], { opacity: 1, duration: 0.2 });
    const hide = () => gsap.to([dot, ring], { opacity: 0, duration: 0.2 });
    document.addEventListener('mouseenter', show);
    document.addEventListener('mouseleave', hide);

    return () => {
      document.documentElement.style.cursor = '';
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover',  delegateEnter);
      document.removeEventListener('mouseout',   delegateLeave);
      document.removeEventListener('mouseenter', show);
      document.removeEventListener('mouseleave', hide);
    };
  }, []);

  const BASE = {
    position: 'fixed',
    top: 0, left: 0,
    borderRadius: '50%',
    pointerEvents: 'none',
    zIndex: 99999,
    transform: 'translate(-50%, -50%)',
    willChange: 'transform',
    opacity: 0,
  };

  return (
    <>
      {/* Small dot — very fast */}
      <div ref={dotRef} style={{
        ...BASE,
        width: '8px', height: '8px',
        background: 'var(--blue)',
        boxShadow: '0 0 6px rgba(21,120,229,0.7)',
      }} />

      {/* Larger trailing ring */}
      <div ref={ringRef} style={{
        ...BASE,
        width: '32px', height: '32px',
        background: 'rgba(21,120,229,0.12)',
        border: '1.5px solid rgba(21,120,229,0.35)',
        transition: 'width 0.25s, height 0.25s, background 0.25s, border 0.25s',
      }} />
    </>
  );
}
