import { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ─── Service data ───────────────────────────────────────── */
const SERVICES = [
  {
    id: 'basic',
    title: 'Basic Cleaning',
    price: 'From $150',
    headline: 'The Essential Clean',
    body: 'Kitchen, bathrooms, living areas, and bedrooms — all the essentials handled with care and consistency.',
    image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=900&q=80',
    features: [
      'Sanitize counters & sink',
      'Disinfect high-touch points',
      'Vacuum & mop all floors',
      'Streak-free mirrors & glass',
      'Final walkthrough',
    ],
    accent: '#1578E5',
  },
  {
    id: 'residential',
    title: 'Residential Cleaning',
    price: 'From $150',
    headline: 'Your Home, On Schedule',
    body: 'Flexible recurring plans — daily, weekly, bi-weekly, or monthly. We keep your space spotless without you lifting a finger.',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&q=80',
    features: [
      'Choose your frequency',
      'Consistent team every visit',
      '10% weekly discount',
      'All supplies provided',
    ],
    accent: '#1578E5',
  },
  {
    id: 'deep',
    title: 'Deep Cleaning',
    price: 'From $220',
    headline: 'Go Beyond the Surface',
    body: 'When standard just isn\'t enough. We detail every corner, edge, grout line, and surface — top to bottom.',
    image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=900&q=80',
    features: [
      'Degrease stovetop & knobs',
      'Inside microwave',
      'Scrub tile & grout',
      'Detail baseboards & corners',
      'Dust all vents & fans',
    ],
    accent: '#1578E5',
  },
  {
    id: 'moveinout',
    title: 'Move-In / Move-Out',
    price: 'From $300',
    headline: 'Fresh Starts, Clean Exits',
    body: 'Everything in deep clean plus inside cabinets, closets, deodorizing, and a full walkthrough. Get your deposit back.',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=80',
    features: [
      'Inside cabinets & drawers',
      'Closets & shelves',
      'Oven & fridge available as add-ons',
      'Deodorize throughout',
    ],
    accent: '#1578E5',
  },
  {
    id: 'airbnb',
    title: 'Airbnb Cleaning',
    price: 'Custom Quote',
    headline: 'Guest-Ready Every Time',
    body: 'Turnover cleans between guests — fast, thorough, and inspection-ready. Keep your ratings high and your bookings full.',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900&q=80',
    features: [
      'Quick turnaround times',
      'Linen & towel refresh available',
      'Restock amenities',
      'Guest-ready presentation',
    ],
    accent: '#1578E5',
  },
  {
    id: 'office',
    title: 'Office Cleaning',
    price: 'Custom Quote',
    headline: 'Professional Spaces Deserve Professional Cleaning',
    body: 'Flexible scheduling for offices, retail, and commercial spaces. After-hours available. Minimal disruption, maximum results.',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&q=80',
    features: [
      'Daily or weekly contracts',
      'After-hours available',
      'Sanitize workstations & shared areas',
      'Restroom deep clean included',
    ],
    accent: '#1578E5',
  },
];

/* ─── Check icon ─────────────────────────────────────────── */
const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
    <circle cx="8" cy="8" r="8" fill="rgba(21,120,229,0.15)" />
    <path d="M5 8l2 2 4-4" stroke="#1578E5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ─── Left sticky panel ──────────────────────────────────── */
function StickyPanel({ activeIndex }) {
  const svc = SERVICES[activeIndex];
  const titleRef    = useRef(null);
  const priceRef    = useRef(null);
  const progressRef = useRef(null);
  const prevIndex   = useRef(0);

  /* Two-layer CSS crossfade: we track which layer is "on top" */
  const [layerA, setLayerA] = useState({ img: SERVICES[0].image, opacity: 1, zIndex: 2 });
  const [layerB, setLayerB] = useState({ img: SERVICES[1].image, opacity: 0, zIndex: 1 });
  const useA = useRef(true); /* which layer becomes the "incoming" next */

  /* Crossfade whenever activeIndex changes */
  useEffect(() => {
    const prev = prevIndex.current;
    if (activeIndex === prev) return;

    /* Swap layers */
    if (useA.current) {
      /* Layer A becomes incoming */
      setLayerA({ img: SERVICES[activeIndex].image, opacity: 1, zIndex: 2 });
      setLayerB(prev => ({ ...prev, opacity: 0, zIndex: 1 }));
    } else {
      /* Layer B becomes incoming */
      setLayerB({ img: SERVICES[activeIndex].image, opacity: 1, zIndex: 2 });
      setLayerA(prev => ({ ...prev, opacity: 0, zIndex: 1 }));
    }
    useA.current = !useA.current;

    /* Animate title + price with GSAP */
    gsap.to([titleRef.current, priceRef.current], {
      opacity: 0, y: -18, duration: 0.22, ease: 'power2.in',
      onComplete: () => {
        gsap.fromTo([titleRef.current, priceRef.current],
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.32, ease: 'power3.out' }
        );
      },
    });

    /* Progress bar */
    const pct = ((activeIndex + 1) / SERVICES.length) * 100;
    gsap.to(progressRef.current, { width: `${pct}%`, duration: 0.4, ease: 'power2.out' });

    prevIndex.current = activeIndex;
  }, [activeIndex]);

  const progressPct = ((activeIndex + 1) / SERVICES.length) * 100;

  const LAYER_STYLE = {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    transition: 'opacity 0.55s ease',
  };

  return (
    <div style={{
      position: 'sticky',
      top: 0,
      height: '100vh',
      width: '50%',
      flexShrink: 0,
      alignSelf: 'flex-start',
      overflow: 'hidden',
      background: '#0B1220',
    }}>

      {/* CSS crossfade layers */}
      <div style={{
        ...LAYER_STYLE,
        backgroundImage: `url(${layerA.img})`,
        opacity: layerA.opacity,
        zIndex: layerA.zIndex,
      }} />
      <div style={{
        ...LAYER_STYLE,
        backgroundImage: `url(${layerB.img})`,
        opacity: layerB.opacity,
        zIndex: layerB.zIndex,
      }} />

      {/* Dark gradient overlays */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        background: 'linear-gradient(to right, rgba(11,18,32,0.55) 0%, rgba(11,18,32,0.2) 100%)',
        zIndex: 5,
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: '45%',
        background: 'linear-gradient(to top, rgba(11,18,32,0.95) 0%, transparent 100%)',
        zIndex: 5,
        pointerEvents: 'none',
      }} />

      {/* Service counter badge */}
      <div style={{
        position: 'absolute', top: '2.5rem', left: '2.5rem',
        zIndex: 10,
        background: 'rgba(21,120,229,0.15)',
        border: '1px solid rgba(21,120,229,0.3)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderRadius: '999px',
        padding: '0.35rem 1rem',
        color: '#fff',
        fontSize: '12px',
        fontWeight: 600,
        letterSpacing: '1px',
        fontFamily: 'var(--font-body)',
      }}>
        {String(activeIndex + 1).padStart(2,'0')} / {String(SERVICES.length).padStart(2,'0')}
      </div>

      {/* Bottom title overlay */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '2.5rem',
        zIndex: 10,
      }}>
        {/* Progress bar track */}
        <div style={{
          width: '100%', height: '2px',
          background: 'rgba(255,255,255,0.12)',
          borderRadius: '999px',
          marginBottom: '1.5rem',
          overflow: 'hidden',
        }}>
          <div
            ref={progressRef}
            style={{
              height: '100%',
              width: `${progressPct}%`,
              background: 'var(--blue)',
              borderRadius: '999px',
              boxShadow: '0 0 10px rgba(21,120,229,0.6)',
            }}
          />
        </div>

        <div ref={titleRef} style={{ willChange: 'transform, opacity' }}>
          <div className="eyebrow" style={{ color: '#3D8FF0', marginBottom: '0.5rem' }}>
            {svc.title}
          </div>
          <h2 style={{
            color: '#fff',
            fontSize: 'clamp(28px, 3vw, 42px)',
            letterSpacing: '-1.5px',
            lineHeight: 1.1,
            marginBottom: '0.5rem',
          }}>
            {svc.headline}
          </h2>
        </div>
        <div ref={priceRef} style={{ willChange: 'transform, opacity' }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: '22px',
            color: 'var(--blue)',
            letterSpacing: '-0.5px',
          }}>
            {svc.price}
          </span>
        </div>
      </div>
    </div>
  );
}


