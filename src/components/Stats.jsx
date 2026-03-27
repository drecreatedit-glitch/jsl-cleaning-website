import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ─── Data ───────────────────────────────────────────────── */
const STATS = [
  { value: 500,  suffix: '+', label: 'Happy Clients',          duration: 1.8, decimals: 0 },
  { value: 5.0,  suffix: '★', label: 'Google Rating',          duration: 1.2, decimals: 1 },
  { value: 6,    suffix: '',  label: 'Service Types',           duration: 0.8, decimals: 0 },
  { value: 100,  suffix: '%', label: 'Satisfaction Guarantee',  duration: 2.0, decimals: 0 },
];

const TESTIMONIALS = [
  {
    stars: 5,
    quote: 'JSL completely transformed our office. Professional, thorough, and always on time. We\'ve been using them for over a year.',
    name: 'Marcus T.',
    location: 'Brickell, Miami',
    tag: 'Commercial Client',
  },
  {
    stars: 5,
    quote: 'Best Airbnb cleaning service I\'ve found. My guests always comment on how clean everything is. JSL keeps my ratings high.',
    name: 'Priya M.',
    location: 'Tampa Bay',
    tag: 'Airbnb Host',
  },
  {
    stars: 5,
    quote: 'The move-out clean was phenomenal. Landlord said it was one of the cleanest he\'d seen in years. Got my full deposit back.',
    name: 'Devon A.',
    location: 'Doral, FL',
    tag: 'Move-Out Clean',
  },
];

const MARQUEE_ITEMS = [
  'Google Reviews ★★★★★',
  'Fully Insured',
  'Supplies Included',
  'South Florida',
  'Tampa Bay Area',
  '100% Guarantee',
  'Background Checked',
];

/* ─── Stars ──────────────────────────────────────────────── */
const Stars = ({ count }) => (
  <div style={{ display: 'flex', gap: '3px', marginBottom: '1rem' }}>
    {Array.from({ length: count }).map((_, i) => (
      <span key={i} style={{ color: '#FBBF24', fontSize: '14px' }}>★</span>
    ))}
  </div>
);

/* ─── Stat counter ───────────────────────────────────────── */
function StatItem({ stat, index, triggerRef }) {
  const numRef  = useRef(null);
  const wrapRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      /* Fade-up entrance, staggered */
      gsap.fromTo(wrapRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0,
          duration: 0.6, ease: 'power3.out',
          delay: index * 0.12,
          scrollTrigger: { trigger: triggerRef.current, start: 'top 75%' },
        }
      );

      /* Counter */
      const obj = { val: 0 };
      gsap.to(obj, {
        val: stat.value,
        duration: stat.duration,
        ease: 'power2.out',
        delay: index * 0.12,
        scrollTrigger: { trigger: triggerRef.current, start: 'top 75%' },
        onUpdate() {
          if (!numRef.current) return;
          const v = stat.decimals > 0
            ? obj.val.toFixed(stat.decimals)
            : Math.floor(obj.val);
          numRef.current.textContent = v + stat.suffix;
        },
      });
    });
    return () => ctx.revert();
  }, [stat, index, triggerRef]);

  return (
    <div
      ref={wrapRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        opacity: 0,
        padding: '0 1rem',
      }}
    >
      <span
        ref={numRef}
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: 'clamp(40px, 4vw, 58px)',
          letterSpacing: '-2px',
          color: '#fff',
          lineHeight: 1,
          marginBottom: '0.6rem',
        }}
      >
        0{stat.suffix}
      </span>
      <span style={{
        fontFamily: 'var(--font-body)',
        fontWeight: 500,
        fontSize: '12px',
        letterSpacing: '1.5px',
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.45)',
      }}>
        {stat.label}
      </span>
    </div>
  );
}

/* ─── Testimonial card ───────────────────────────────────── */
function TestiCard({ t, cardRef }) {
  return (
    <div
      ref={cardRef}
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '20px',
        padding: '1.75rem 2rem 2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0',
        opacity: 0,
        willChange: 'transform, opacity',
        transition: 'transform 0.25s var(--ease-expo), box-shadow 0.25s var(--ease-expo), border-color 0.25s ease',
        cursor: 'default',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 0 0 2px rgba(21,120,229,0.4), 0 20px 50px rgba(0,0,0,0.3)';
        e.currentTarget.style.borderColor = 'rgba(21,120,229,0.4)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
      }}
    >
      <Stars count={t.stars} />

      <p style={{
        fontSize: '15.5px',
        lineHeight: 1.7,
        color: 'rgba(255,255,255,0.80)',
        fontStyle: 'italic',
        marginBottom: '1.5rem',
        flex: 1,
      }}>
        "{t.quote}"
      </p>

      {/* Divider */}
      <div style={{
        height: '1px',
        background: 'rgba(255,255,255,0.07)',
        marginBottom: '1.25rem',
      }} />

      {/* Author row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Avatar initials */}
        <div style={{
          width: '38px', height: '38px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--blue) 0%, var(--blue-mid) 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: '13px',
          color: '#fff',
          flexShrink: 0,
        }}>
          {t.name.charAt(0)}
        </div>
        <div>
          <div style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 700,
            fontSize: '14px',
            color: '#fff',
            lineHeight: 1.2,
          }}>
            {t.name}
          </div>
          <div style={{
            fontSize: '12px',
            color: 'rgba(255,255,255,0.4)',
            lineHeight: 1.4,
          }}>
            {t.location} · {t.tag}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Marquee strip ──────────────────────────────────────── */
