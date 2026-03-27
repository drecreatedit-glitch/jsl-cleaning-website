import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function CTABanner() {
  const sectionRef  = useRef(null);
  const wipeRef     = useRef(null);   // overlay that slides away (clip reveal)
  const bgImgRef    = useRef(null);   // parallax image
  const contentRef  = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {

      /* ── Parallax on background image ─────────────────── */
      gsap.fromTo(bgImgRef.current,
        { y: '-12%' },
        {
          y: '12%',
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        }
      );

      /* ── Clip-reveal wipe: dark overlay slides left → off ─ */
      gsap.fromTo(wipeRef.current,
        { scaleX: 1, transformOrigin: 'left center' },
        {
          scaleX: 0,
          ease: 'power3.inOut',
          duration: 1,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 72%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      /* ── Content fades up after wipe ─────────────────── */
      gsap.fromTo(contentRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0,
          duration: 0.8, ease: 'power3.out',
          delay: 0.35,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 72%',
            toggleActions: 'play none none reverse',
          },
        }
      );

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="cta"
      style={{
        position: 'relative',
        overflow: 'hidden',
        minHeight: '520px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* ── Parallax background image ────────────────────── */}
      <img
        ref={bgImgRef}
        src="https://images.unsplash.com/photo-1527515637462-cff94edd56f9?w=1600&q=80"
        alt=""
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '130%',
          top: '-15%',
          objectFit: 'cover',
          willChange: 'transform',
          zIndex: 0,
        }}
      />

      {/* ── Gradient overlay ─────────────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, rgba(11,18,32,0.90) 0%, rgba(21,120,229,0.45) 100%)',
        zIndex: 1,
        pointerEvents: 'none',
      }} />

      {/* ── Wipe overlay (slides away on scroll) ─────────── */}
      <div
        ref={wipeRef}
        style={{
          position: 'absolute', inset: 0,
          background: '#06101E',
          zIndex: 2,
          transformOrigin: 'left center',
        }}
      />

      {/* ── Content ──────────────────────────────────────── */}
      <div
        ref={contentRef}
        style={{
          position: 'relative', zIndex: 3,
          textAlign: 'center',
          padding: '5rem 2rem',
          maxWidth: '780px',
          margin: '0 auto',
          opacity: 0,
        }}
      >
        {/* Eyebrow pill */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'rgba(255,255,255,0.12)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '999px',
          padding: '0.4rem 1.1rem',
          marginBottom: '1.5rem',
          backdropFilter: 'blur(8px)',
        }}>
          <span style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 700,
            fontSize: '11px',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.85)',
          }}>
            Ready to Get Started?
          </span>
        </div>

        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: 'clamp(36px, 5vw, 64px)',
          letterSpacing: '-2px',
          color: '#fff',
          lineHeight: 1.05,
          marginBottom: '1.25rem',
        }}>
          Book Your Clean Today.
        </h2>

        <p style={{
          fontSize: '18px',
          color: 'rgba(255,255,255,0.75)',
          lineHeight: 1.65,
          marginBottom: '2rem',
        }}>
          No commitment required. Get a free quote in minutes.
        </p>

        {/* Contact row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2rem',
          flexWrap: 'wrap',
          marginBottom: '2.5rem',
        }}>
          <a href="tel:3479546309" style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            color: 'rgba(255,255,255,0.8)',
            textDecoration: 'none',
            fontSize: '15px', fontWeight: 600,
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}>
            <span style={{ fontSize: '18px' }}>📞</span>
            (347) 954-6309
          </a>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '18px' }}>·</span>
          <a href="mailto:jlopez@jslcleaningservices.com" style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            color: 'rgba(255,255,255,0.8)',
            textDecoration: 'none',
            fontSize: '15px', fontWeight: 600,
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}>
            <span style={{ fontSize: '18px' }}>✉️</span>
            jlopez@jslcleaningservices.com
          </a>
        </div>

        {/* CTA Button */}
        <a
          href="mailto:jlopez@jslcleaningservices.com"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '1.1rem 2.75rem',
            background: '#fff',
            color: 'var(--dark)',
            borderRadius: '999px',
            fontFamily: 'var(--font-body)',
            fontWeight: 700,
            fontSize: '16px',
            textDecoration: 'none',
            letterSpacing: '0.1px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
            transition: 'transform 0.22s var(--ease-expo), box-shadow 0.22s var(--ease-expo)',
            position: 'relative',
            overflow: 'hidden',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'scale(1.03)';
            e.currentTarget.style.boxShadow = '0 18px 55px rgba(21,120,229,0.35), 0 4px 20px rgba(0,0,0,0.2)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.25)';
          }}
        >
          Get a Free Quote
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round">
            <line x1="7" y1="17" x2="17" y2="7"/>
            <polyline points="7 7 17 7 17 17"/>
          </svg>
        </a>
      </div>
    </section>
  );
}