/* ─── Single right-panel chapter ────────────────────────── */
function ServiceChapter({ svc, index, chapterRef }) {
  const featuresRef = useRef(null);
  const bodyRef = useRef(null);
  const headingRef = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = chapterRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [chapterRef]);

  /* Stagger feature list with GSAP when chapter enters view */
  useEffect(() => {
    if (!inView || !featuresRef.current) return;
    gsap.fromTo(featuresRef.current.children,
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, duration: 0.35, stagger: 0.08, ease: 'power2.out', delay: 0.2 }
    );
  }, [inView]);

  return (
    <div
      ref={chapterRef}
      data-service-index={index}
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        padding: 'clamp(3rem, 6vw, 5rem) clamp(2rem, 5vw, 4rem)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div style={{ maxWidth: '480px' }}>

        {/* Chapter number */}
        <div style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: '80px',
          lineHeight: 1,
          color: 'rgba(21,120,229,0.08)',
          letterSpacing: '-4px',
          marginBottom: '-0.5rem',
          userSelect: 'none',
        }}>
          {String(index + 1).padStart(2, '0')}
        </div>

        {/* Eyebrow */}
        <div className="eyebrow" style={{ marginBottom: '0.75rem' }}>
          {svc.title}
        </div>

        {/* Headline */}
        <h3
          ref={headingRef}
          style={{
            fontSize: 'clamp(24px, 2.5vw, 34px)',
            letterSpacing: '-0.5px',
            color: 'var(--dark)',
            marginBottom: '1rem',
            lineHeight: 1.15,
          }}
        >
          {svc.headline}
        </h3>

        {/* Body */}
        <p
          ref={bodyRef}
          style={{
            fontSize: '16px',
            lineHeight: 1.75,
            color: 'var(--gray)',
            marginBottom: '2rem',
          }}
        >
          {svc.body}
        </p>

        {/* Price pill */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'var(--blue-light)',
          border: '1px solid var(--border)',
          borderRadius: '999px',
          padding: '0.4rem 1.1rem',
          marginBottom: '1.75rem',
        }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: '18px',
            color: 'var(--blue)',
            letterSpacing: '-0.5px',
          }}>
            {svc.price}
          </span>
          {(svc.price === 'Custom Quote') && (
            <span style={{ fontSize: '12px', color: 'var(--gray)', fontWeight: 500 }}>
              — contact us
            </span>
          )}
        </div>

        {/* Feature list */}
        <ul
          ref={featuresRef}
          style={{
            listStyle: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem',
          }}
        >
          {svc.features.map((feat) => (
            <li
              key={feat}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                fontSize: '15px',
                fontWeight: 500,
                color: 'var(--dark)',
                opacity: 0,   /* GSAP animates in */
              }}
            >
              <CheckIcon />
              {feat}
            </li>
          ))}
        </ul>

        {/* CTA link */}
        <a
          href="#pricing"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginTop: '2rem',
            fontFamily: 'var(--font-body)',
            fontWeight: 600,
            fontSize: '14px',
            color: 'var(--blue)',
            textDecoration: 'none',
            letterSpacing: '0.3px',
            transition: 'gap 0.2s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.gap = '0.8rem'}
          onMouseLeave={e => e.currentTarget.style.gap = '0.5rem'}
        >
          Get a Quote →
        </a>
      </div>
    </div>
  );
}