function Marquee() {
  // Duplicate for seamless loop
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];

  return (
    <div style={{
      overflow: 'hidden',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      paddingTop: '2rem',
    }}>
      <div style={{
        display: 'flex',
        gap: '0',
        width: 'max-content',
        animation: 'marquee 28s linear infinite',
      }}>
        {items.map((item, i) => (
          <span key={i} style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '1.8rem',
            paddingRight: '1.8rem',
            fontFamily: 'var(--font-body)',
            fontWeight: 600,
            fontSize: '13px',
            letterSpacing: '0.5px',
            color: 'rgba(255,255,255,0.38)',
            whiteSpace: 'nowrap',
          }}>
            {item}
            <span style={{
              color: 'var(--blue)',
              opacity: 0.6,
              fontSize: '8px',
            }}>◆</span>
          </span>
        ))}
      </div>

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

/* ─── Main export ────────────────────────────────────────── */
export default function Stats() {
  const sectionRef    = useRef(null);
  const statsRowRef   = useRef(null);
  const headerRef     = useRef(null);
  const cardRefs      = useRef(TESTIMONIALS.map(() => ({ current: null })));

  /* Testimonial card animations */
  useEffect(() => {
    const ctx = gsap.context(() => {

      /* Section header */
      gsap.fromTo(headerRef.current,
        { opacity: 0, y: 36 },
        {
          opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
          scrollTrigger: { trigger: headerRef.current, start: 'top 80%' },
        }
      );

      /* Cards slide from left, staggered */
      cardRefs.current.forEach((ref, i) => {
        if (!ref.current) return;
        gsap.fromTo(ref.current,
          { opacity: 0, x: -50 },
          {
            opacity: 1, x: 0,
            duration: 0.65, ease: 'power3.out',
            delay: i * 0.15,
            scrollTrigger: { trigger: headerRef.current, start: 'top 70%' },
          }
        );
      });

    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="stats"
      className="section-py"
      style={{
        background: 'var(--dark)',
        /* Diagonal line texture */
        backgroundImage: `repeating-linear-gradient(
          -45deg,
          rgba(255,255,255,0.018) 0px,
          rgba(255,255,255,0.018) 1px,
          transparent 1px,
          transparent 14px
        )`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Blue glow blobs */}
      <div style={{
        position: 'absolute', top: '-120px', right: '-80px',
        width: '420px', height: '420px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(21,120,229,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-80px', left: '-60px',
        width: '320px', height: '320px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(21,120,229,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="container-xl" style={{ position: 'relative', zIndex: 2 }}>

        {/* ── Stats row ────────────────────────────────── */}
        <div
          ref={statsRowRef}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1rem',
            paddingBottom: '4rem',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            marginBottom: '4.5rem',
          }}
        >
          {STATS.map((stat, i) => (
            <StatItem key={stat.label} stat={stat} index={i} triggerRef={statsRowRef} />
          ))}
        </div>

        {/* ── Testimonials header ───────────────────────── */}
        <div
          ref={headerRef}
          style={{ textAlign: 'center', marginBottom: '2.75rem', opacity: 0 }}
        >
          <div className="eyebrow" style={{ color: 'var(--blue)', marginBottom: '0.75rem' }}>
            Client Stories
          </div>
          <h2 style={{
            color: '#fff',
            fontSize: 'clamp(30px, 3.5vw, 48px)',
            letterSpacing: '-1.5px',
          }}>
            What Our Clients Say
          </h2>
        </div>

        {/* ── Testimonial cards ─────────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1.25rem',
          marginBottom: '4rem',
        }}>
          {TESTIMONIALS.map((t, i) => (
            <TestiCard
              key={t.name}
              t={t}
              cardRef={cardRefs.current[i]}
            />
          ))}
        </div>

        {/* ── Marquee trust strip ───────────────────────── */}
        <Marquee />

      </div>
    </section>
  );
}
