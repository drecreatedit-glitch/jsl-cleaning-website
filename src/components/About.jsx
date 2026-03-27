import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ─── Checklist data ─────────────────────────────────────── */
const CHECKLIST = [
  'All supplies & equipment included',
  'Fully insured for your peace of mind',
  'Flexible daily, weekly, bi-weekly, monthly scheduling',
  'South Florida & Tampa Bay Area coverage',
  '100% satisfaction guarantee on every job',
];

/* ─── Green check icon ───────────────────────────────────── */
const GreenCheck = () => (
  <span style={{
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    background: 'rgba(21,120,229,0.10)',
    flexShrink: 0,
    marginTop: '2px',
  }}>
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M2.5 6l2.5 2.5 5-5"
        stroke="#1578E5" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </span>
);

export default function About() {
  const sectionRef   = useRef(null);
  const imgWrapRef   = useRef(null);   // img container (clips parallax)
  const imgRef       = useRef(null);   // img itself (moves inside container)
  const rightColRef  = useRef(null);
  const checkRef     = useRef(null);
  const panoBgRef    = useRef(null);   // panoramic image (moves horizontally)
  const panoWrapRef  = useRef(null);

  /* ── Animations ──────────────────────────────────────────*/
  useEffect(() => {
    const ctx = gsap.context(() => {

      /* 1. Left image parallax — image moves up at 0.3× scrub speed */
      gsap.fromTo(imgRef.current,
        { y: 0 },
        {
          y: '-30%',
          ease: 'none',
          scrollTrigger: {
            trigger: imgWrapRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        }
      );

      /* 2. Right column slides in from right */
      gsap.fromTo(rightColRef.current,
        { opacity: 0, x: 60 },
        {
          opacity: 1, x: 0, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: rightColRef.current, start: 'top 75%' },
        }
      );

      /* 3. Checklist items stagger */
      if (checkRef.current) {
        gsap.fromTo(checkRef.current.children,
          { opacity: 0, x: 30 },
          {
            opacity: 1, x: 0,
            duration: 0.4,
            ease: 'power2.out',
            stagger: 0.1,
            scrollTrigger: { trigger: checkRef.current, start: 'top 80%' },
          }
        );
      }

      /* 4. Panoramic banner — image drifts horizontally at 0.25× */
      gsap.fromTo(panoBgRef.current,
        { x: '0%' },
        {
          x: '-8%',
          ease: 'none',
          scrollTrigger: {
            trigger: panoWrapRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        }
      );

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="section-py"
      style={{ background: 'var(--blue-xlight)' }}
    >
      <div className="container-xl">

        {/* ── Two-column split ────────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'clamp(2.5rem, 5vw, 4rem)',
          alignItems: 'center',
          marginBottom: 'clamp(3rem, 5vw, 4.5rem)',
        }}>

          {/* ── Left — image panel ────────────────────── */}
          <div
            ref={imgWrapRef}
            style={{
              position: 'relative',
              height: '480px',
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(21,120,229,0.12), 0 4px 20px rgba(0,0,0,0.08)',
            }}
          >
            {/* Parallax image — slightly taller so it can travel up */}
            <img
              ref={imgRef}
              src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=900&q=80"
              alt="JSL professional cleaner at work"
              style={{
                position: 'absolute',
                top: '-15%',
                left: 0,
                width: '100%',
                height: '130%',
                objectFit: 'cover',
                willChange: 'transform',
              }}
            />

            {/* Bottom gradient overlay */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(11,18,32,0.62) 0%, transparent 60%)',
              zIndex: 2,
              pointerEvents: 'none',
            }} />

            {/* Floating trust badge */}
            <div style={{
              position: 'absolute',
              bottom: '1.75rem',
              left: '1.75rem',
              zIndex: 10,
              background: '#fff',
              borderRadius: '999px',
              padding: '0.6rem 1.1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              boxShadow: '0 8px 30px rgba(0,0,0,0.18)',
            }}>
              {/* Animated green dot */}
              <span style={{ position: 'relative', display: 'inline-flex' }}>
                <span style={{
                  width: '9px', height: '9px',
                  borderRadius: '50%',
                  background: '#22C55E',
                  display: 'block',
                  position: 'relative',
                  zIndex: 1,
                }} />
                <span style={{
                  position: 'absolute',
                  inset: '-3px',
                  borderRadius: '50%',
                  background: 'rgba(34,197,94,0.25)',
                  animation: 'pulse 2s ease-in-out infinite',
                }} />
              </span>
              <span style={{
                fontFamily: 'var(--font-body)',
                fontWeight: 600,
                fontSize: '13px',
                color: 'var(--dark)',
                whiteSpace: 'nowrap',
              }}>
                Always On Time. Always Thorough.
              </span>
            </div>
          </div>

          {/* ── Right — text content ─────────────────── */}
          <div ref={rightColRef} style={{ opacity: 0 }}>

            <div className="eyebrow" style={{ marginBottom: '1rem' }}>About JSL</div>
            <h2 style={{ marginBottom: '1.5rem', maxWidth: '460px' }}>
              Built on Trust,<br />Delivered with Care.
            </h2>

            <p style={{
              fontSize: '16.5px',
              lineHeight: 1.75,
              color: 'var(--gray)',
              marginBottom: '1.25rem',
              maxWidth: '480px',
            }}>
              JSL Cleaning Services was built on one simple belief: your space should
              always feel fresh, safe, and welcoming — whether it's your home or your
              workplace.
            </p>

            <p style={{
              fontSize: '16.5px',
              lineHeight: 1.75,
              color: 'var(--gray)',
              marginBottom: '2rem',
              maxWidth: '480px',
            }}>
              Led by Josh, our trained team shows up on time, brings all supplies, and
              doesn't leave until every corner is clean. That's our standard —
              every single visit.
            </p>

            {/* Animated checklist */}
            <ul
              ref={checkRef}
              style={{
                listStyle: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem',
              }}
            >
              {CHECKLIST.map(item => (
                <li
                  key={item}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    opacity: 0, /* GSAP animates in */
                    fontSize: '15px',
                    fontWeight: 500,
                    color: 'var(--dark)',
                    lineHeight: 1.45,
                  }}
                >
                  <GreenCheck />
                  {item}
                </li>
              ))}
            </ul>

          </div>
        </div>

        {/* ── Panoramic banner strip ───────────────────── */}
        <div
          ref={panoWrapRef}
          style={{
            position: 'relative',
            height: '280px',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 10px 40px rgba(21,120,229,0.10)',
          }}
        >
          {/* Panoramic image — slightly wider so it can drift left */}
          <img
            ref={panoBgRef}
            src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=80"
            alt="JSL Cleaning — professional move-out service"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '115%',
              height: '100%',
              objectFit: 'cover',
              willChange: 'transform',
            }}
          />

          {/* Dark overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(11,18,32,0.52)',
            zIndex: 2,
            pointerEvents: 'none',
          }} />

          {/* Centered text overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '2rem',
          }}>
            {/* Decorative line */}
            <div style={{
              width: '40px', height: '2px',
              background: 'var(--blue)',
              borderRadius: '999px',
              marginBottom: '1rem',
              boxShadow: '0 0 12px rgba(21,120,229,0.7)',
            }} />
            <h3 style={{
              color: '#fff',
              fontSize: 'clamp(20px, 2.5vw, 30px)',
              letterSpacing: '-0.5px',
              lineHeight: 1.2,
              maxWidth: '600px',
              margin: 0,
            }}>
              Serving South Florida &amp; Tampa Bay Since Day One.
            </h3>
            <p style={{
              color: 'rgba(255,255,255,0.6)',
              fontSize: '14px',
              marginTop: '0.75rem',
              fontWeight: 500,
              letterSpacing: '0.5px',
            }}>
              (347) 954-6309 &nbsp;·&nbsp; jlopez@jslcleaningservices.com
            </p>
          </div>
        </div>

      </div>

      {/* Pulse keyframe for green dot */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50%       { transform: scale(1.6); opacity: 0; }
        }
      `}</style>
    </section>
  );
}