/* ─── Nav Dots ───────────────────────────────────────────── */
function NavDots({ activeIndex, onDotClick }) {
  return (
    <div style={{
      position: 'fixed',
      right: '1.75rem',
      top: '50%',
      transform: 'translateY(-50%)',
      zIndex: 999,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.6rem',
    }}>
      {SERVICES.map((svc, i) => (
        <button
          key={svc.id}
          onClick={() => onDotClick(i)}
          title={svc.title}
          style={{
            width: activeIndex === i ? '10px' : '7px',
            height: activeIndex === i ? '10px' : '7px',
            borderRadius: '999px',
            border: 'none',
            cursor: 'pointer',
            background: activeIndex === i ? 'var(--blue)' : 'rgba(90,106,130,0.4)',
            transition: 'all 0.25s var(--ease-expo)',
            padding: 0,
            boxShadow: activeIndex === i ? '0 0 10px rgba(21,120,229,0.6)' : 'none',
          }}
        />
      ))}
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────── */
export default function ServicesScroll() {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRef = useRef(null);
  const chapterRefs = useRef(SERVICES.map(() => ({ current: null })));

  /* Update chapterRefs array length if SERVICES changes */
  if (chapterRefs.current.length !== SERVICES.length) {
    chapterRefs.current = SERVICES.map(() => ({ current: null }));
  }

  /* IntersectionObserver — tracks which chapter is most in view */
  useEffect(() => {
    const observers = [];

    chapterRefs.current.forEach((ref, i) => {
      if (!ref.current) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveIndex(i);
        },
        {
          root: null,
          rootMargin: '-40% 0px -40% 0px',
          threshold: 0,
        }
      );
      obs.observe(ref.current);
      observers.push(obs);
    });

    return () => observers.forEach(obs => obs.disconnect());
  }, []);

  /* Nav dot click — smooth-scroll to chapter */
  const handleDotClick = useCallback((index) => {
    const el = chapterRefs.current[index]?.current;
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  /* Section entrance animation */
  const headingRef = useRef(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(headingRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
          scrollTrigger: {
            trigger: headingRef.current,
            start: 'top 80%',
          },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <>
      {/* Nav Dots */}
      <NavDots activeIndex={activeIndex} onDotClick={handleDotClick} />

      <section
        ref={sectionRef}
        id="services"
        style={{ background: 'var(--white)' }}
      >
        {/* Section header */}
        <div
          ref={headingRef}
          className="container-xl"
          style={{
            paddingTop: '6rem',
            paddingBottom: '3rem',
            opacity: 0,
          }}
        >
          <div className="eyebrow" style={{ marginBottom: '1rem' }}>Our Services</div>
          <h2 style={{ maxWidth: '600px', marginBottom: '1rem' }}>
            Everything Your Space Needs
          </h2>
          <p style={{ maxWidth: '520px', fontSize: '17px' }}>
            From quick refreshes to full deep cleans — browse each service and find the
            perfect fit for your home or business.
          </p>
        </div>

        {/* Scrollytelling strip */}
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>

          {/* ── LEFT: sticky panel ────────────────────── */}
          <StickyPanel activeIndex={activeIndex} />

          {/* ── RIGHT: scrollable chapters ────────────── */}
          <div style={{ width: '50%', flexShrink: 0 }}>
            {SERVICES.map((svc, i) => (
              <ServiceChapter
                key={svc.id}
                svc={svc}
                index={i}
                chapterRef={chapterRefs.current[i]}
              />
            ))}
          </div>

        </div>
      </section>
    </>
  );
}
