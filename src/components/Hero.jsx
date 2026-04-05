import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ─── Trust pills data ────────────────────────────────────── */
const TRUST_PILLS = [
  { icon: '🛡️', label: 'Fully Insured' },
  { icon: '🧴', label: 'Supplies Included' },
  { icon: '🌿', label: 'Eco-Friendly' },
  { icon: '⏱️', label: 'Quote Ready in 2 Hours' },
];

/* ═══════════════════════════════════════════════════════════
   JSL HERO — Centered Immersive Layout
   Background layers remain the same (flowers parallax),
   content restructured to centered vertical stack with
   floating social-proof elements.
═══════════════════════════════════════════════════════════ */

export default function Hero() {
  /* ── Refs ─────────────────────────────────────────────── */
  const sectionRef    = useRef(null);
  const flowersRef    = useRef(null);
  const overlayRef    = useRef(null);
  const petalsRef     = useRef(null);
  const orbARef       = useRef(null);
  const orbBRef       = useRef(null);
  const orbCRef       = useRef(null);
  const floatPetARef  = useRef(null);
  const floatPetBRef  = useRef(null);
  const contentRef    = useRef(null);

  /* ── Text refs for staggered entrance ─────────────────── */
  const eyebrowRef      = useRef(null);
  const line1Ref        = useRef(null);
  const line2Ref        = useRef(null);
  const taglineRef      = useRef(null);
  const bodyCopyRef     = useRef(null);
  const buttonsRef      = useRef(null);
  const pillsRef        = useRef(null);

  const locationBadgeRef = useRef(null);
  const statsRowRef     = useRef(null);
  const scrollArrowRef  = useRef(null);
  const progressRef     = useRef(null);

  /* ══════════════════════════════════════════════════════
     PAGE-LOAD ENTRANCE ANIMATIONS
  ══════════════════════════════════════════════════════ */
  useEffect(() => {
    const ctx = gsap.context(() => {

      /* Layer 2 — flowers bloom in */
      gsap.fromTo(flowersRef.current,
        { opacity: 0, scale: 1.06 },
        { opacity: 1, scale: 1, duration: 3, ease: 'power2.out' }
      );

      /* Layer 4 — petals drift in from right */
      gsap.fromTo(petalsRef.current,
        { opacity: 0, x: 60 },
        { opacity: 0.45, x: 0, duration: 3, ease: 'power2.out', delay: 0.4 }
      );

      /* Layer 5 — Orbs drift in from off-canvas */
      gsap.fromTo(orbARef.current,
        { x: -200, opacity: 0 },
        { x: 0, opacity: 1, duration: 3, ease: 'power2.out', delay: 0.2 }
      );
      gsap.fromTo(orbBRef.current,
        { x: 200, opacity: 0 },
        { x: 0, opacity: 1, duration: 3, ease: 'power2.out', delay: 0.3 }
      );
      gsap.fromTo(orbCRef.current,
        { opacity: 0, scale: 0.5 },
        { opacity: 1, scale: 1, duration: 3, ease: 'power2.out', delay: 0.5 }
      );
      gsap.fromTo(floatPetARef.current,
        { x: -150, opacity: 0, rotation: -15 },
        { x: 0, opacity: 1, rotation: 0, duration: 3, ease: 'power2.out', delay: 0.6 }
      );
      gsap.fromTo(floatPetBRef.current,
        { x: 150, opacity: 0, rotation: 15 },
        { x: 0, opacity: 1, rotation: 0, duration: 3, ease: 'power2.out', delay: 0.7 }
      );

      /* Layer 6 — Copy stagger */
      gsap.fromTo(eyebrowRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 3, ease: 'power2.out', delay: 0.6 }
      );
      gsap.fromTo(line1Ref.current,
        { clipPath: 'inset(0 100% 0 0)', opacity: 1 },
        { clipPath: 'inset(0 0% 0 0)', duration: 3, ease: 'power2.out', delay: 0.75 }
      );
      gsap.fromTo(line2Ref.current,
        { clipPath: 'inset(0 100% 0 0)', opacity: 1 },
        { clipPath: 'inset(0 0% 0 0)', duration: 3, ease: 'power2.out', delay: 0.9 }
      );
      gsap.fromTo(taglineRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 3, ease: 'power2.out', delay: 1.05 }
      );
      gsap.fromTo(bodyCopyRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 3, ease: 'power2.out', delay: 1.15 }
      );
      gsap.fromTo(buttonsRef.current.children,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 3, ease: 'power2.out', stagger: 0.1, delay: 1.25 }
      );
      if (pillsRef.current) {
        gsap.fromTo(Array.from(pillsRef.current.querySelectorAll('span, button')),
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 3, ease: 'power2.out', stagger: 0.08, delay: 1.35 }
        );
      }

      /* Floating social proof cards */
      gsap.fromTo(locationBadgeRef.current,
        { opacity: 0, y: 40, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 2.5, ease: 'power2.out', delay: 1.5 }
      );
      gsap.fromTo(statsRowRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 2.5, ease: 'power2.out', delay: 1.6 }
      );

    }, sectionRef);
    return () => ctx.revert();
  }, []);

  /* ══════════════════════════════════════════════════════
     SCROLL + MOUSE PARALLAX
  ══════════════════════════════════════════════════════ */
  useEffect(() => {
    const ctx = gsap.context(() => {
      const section = sectionRef.current;
      if (!section) return;

      const st = { trigger: section, start: 'top top', end: 'bottom top', scrub: 2 };

      /* Layer 2 — flowers: OPPOSING direction */
      gsap.to(flowersRef.current, {
        yPercent: 15, ease: 'none',
        scrollTrigger: st,
      });

      /* Layer 3 — gradient: very subtle drift */
      gsap.to(overlayRef.current, {
        yPercent: -4, ease: 'none',
        scrollTrigger: st,
      });

      /* Layer 4 — petals: FASTER than main image */
      gsap.to(petalsRef.current, {
        yPercent: -22, ease: 'none',
        scrollTrigger: { ...st, scrub: 1 },
      });

      /* Layer 5 — orbs depth layers */
      gsap.to(orbARef.current, {
        yPercent: 8, ease: 'none',
        scrollTrigger: st,
      });
      gsap.to(orbBRef.current, {
        yPercent: 18, ease: 'none',
        scrollTrigger: st,
      });
      gsap.to(orbCRef.current, {
        yPercent: 28, ease: 'none',
        scrollTrigger: { ...st, scrub: 1 },
      });

      /* Layer 5 — petal rotation on scroll */
      gsap.to(floatPetARef.current, {
        rotation: 20, yPercent: 22, ease: 'none',
        scrollTrigger: { ...st, scrub: 1.5 },
      });
      gsap.to(floatPetBRef.current, {
        rotation: -18, yPercent: 22, ease: 'none',
        scrollTrigger: { ...st, scrub: 1.5 },
      });

      /* Orb B counter-rotation */
      gsap.to(orbBRef.current, {
        rotation: -15, ease: 'none',
        scrollTrigger: { ...st, scrub: 2 },
      });
      gsap.to(orbCRef.current, {
        rotation: 22, ease: 'none',
        scrollTrigger: { ...st, scrub: 1 },
      });

      /* Layer 6 — text subtle upward pull */
      gsap.to(contentRef.current, {
        yPercent: -4, ease: 'none',
        scrollTrigger: { ...st, scrub: 2 },
      });

      /* Floating cards — gentle float on scroll */
      gsap.to(locationBadgeRef.current, {
        yPercent: -15, ease: 'none',
        scrollTrigger: { ...st, scrub: 3 },
      });

      /* Scroll arrow fade */
      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: '120px top',
        onUpdate: (self) => {
          if (scrollArrowRef.current) {
            gsap.to(scrollArrowRef.current, { opacity: 1 - self.progress, duration: 0.1 });
          }
        },
      });

      /* Progress bar */
      if (progressRef.current) {
        gsap.to(progressRef.current, {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: document.body,
            start: 'top top',
            end: 'bottom bottom',
            scrub: true,
          },
        });
      }

      /* ── Mouse Parallax — desktop only ─ */
      const mm = gsap.matchMedia();
      mm.add('(min-width: 769px)', () => {
        const onMouseMove = (e) => {
          const { clientX: mx, clientY: my } = e;
          const cx = window.innerWidth  / 2;
          const cy = window.innerHeight / 2;
          const dx = (mx - cx) / cx;
          const dy = (my - cy) / cy;

          gsap.to(flowersRef.current, {
            x:  dx * 8, y: dy * 5,
            duration: 0.4, ease: 'power2.out', overwrite: 'auto',
          });
          gsap.to(petalsRef.current, {
            x: -dx * 14, y: -dy * 10,
            duration: 0.4, ease: 'power2.out', overwrite: 'auto',
          });
          gsap.to(contentRef.current, {
            x: dx * 3, y: dy * 2,
            duration: 0.5, ease: 'power2.out', overwrite: 'auto',
          });
          /* Floating cards react to mouse — opposite direction for depth */
          gsap.to(locationBadgeRef.current, {
            x: -dx * 8, y: -dy * 6,
            duration: 0.7, ease: 'power2.out', overwrite: 'auto',
          });
        };

        window.addEventListener('mousemove', onMouseMove, { passive: true });
        return () => window.removeEventListener('mousemove', onMouseMove);
      });

      return () => mm.revert();
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  /* ══════════════════════════════════════════════════════
     JSX
  ══════════════════════════════════════════════════════ */
  return (
    <>
      {/* ── Scroll Progress Bar ──────────────────────────────── */}
      <div
        ref={progressRef}
        style={{
          position: 'fixed', top: 0, left: 0,
          width: '100%', height: '3px',
          background: 'var(--blue)',
          transformOrigin: 'left center', scaleX: 0,
          zIndex: 9999,
          boxShadow: '0 0 12px rgba(21,120,229,0.8)',
        }}
      />

      {/* ── Hero Section ─────────────────────────────────────── */}
      <section
        ref={sectionRef}
        id="hero"
        style={{
          position: 'relative',
          minHeight: '120vh',
          background: '#0D2B1A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >

        {/* ═══ LAYER 2 — hero-flowers.webp ═══ */}
        <img
          ref={flowersRef}
          src="/images/hero-flowers.webp"
          alt=""
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '-25%',
            left: 0,
            width: '100%',
            height: '150%',
            objectFit: 'cover',
            objectPosition: 'center 55%',
            willChange: 'transform, opacity',
            pointerEvents: 'none',
            userSelect: 'none',
            display: 'block',
          }}
        />

        {/* ═══ LAYER 3 — Gradient overlay ═══ */}
        <div
          ref={overlayRef}
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(180deg,
              rgba(13,43,26,0.92) 0%,
              rgba(13,43,26,0.75) 18%,
              rgba(11,18,32,0.65) 45%,
              rgba(11,18,32,0.78) 75%,
              rgba(11,18,32,0.92) 100%
            )`,
            pointerEvents: 'none',
            zIndex: 1,
            willChange: 'transform',
          }}
        />

        {/* ═══ LAYER 4 — hero-petals.webp ═══ */}
        <img
          ref={petalsRef}
          src="/images/hero-petals.webp"
          alt=""
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '-30%',
            left: 0,
            width: '100%',
            height: '160%',
            objectFit: 'cover',
            mixBlendMode: 'screen',
            willChange: 'transform, opacity',
            pointerEvents: 'none',
            userSelect: 'none',
            display: 'block',
            zIndex: 2,
          }}
        />

        {/* ═══ LAYER 5 — Floating orbs + petals ═══ */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none' }}>
          <div ref={orbARef} style={{
            position: 'absolute',
            top: '-80px', left: '-40px',
            width: 300, height: 300,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(21,120,229,0.18) 0%, rgba(21,120,229,0.06) 50%, transparent 70%)',
            willChange: 'transform, opacity',
          }} />
          <div ref={orbBRef} style={{
            position: 'absolute',
            bottom: '15%', right: '-20px',
            width: 160, height: 160,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(21,120,229,0.15) 0%, transparent 70%)',
            willChange: 'transform, opacity',
          }} />
          <div ref={orbCRef} style={{
            position: 'absolute',
            top: '40%', right: '25%',
            width: 80, height: 80,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(21,120,229,0.22) 0%, transparent 70%)',
            willChange: 'transform, opacity',
          }} />
          <svg
            ref={floatPetARef}
            aria-hidden="true"
            viewBox="0 0 60 60"
            width={48} height={48}
            fill="none"
            style={{
              position: 'absolute',
              left: '8%', top: '25%',
              opacity: 0,
              willChange: 'transform, opacity',
            }}
          >
            <path
              d="M30 4 C38 10, 50 22, 48 36 C46 48, 38 56, 30 56 C22 56, 14 48, 12 36 C10 22, 22 10, 30 4Z"
              fill="rgba(255,255,255,0.20)"
            />
          </svg>
          <svg
            ref={floatPetBRef}
            aria-hidden="true"
            viewBox="0 0 60 60"
            width={32} height={32}
            fill="none"
            style={{
              position: 'absolute',
              right: '12%', top: '60%',
              opacity: 0,
              willChange: 'transform, opacity',
            }}
          >
            <path
              d="M30 4 C38 10, 50 22, 48 36 C46 48, 38 56, 30 56 C22 56, 14 48, 12 36 C10 22, 22 10, 30 4Z"
              fill="rgba(255,255,255,0.16)"
            />
          </svg>
        </div>

        {/* ═══ LAYER 6 — Hero content (RESTRUCTURED CENTER LAYOUT) ═══ */}
        <div
          ref={contentRef}
          style={{
            position: 'relative',
            zIndex: 10,
            width: '100%',
            maxWidth: '1280px',
            margin: '0 auto',
            paddingLeft: 'clamp(1rem, 4vw, 2rem)',
            paddingRight: 'clamp(1rem, 4vw, 2rem)',
            paddingTop: '10rem',
            paddingBottom: '8rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            willChange: 'transform',
          }}
        >

          {/* Eyebrow */}
          <div
            ref={eyebrowRef}
            className="eyebrow"
            style={{
              opacity: 0,
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              color: '#fff',
              textShadow: '0 2px 12px rgba(0,0,0,0.6)',
            }}
          >
            <span style={{ display:'inline-block', width:'28px', height:'1px', background:'rgba(255,255,255,0.6)' }}/>
            South Florida
            <span style={{ display:'inline-block', width:'28px', height:'1px', background:'rgba(255,255,255,0.6)' }}/>
          </div>

          {/* H1 */}
          <h1 style={{ marginBottom:'0.75rem', lineHeight: 1.02, fontSize: 'clamp(42px, 10vw, 88px)', letterSpacing: '-3px' }}>
            <span
              ref={line1Ref}
              style={{
                display: 'block',
                color: 'var(--white)',
                clipPath: 'inset(0 100% 0 0)',
                willChange: 'clip-path',
                textShadow: '0 4px 32px rgba(0,0,0,0.8), 0 1px 6px rgba(0,0,0,0.5)',
              }}
            >
              Freshness You
            </span>
            <span
              ref={line2Ref}
              style={{
                display: 'block',
                color: 'var(--blue)',
                clipPath: 'inset(0 100% 0 0)',
                willChange: 'clip-path',
                textShadow: '0 4px 32px rgba(21,120,229,0.5), 0 1px 6px rgba(0,0,0,0.4)',
              }}
            >
              Can Feel.
            </span>
          </h1>

          {/* Tagline */}
          <div
            ref={taglineRef}
            style={{
              opacity: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1.5rem',
            }}
          >
            <span style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.25)', maxWidth: '48px' }} />
            <span style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 600,
              fontSize: '13px',
              letterSpacing: '2.5px',
              color: 'rgba(255,255,255,0.55)',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
              textShadow: '0 1px 8px rgba(0,0,0,0.5)',
            }}>
              Professional Cleaning You Can Count On
            </span>
            <span style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.25)', maxWidth: '48px' }} />
          </div>

          {/* Body copy */}
          <p
            ref={bodyCopyRef}
            style={{
              opacity: 0,
              color: 'rgba(255,255,255,0.78)',
              fontSize: '18px',
              lineHeight: 1.7,
              maxWidth: '540px',
              marginBottom: '2.5rem',
              textShadow: '0 1px 12px rgba(0,0,0,0.4)',
            }}
          >
            Professional cleaning for homes and businesses —{' '}
            done right, every time.
          </p>

          {/* CTA Buttons — centered row */}
          <div
            ref={buttonsRef}
            style={{
              display: 'flex',
              gap: '1rem',
              flexWrap: 'wrap',
              justifyContent: 'center',
              marginBottom: '2rem',
            }}
          >
            <a href="#cta" className="btn btn-primary btn-lg">
              Get a Free Quote
            </a>
            <a href="#services" className="btn btn-ghost btn-lg">
              Explore Services →
            </a>
          </div>

          {/* CleanPass + Trust Pills */}
          <div ref={pillsRef} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('jsl:open-membership', { detail: 'gold' }))}
                style={{
                  background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                  color: '#D97706', fontSize: '14px', fontWeight: 700,
                  fontFamily: "'Inter', sans-serif", letterSpacing: '-0.2px',
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  transition: 'opacity 0.2s',
                  textShadow: '0 1px 8px rgba(0,0,0,0.4)',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                👑 Or join CleanPass™ for ongoing member rates →
              </button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', justifyContent: 'center' }}>
              {TRUST_PILLS.map((pill) => (
                <span
                  key={pill.label}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.45rem 1rem',
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '999px',
                    color: 'rgba(255,255,255,0.75)',
                    fontSize: '13px',
                    fontWeight: 500,
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                  }}
                >
                  {pill.icon} {pill.label}
                </span>
              ))}
            </div>
          </div>

        </div>{/* /content */}



        {/* ═══ FLOATING SOCIAL PROOF — Location Badge (bottom-left) ═══ */}
        <div
          ref={locationBadgeRef}
          style={{
            position: 'absolute',
            bottom: 'clamp(100px, 14vh, 160px)',
            left: 'clamp(1.5rem, 5vw, 4rem)',
            zIndex: 12,
            opacity: 0,
            willChange: 'transform',
            pointerEvents: 'auto',
          }}
        >
          <div style={{
            background: 'rgba(255,255,255,0.10)',
            border: '1px solid rgba(255,255,255,0.18)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderRadius: '16px',
            padding: '1rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          }}>
            <span style={{
              fontSize: '24px',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(21,120,229,0.15)',
              borderRadius: '12px',
            }}>📍</span>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '14px', color: 'var(--white)', lineHeight: 1.2 }}>
                South Florida
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)' }}>
                Serving Your Area
              </div>
            </div>
          </div>
        </div>

        {/* Stats ribbon hidden — ref kept for GSAP context safety */}
        <div ref={statsRowRef} style={{ display: 'none' }} />

        {/* ── Scroll Arrow ─────────────────────────────────── */}
        <div
          ref={scrollArrowRef}
          style={{
            position: 'absolute',
            bottom: '2.5rem',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 20,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.3rem',
          }}
        >
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 600 }}>
            Scroll
          </span>
          <div style={{ animation: 'bounceArrow 1.6s ease-in-out infinite' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M6 9L12 15L18 9" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* ── Bottom fade vignette ──────────────────────────── */}
        <div style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          height: '180px',
          background: 'linear-gradient(to top, #0B1220 0%, transparent 100%)',
          pointerEvents: 'none',
          zIndex: 5,
        }} />

        {/* ── Responsive overrides ──────────────────────────── */}
        <style>{`
          @keyframes bounceArrow {
            0%, 100% { transform: translateY(0); }
            50%       { transform: translateY(8px); }
          }

          /* Hide floating cards on mobile — they'd overlap text */
          @media (max-width: 900px) {
            #hero > div[style*="position: absolute"][style*="top: clamp"],
            #hero > div[style*="position: absolute"][style*="bottom: clamp"] {
              display: none !important;
            }
          }
        `}</style>

      </section>
    </>
  );
}
