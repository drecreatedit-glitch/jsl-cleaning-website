import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ─── Step data ──────────────────────────────────────────── */
const STEPS = [
  {
    n: 1,
    title: 'Book Online or Call',
    body: 'Choose your service and pick a time that works. Call (347) 954-6309 or message us — we\'ll get you set up in minutes.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
  },
  {
    n: 2,
    title: 'We Show Up Ready',
    body: 'Our trained team arrives on time with all supplies. No coordination needed on your end — we handle everything start to finish.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <polyline points="9 12 11 14 15 10"/>
      </svg>
    ),
  },
  {
    n: 3,
    title: 'You Enjoy the Results',
    body: 'Walk into a spotless space. Not 100% satisfied? We make it right — that\'s our guarantee, every single time.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
  },
];

export default function HowItWorks() {
  const sectionRef  = useRef(null);
  const headerRef   = useRef(null);
  const lineRef     = useRef(null);   // SVG path
  const circleRefs  = useRef([]);     // 3 circle wrappers
  const cardRefs    = useRef([]);     // 3 step cards
  const ctaRef      = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      /* ── Header fade-up ─────────────────────────────────── */
      gsap.fromTo(headerRef.current,
        { opacity: 0, y: 36 },
        {
          opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
          scrollTrigger: { trigger: headerRef.current, start: 'top 80%' },
        }
      );

      /* ── Prep: path length is fixed (viewBox width = 1000) ── */
      const path = lineRef.current;
      if (!path) return;

      const setupAnimation = () => {
        const len = 1000; // matches viewBox width so no DOM measure needed
        gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });

        /* ── Scroll-scrubbed line draw ───────────────────────── */
        const lineTl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 60%',
            end: 'center 40%',
            scrub: 0.8,
          },
        });
        lineTl.to(path, { strokeDashoffset: 0, ease: 'none' });

        /* ── Step activation at 0%, 50%, 100% of the scrub ──── */
        const activateStep = (i, progress) => {
          ScrollTrigger.create({
            trigger: sectionRef.current,
            start: `top+=${progress * 100}% 60%`,
            onEnter: () => triggerStep(i),
            onLeaveBack: () => resetStep(i),
          });
        };

        const triggerStep = (i) => {
          const circle = circleRefs.current[i];
          const card   = cardRefs.current[i];
          if (!circle || !card) return;

          // Circle fill
          gsap.to(circle.querySelector('.circle-bg'), {
            backgroundColor: '#1578E5',
            borderColor: '#1578E5',
            duration: 0.35, ease: 'power2.out',
          });
          gsap.to(circle.querySelector('.circle-num'), {
            color: '#fff',
            duration: 0.25,
          });
          gsap.to(circle.querySelector('.circle-icon'), {
            color: '#fff',
            duration: 0.25,
          });

          // Card scales in
          gsap.to(card, {
            opacity: 1, y: 0, scale: 1,
            duration: 0.5, ease: 'power3.out',
          });
        };

        const resetStep = (i) => {
          const circle = circleRefs.current[i];
          const card   = cardRefs.current[i];
          if (!circle || !card) return;

          gsap.to(circle.querySelector('.circle-bg'), {
            backgroundColor: '#fff',
            borderColor: '#D8E6F8',
            duration: 0.3,
          });
          gsap.to(circle.querySelector('.circle-num'), {
            color: 'var(--dark)',
            duration: 0.2,
          });
          gsap.to(circle.querySelector('.circle-icon'), {
            color: 'var(--gray)',
            duration: 0.2,
          });
          gsap.to(card, {
            opacity: 0, y: 20, scale: 0.95,
            duration: 0.3,
          });
        };

        activateStep(0, 0);
        activateStep(1, 0.35);
        activateStep(2, 0.7);

        /* ── CTA button fades in after step 3 ───────────────── */
        gsap.fromTo(ctaRef.current,
          { opacity: 0, y: 20 },
          {
            opacity: 1, y: 0, duration: 0.6, ease: 'power3.out',
            scrollTrigger: { trigger: ctaRef.current, start: 'top 85%' },
          }
        );
      };

      requestAnimationFrame(setupAnimation);

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="section-py"
      style={{ background: '#fff', position: 'relative', overflow: 'hidden' }}
    >
      {/* Subtle corner orbs */}
      <div style={{
        position: 'absolute', top: '-60px', right: '-60px',
        width: '300px', height: '300px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(21,120,229,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="container-xl">

        {/* ── Header ──────────────────────────────────────── */}
        <div
          ref={headerRef}
          style={{ textAlign: 'center', marginBottom: '5rem', opacity: 0 }}
        >
          <div className="eyebrow" style={{ marginBottom: '0.75rem' }}>How It Works</div>
          <h2 style={{ marginBottom: '1rem' }}>Getting Started Takes 2 Minutes.</h2>
          <p style={{ maxWidth: '480px', margin: '0 auto', fontSize: '17px' }}>
            Flexible booking, professional results, guaranteed satisfaction.
          </p>
        </div>

        {/* ── Timeline container ───────────────────────────── */}
        <div style={{ position: 'relative' }}>

          {/* ── SVG connecting line (desktop) ──────────────── */}
          <svg
            aria-hidden="true"
            viewBox="0 0 1000 4"
            preserveAspectRatio="none"
            style={{
              position: 'absolute',
              top: '24px',          /* center on 52px circles */
              left: 'calc(16.67%)',
              width: 'calc(66.67%)',
              height: '4px',
              overflow: 'visible',
              zIndex: 0,
              pointerEvents: 'none',
            }}
          >
            {/* Track (dashed grey) */}
            <path d="M 0 2 H 1000"
              stroke="var(--border)" strokeWidth="2"
              strokeDasharray="12 8" fill="none" />
            {/* Animated draw line (blue) */}
            <path
              ref={lineRef}
              d="M 0 2 H 1000"
              stroke="var(--blue)"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
          </svg>

          {/* ── Three step columns ────────────────────────── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '2rem',
            position: 'relative',
            zIndex: 1,
          }}>
            {STEPS.map((step, i) => (
              <div
                key={step.n}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
              >
                {/* ── Circle ─────────────────────────────── */}
                <div
                  ref={el => circleRefs.current[i] = el}
                  style={{ marginBottom: '2rem', position: 'relative' }}
                >
                  <div
                    className="circle-bg"
                    style={{
                      width: '52px', height: '52px',
                      borderRadius: '50%',
                      border: '2px solid var(--border)',
                      background: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      boxShadow: '0 2px 12px rgba(21,120,229,0.06)',
                      transition: 'box-shadow 0.3s ease',
                    }}
                  >
                    <span
                      className="circle-num"
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 800,
                        fontSize: '18px',
                        color: 'var(--dark)',
                        lineHeight: 1,
                        position: 'absolute',
                        top: '-22px',
                        right: '-22px',
                        width: '20px', height: '20px',
                        fontSize: '10px',
                        fontWeight: 700,
                        background: 'var(--blue-light)',
                        color: 'var(--blue)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid var(--border)',
                      }}
                    >
                      {step.n}
                    </span>
                    {/* Icon */}
                    <span
                      className="circle-icon"
                      style={{ color: 'var(--gray)' }}
                    >
                      {step.icon}
                    </span>
                  </div>
                </div>

                {/* ── Step card ──────────────────────────── */}
                <div
                  ref={el => cardRefs.current[i] = el}
                  style={{
                    textAlign: 'center',
                    maxWidth: '300px',
                    opacity: 0,
                    transform: 'translateY(20px) scale(0.95)',
                    willChange: 'transform, opacity',
                  }}
                >
                  <h3 style={{
                    fontSize: 'clamp(18px, 1.6vw, 22px)',
                    letterSpacing: '-0.3px',
                    color: 'var(--dark)',
                    marginBottom: '0.75rem',
                    lineHeight: 1.2,
                  }}>
                    {step.title}
                  </h3>
                  <p style={{
                    fontSize: '15.5px',
                    lineHeight: 1.72,
                    color: 'var(--gray)',
                  }}>
                    {step.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Inline CTA ───────────────────────────────────── */}
        <div
          ref={ctaRef}
          style={{
            marginTop: '4rem',
            textAlign: 'center',
            opacity: 0,
          }}
        >
          <p style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 600,
            fontSize: '16px',
            color: 'var(--gray)',
            marginBottom: '1.25rem',
          }}>
            Ready to get started?
          </p>
          <a
            href="mailto:jlopez@jslcleaningservices.com"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.95rem 2.25rem',
              background: 'var(--blue)',
              color: '#fff',
              borderRadius: '10px',
              fontFamily: 'var(--font-body)',
              fontWeight: 700,
              fontSize: '15px',
              textDecoration: 'none',
              letterSpacing: '0.2px',
              boxShadow: '0 8px 30px rgba(21,120,229,0.35)',
              transition: 'transform 0.2s var(--ease-expo), box-shadow 0.2s var(--ease-expo)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 14px 40px rgba(21,120,229,0.45)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(21,120,229,0.35)';
            }}
          >
            Get a Free Quote
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="7" y1="17" x2="17" y2="7"/>
              <polyline points="7 7 17 7 17 17"/>
            </svg>
          </a>
          <p style={{
            marginTop: '0.9rem',
            fontSize: '13px',
            color: 'var(--gray)',
            opacity: 0.7,
          }}>
            Or call us directly: <a href="tel:3479546309"
              style={{ color: 'var(--blue)', fontWeight: 600, textDecoration: 'none' }}>
              (347) 954-6309
            </a>
          </p>
        </div>

      </div>
    </section>
  );
}
