import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ─── Trust pills data ───────────────────────────────────── */
const TRUST_PILLS = [
  { icon: '🛡️', label: 'Fully Insured' },
  { icon: '🧴', label: 'Supplies Included' },
  { icon: '🌿', label: 'Eco-Friendly' },
  { icon: '💰', label: 'Recurring Discounts' },
];

export default function Hero() {
  /* refs ─ DOM */
  const sectionRef     = useRef(null);
  const bgImageRef     = useRef(null);
  const orb1Ref        = useRef(null);
  const orb2Ref        = useRef(null);
  const orb3Ref        = useRef(null);
  const eyebrowRef     = useRef(null);
  const line1Ref       = useRef(null);
  const line2Ref       = useRef(null);
  const taglineRef     = useRef(null);
  const bodyCopyRef    = useRef(null);
  const buttonsRef     = useRef(null);
  const pillsRef       = useRef(null);
  const floatingCardRef= useRef(null);
  const scrollArrowRef = useRef(null);
  const progressRef    = useRef(null);
  const headlineRef    = useRef(null);

  /* ── Page‑load GSAP timeline ───────────────────────────── */
  useEffect(() => {
    const ctx = gsap.context(() => {

      /* 1 — Background image */
      gsap.fromTo(bgImageRef.current,
        { opacity: 0, scale: 1.05 },
        { opacity: 1, scale: 1, duration: 0.8, ease: 'power2.out' }
      );

      /* 2 — Eyebrow */
      gsap.fromTo(eyebrowRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', delay: 0.3 }
      );

      /* 3 — H1 line 1 — clip path left→right */
      gsap.fromTo(line1Ref.current,
        { clipPath: 'inset(0 100% 0 0)', opacity: 1 },
        { clipPath: 'inset(0 0% 0 0)', duration: 0.6, ease: 'power3.out', delay: 0.5 }
      );

      /* 4 — H1 line 2 — clip path left→right */
      gsap.fromTo(line2Ref.current,
        { clipPath: 'inset(0 100% 0 0)', opacity: 1 },
        { clipPath: 'inset(0 0% 0 0)', duration: 0.6, ease: 'power3.out', delay: 0.7 }
      );

      /* 5 — Tagline */
      gsap.fromTo(taglineRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out', delay: 0.9 }
      );

      /* 6 — Body copy */
      gsap.fromTo(bodyCopyRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out', delay: 1.0 }
      );

      /* 7 — Buttons */
      gsap.fromTo(buttonsRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', delay: 1.1 }
      );

      /* 8 — Trust pills stagger */
      if (pillsRef.current) {
        gsap.fromTo(pillsRef.current.children,
          { opacity: 0, y: 14, scale: 0.94 },
          {
            opacity: 1, y: 0, scale: 1,
            duration: 0.3,
            ease: 'power2.out',
            stagger: 0.08,
            delay: 1.2,
          }
        );
      }

      /* 9 — Floating card */
      gsap.fromTo(floatingCardRef.current,
        { opacity: 0, x: 40, scale: 0.92 },
        { opacity: 1, x: 0, scale: 1, duration: 0.6, ease: 'power3.out', delay: 1.3 }
      );

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  /* ── Scroll‑driven parallax via ScrollTrigger ──────────── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      const section = sectionRef.current;

      /* BG image — 0.4× speed */
      gsap.to(bgImageRef.current, {
        y: '40%',
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });

      /* Orbs — 0.2× speed */
      [orb1Ref, orb2Ref, orb3Ref].forEach((orbRef, i) => {
        gsap.to(orbRef.current, {
          y: `${20 + i * 8}%`,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });
      });

      /* Headline — subtle upward pull (-0.05×) */
      gsap.to(headlineRef.current, {
        y: '-5%',
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });

      /* Floating card — drifts down (0.15×) */
      gsap.to(floatingCardRef.current, {
        y: '15%',
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });

      /* Scroll arrow — fade out after 100px scroll */
      ScrollTrigger.create({
        trigger: document.body,
        start: 'top top',
        end: '100px top',
        onUpdate: (self) => {
          gsap.to(scrollArrowRef.current, {
            opacity: 1 - self.progress,
            duration: 0.1,
          });
        },
      });

      /* Progress bar — full-page width 0→100% */
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

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <>
      {/* ── Scroll Progress Bar ──────────────────────────── */}
      <div
        ref={progressRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '3px',
          background: 'var(--blue)',
          transformOrigin: 'left center',
          scaleX: 0,
          zIndex: 9999,
          boxShadow: '0 0 12px rgba(21,120,229,0.8)',
        }}
      />

      {/* ── Hero Section ─────────────────────────────────── */}
      <section
        ref={sectionRef}
        id="hero"
        style={{
          position: 'relative',
          minHeight: '100vh',
          background: 'var(--dark)',
          display: 'flex',
          alignItems: 'center',
        }}
      >

        {/* ── BG Image — Layer 1 ──────────────────────── */}
        <div
          ref={bgImageRef}
          style={{
            position: 'absolute',
            inset: '-20% 0',
            backgroundImage: 'url(https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1600&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.18)',
            willChange: 'transform',
          }}
        />

        {/* ── Blue Orbs — Layer 2 ─────────────────────── */}
        {/* Orb 1 — top right */}
        <div ref={orb1Ref} style={{
          position: 'absolute', top: '-10%', right: '-5%',
          width: '600px', height: '600px',
          background: 'radial-gradient(circle, rgba(21,120,229,0.15) 0%, transparent 70%)',
          filter: 'blur(80px)',
          willChange: 'transform',
          pointerEvents: 'none',
        }} />
        {/* Orb 2 — bottom left */}
        <div ref={orb2Ref} style={{
          position: 'absolute', bottom: '-15%', left: '-10%',
          width: '700px', height: '700px',
          background: 'radial-gradient(circle, rgba(21,120,229,0.10) 0%, transparent 70%)',
          filter: 'blur(80px)',
          willChange: 'transform',
          pointerEvents: 'none',
        }} />
        {/* Orb 3 — center */}
        <div ref={orb3Ref} style={{
          position: 'absolute', top: '30%', left: '35%',
          width: '500px', height: '500px',
          background: 'radial-gradient(circle, rgba(21,120,229,0.08) 0%, transparent 70%)',
          filter: 'blur(80px)',
          willChange: 'transform',
          pointerEvents: 'none',
        }} />

        {/* ── Content container ───────────────────────── */}
        <div className="container-xl" style={{
          position: 'relative',
          zIndex: 10,
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: '3rem',
          alignItems: 'center',
          paddingTop: '6rem',
          paddingBottom: '6rem',
        }}>

          {/* ─ Left column ─────────────────────────────── */}
          <div ref={headlineRef} style={{ maxWidth: '780px' }}>

            {/* Eyebrow */}
            <div
              ref={eyebrowRef}
              className="eyebrow"
              style={{
                opacity: 0,
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span style={{
                display:'inline-block',
                width:'20px', height:'1px',
                background:'var(--blue)',
              }}/>
              South Florida &amp; Tampa Bay Area
            </div>

            {/* H1 */}
            <h1 style={{ marginBottom:'0.6rem', lineHeight: 1.02, fontSize: 'clamp(42px, 10vw, 78px)' }}>
              <span
                ref={line1Ref}
                style={{
                  display: 'block',
                  color: 'var(--white)',
                  clipPath: 'inset(0 100% 0 0)',
                  willChange: 'clip-path',
                  textShadow: '0 2px 24px rgba(0,0,0,0.6)',
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
                  textShadow: '0 2px 24px rgba(21,120,229,0.3)',
                }}
              >
                Can Feel.
              </span>
            </h1>

            {/* Tagline */}
            <p
              ref={taglineRef}
              style={{
                opacity: 0,
                fontFamily: 'var(--font-display)',
                fontVariant: 'small-caps',
                fontSize: 'clamp(14px, 1.2vw, 18px)',
                color: 'rgba(255,255,255,0.80)',
                letterSpacing: '1.5px',
                marginBottom: '1.25rem',
                textShadow: '0 1px 8px rgba(0,0,0,0.5)',
              }}
            >
              A Fragrance You Can Trust
            </p>

            {/* Body copy */}
            <p
              ref={bodyCopyRef}
              style={{
                opacity: 0,
                color: 'rgba(255,255,255,0.82)',
                fontSize: '17px',
                lineHeight: 1.7,
                maxWidth: '500px',
                marginBottom: '2.25rem',
                textShadow: '0 1px 12px rgba(0,0,0,0.4)',
              }}
            >
              Professional cleaning for homes and businesses —{' '}
              done right, every time.
            </p>

            {/* CTA Buttons */}
            <div
              ref={buttonsRef}
              style={{
                opacity: 0,
                display: 'flex',
                gap: '1rem',
                flexWrap: 'wrap',
                marginBottom: '2.5rem',
              }}
            >
              <a href="#pricing" className="btn btn-primary btn-lg">
                Book a Service
              </a>
              <a href="#services" className="btn btn-ghost btn-lg">
                Explore Services →
              </a>
            </div>

            {/* Trust Pills */}
            {/* CleanPass entry point */}
            <div style={{ marginBottom: '1.5rem', opacity: 0 }} ref={pillsRef}>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('jsl:open-membership', { detail: 'gold' }))}
                style={{
                  background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                  color: '#D97706', fontSize: '14px', fontWeight: 700,
                  fontFamily: "'DM Sans', sans-serif", letterSpacing: '-0.2px',
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

            {/* Trust Pills (moved to separate ref below) */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.65rem',
              }}
            >
              {TRUST_PILLS.map((pill) => (
                <span
                  key={pill.label}
                  style={{
                    opacity: 0,
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

          {/* ─ Right column — Floating Card ─────────────── */}
          <div
            ref={floatingCardRef}
            style={{
              opacity: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              willChange: 'transform',
            }}
          >
            {/* Main card */}
            <div style={{
              background: 'rgba(255,255,255,0.97)',
              borderRadius: '20px',
              padding: '2rem',
              minWidth: '220px',
              boxShadow: '0 20px 60px rgba(21,120,229,0.25), 0 4px 20px rgba(0,0,0,0.3)',
              textAlign: 'center',
            }}>
              {/* Stars */}
              <div style={{
                fontSize: '22px',
                letterSpacing: '2px',
                marginBottom: '0.5rem',
                color: '#F59E0B',
              }}>
                ★★★★★
              </div>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '28px',
                color: 'var(--dark)',
                letterSpacing: '-1px',
                lineHeight: 1,
              }}>
                5.0
              </div>
              <div style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--gray)',
                marginBottom: '1rem',
              }}>
                Google Rating
              </div>
              <div style={{
                background: 'var(--blue-light)',
                borderRadius: '12px',
                padding: '0.6rem 1rem',
              }}>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: '22px',
                  color: 'var(--blue)',
                  letterSpacing: '-0.5px',
                }}>
                  500+
                </div>
                <div style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--gray)',
                }}>
                  Clients Served
                </div>
              </div>
            </div>

            {/* Location badge card */}
            <div style={{
              background: 'rgba(255,255,255,0.10)',
              border: '1px solid rgba(255,255,255,0.15)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              borderRadius: '16px',
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
            }}>
              <span style={{ fontSize: '20px' }}>📍</span>
              <div>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '13px',
                  color: 'var(--white)',
                  lineHeight: 1.2,
                }}>
                  South Florida
                </div>
                <div style={{
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.55)',
                }}>
                  &amp; Tampa Bay Area
                </div>
              </div>
            </div>
          </div>

        </div>{/* /container-xl */}

        {/* ── Scroll Arrow ─────────────────────────────── */}
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

        {/* ── Bottom fade vignette ─────────────────────── */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '180px',
          background: 'linear-gradient(to top, var(--dark) 0%, transparent 100%)',
          pointerEvents: 'none',
          zIndex: 5,
        }} />

      </section>

      {/* ── Bounce keyframe ─────────────────────────────── */}
      <style>{`
        @keyframes bounceArrow {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(8px); }
        }
      `}</style>
    </>
  );
}
