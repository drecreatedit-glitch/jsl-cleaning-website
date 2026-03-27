import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ─── Data ───────────────────────────────────────────────── */
const ADDONS = [
  { label: 'Interior Windows', price: '$6 / each' },
  { label: 'Exterior Windows', price: '$7 / each' },
  { label: 'Oven Cleaning', price: '$35' },
  { label: 'Fridge Cleaning', price: '$45' },
  { label: 'Inside Cabinets', price: '$75' },
  { label: 'Blinds', price: '$25 / room' },
  { label: 'Laundry', price: '$15 / load' },
  { label: 'Wall Washing', price: '$60 / room' },
  { label: 'Carpet Steam Clean', price: '$75 / room' },
];

const PLANS = [
  {
    id: 'basic',
    label: 'Basic Clean',
    badge: null,
    price: '$150',
    period: 'per clean',
    featured: false,
    features: [
      'Kitchen & bathrooms',
      'All living areas',
      'Vacuum, mop & dust',
      'High-touch disinfecting',
      'Final walkthrough',
    ],
    note: null,
    btnLabel: 'Book Basic Clean',
  },
  {
    id: 'deep',
    label: 'Deep Clean',
    badge: 'Most Popular',
    price: '$220',
    period: 'per clean',
    featured: true,
    features: [
      'Everything in Basic',
      'Inside microwave & appliances',
      'Grout, baseboards & corners',
      'Vents, fans & windowsills',
      'Soap scum removal',
    ],
    note: null,
    btnLabel: 'Book Deep Clean',
  },
  {
    id: 'moveinout',
    label: 'Full Package',
    badge: null,
    price: '$300',
    period: 'per clean',
    featured: false,
    features: [
      'Everything in Deep Clean',
      'Inside cabinets & drawers',
      'Closets & shelves',
      'Deodorize throughout',
      'Final quality walkthrough',
    ],
    note: 'Add-ons: Oven +$35 · Fridge +$45',
    btnLabel: 'Book Move Clean',
  },
];

/* ─── Check icon ─────────────────────────────────────────── */
const Check = ({ dark }) => (
  <svg width="17" height="17" viewBox="0 0 17 17" fill="none" style={{ flexShrink: 0, marginTop: '1px' }}>
    <circle cx="8.5" cy="8.5" r="8.5"
      fill={dark ? 'rgba(255,255,255,0.15)' : 'rgba(21,120,229,0.12)'} />
    <path d="M5.5 8.5l2 2 4-4"
      stroke={dark ? '#fff' : '#1578E5'}
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ─── Pricing card ───────────────────────────────────────── */
function PricingCard({ plan, cardRef }) {
  const dark = plan.featured;

  return (
    <div
      ref={cardRef}
      style={{
        position: 'relative',
        borderRadius: '24px',
        padding: dark ? '2.75rem 2.25rem 2.5rem' : '2.25rem 2rem',
        background: dark ? 'var(--blue)' : '#fff',
        border: dark ? 'none' : '1.5px solid var(--border)',
        boxShadow: dark
          ? '0 24px 60px rgba(21,120,229,0.4), 0 4px 20px rgba(0,0,0,0.15)'
          : '0 2px 20px rgba(21,120,229,0.06)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0',
        marginTop: dark ? '-20px' : '0',
        willChange: 'transform, opacity',
        transition: 'box-shadow 0.3s ease',
        zIndex: dark ? 2 : 1,
      }}
      onMouseEnter={e => {
        if (!dark) e.currentTarget.style.boxShadow = '0 12px 40px rgba(21,120,229,0.14)';
      }}
      onMouseLeave={e => {
        if (!dark) e.currentTarget.style.boxShadow = '0 2px 20px rgba(21,120,229,0.06)';
      }}
    >
      {/* "Most Popular" badge */}
      {plan.badge && (
        <div style={{
          position: 'absolute',
          top: '-14px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#fff',
          color: 'var(--blue)',
          fontFamily: 'var(--font-body)',
          fontWeight: 700,
          fontSize: '11px',
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          padding: '0.35rem 1.1rem',
          borderRadius: '999px',
          boxShadow: '0 4px 16px rgba(21,120,229,0.25)',
          whiteSpace: 'nowrap',
        }}>
          ✦ {plan.badge}
        </div>
      )}

      {/* Label */}
      <div style={{
        fontFamily: 'var(--font-body)',
        fontWeight: 700,
        fontSize: '11px',
        letterSpacing: '2px',
        textTransform: 'uppercase',
        color: dark ? 'rgba(255,255,255,0.7)' : 'var(--blue)',
        marginBottom: '1rem',
      }}>
        {plan.label}
      </div>

      {/* Price */}
      <div style={{ marginBottom: '1.75rem' }}>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: 'clamp(42px, 4vw, 52px)',
          letterSpacing: '-2px',
          color: dark ? '#fff' : 'var(--dark)',
          lineHeight: 1,
        }}>
          {plan.price}
        </span>
        <span style={{
          fontSize: '14px',
          fontWeight: 500,
          color: dark ? 'rgba(255,255,255,0.6)' : 'var(--gray)',
          marginLeft: '6px',
        }}>
          / {plan.period}
        </span>
      </div>

      {/* Divider */}
      <div style={{
        height: '1px',
        background: dark ? 'rgba(255,255,255,0.15)' : 'var(--border)',
        marginBottom: '1.5rem',
      }} />

      {/* Features */}
      <ul style={{
        listStyle: 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        marginBottom: '2rem',
        flex: 1,
      }}>
        {plan.features.map(feat => (
          <li key={feat} style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.6rem',
            fontSize: '14.5px',
            fontWeight: 400,
            color: dark ? 'rgba(255,255,255,0.88)' : 'var(--dark)',
            lineHeight: 1.4,
          }}>
            <Check dark={dark} />
            {feat}
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <a
        href="mailto:jlopez@jslcleaningservices.com"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0.9rem 1.5rem',
          borderRadius: '10px',
          fontFamily: 'var(--font-body)',
          fontWeight: 600,
          fontSize: '15px',
          textDecoration: 'none',
          cursor: 'pointer',
          transition: 'transform 0.2s var(--ease-expo), box-shadow 0.2s var(--ease-expo)',
          ...(dark
            ? {
                background: '#fff',
                color: 'var(--blue)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
              }
            : {
                background: 'transparent',
                color: 'var(--blue)',
                border: '1.5px solid var(--blue)',
              }),
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
      >
        {plan.btnLabel}
      </a>

      {/* Optional note */}
      {plan.note && (
        <p style={{
          marginTop: '0.9rem',
          textAlign: 'center',
          fontSize: '12px',
          color: 'var(--gray)',
          fontWeight: 500,
        }}>
          {plan.note}
        </p>
      )}
    </div>
  );
}

/* ─── Add-ons accordion ──────────────────────────────────── */
function AddonsAccordion() {
  const [open, setOpen] = useState(false);
  const bodyRef = useRef(null);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    if (open) {
      gsap.to(el, { height: 'auto', opacity: 1, duration: 0.4, ease: 'power3.out' });
    } else {
      gsap.to(el, { height: 0, opacity: 0, duration: 0.3, ease: 'power3.in' });
    }
  }, [open]);

  return (
    <div style={{
      maxWidth: '700px',
      margin: '0 auto',
      border: '1.5px solid var(--border)',
      borderRadius: '16px',
      overflow: 'hidden',
      background: '#fff',
    }}>
      {/* Accordion header */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.25rem 1.75rem',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: '18px',
          color: 'var(--dark)',
          letterSpacing: '-0.3px',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{
            width: '28px', height: '28px',
            background: 'var(--blue-light)',
            borderRadius: '8px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '15px',
          }}>✦</span>
          Available Add-Ons
        </span>
        <span style={{
          transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
          transition: 'transform 0.3s var(--ease-expo)',
          fontSize: '22px',
          color: 'var(--blue)',
          lineHeight: 1,
        }}>
          +
        </span>
      </button>

      {/* Accordion body — height animated by GSAP */}
      <div
        ref={bodyRef}
        style={{ height: 0, opacity: 0, overflow: 'hidden' }}
      >
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '0.5rem',
          padding: '0 1.75rem 1.75rem',
        }}>
          {ADDONS.map(addon => (
            <div
              key={addon.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.65rem 1rem',
                background: 'var(--blue-xlight)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
              }}
            >
              <span style={{
                fontSize: '14px',
                fontWeight: 500,
                color: 'var(--dark)',
              }}>
                {addon.label}
              </span>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '14px',
                color: 'var(--blue)',
                letterSpacing: '-0.3px',
                whiteSpace: 'nowrap',
                marginLeft: '0.5rem',
              }}>
                {addon.price}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Main export ────────────────────────────────────────── */
export default function Pricing() {
  const sectionRef   = useRef(null);
  const headerRef    = useRef(null);
  const cardRefs     = useRef(PLANS.map(() => ({ current: null })));
  const discountRef  = useRef(null);
  const addonsRef    = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {

      /* Header fade-up */
      gsap.fromTo(headerRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
          scrollTrigger: { trigger: headerRef.current, start: 'top 80%' },
        }
      );

      /* Cards stagger with rotateY entrance */
      const rotations = [8, 0, -8];          // outer, center, outer
      const yOffsets  = [0, -20, 0];          // center rises extra

      cardRefs.current.forEach((ref, i) => {
        if (!ref.current) return;
        gsap.fromTo(ref.current,
          {
            opacity: 0,
            scale: 0.94,
            rotateY: rotations[i],
            y: 30 + Math.abs(yOffsets[i]),
          },
          {
            opacity: 1,
            scale: 1,
            rotateY: 0,
            y: yOffsets[i],        /* featured card sits 20px higher */
            duration: 0.7,
            ease: 'power3.out',
            delay: i * 0.15,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 65%',
            },
          }
        );
      });

      /* Discount banner */
      gsap.fromTo(discountRef.current,
        { opacity: 0, y: 24 },
        {
          opacity: 1, y: 0, duration: 0.6, ease: 'power2.out',
          scrollTrigger: { trigger: discountRef.current, start: 'top 85%' },
          delay: 0.2,
        }
      );

      /* Add-ons section */
      gsap.fromTo(addonsRef.current,
        { opacity: 0, y: 24 },
        {
          opacity: 1, y: 0, duration: 0.6, ease: 'power2.out',
          scrollTrigger: { trigger: addonsRef.current, start: 'top 85%' },
        }
      );

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="pricing"
      className="section-py"
      style={{
        position: 'relative',
        background: '#fff',
        /* Dot grid overlay */
        backgroundImage: 'radial-gradient(circle, #1578E510 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        overflow: 'hidden',
      }}
    >
      {/* Soft edge fade to white so dots don't bleed into other sections */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, white 0%, transparent 8%, transparent 92%, white 100%)',
        pointerEvents: 'none',
        zIndex: 1,
      }} />

      <div className="container-xl" style={{ position: 'relative', zIndex: 2 }}>

        {/* ── Section header ──────────────────────────── */}
        <div ref={headerRef} style={{ textAlign: 'center', marginBottom: '4rem', opacity: 0 }}>
          <div className="eyebrow" style={{ marginBottom: '0.75rem' }}>
            Transparent Pricing
          </div>
          <h2 style={{ marginBottom: '1rem' }}>Simple, Honest Rates.</h2>
          <p style={{ maxWidth: '520px', margin: '0 auto', fontSize: '17px' }}>
            Starting prices for residential services. Final quote based on home size,
            condition, and selected add-ons.
          </p>
        </div>

        {/* ── Pricing cards ───────────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1.25rem',
          alignItems: 'start',
          marginBottom: '3rem',
          perspective: '1200px',   /* enables rotateY depth */
        }}>
          {PLANS.map((plan, i) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              cardRef={cardRefs.current[i]}
            />
          ))}
        </div>

        {/* ── Recurring discount banner ────────────────── */}
        <div
          ref={discountRef}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            padding: '1.5rem 2rem',
            background: 'var(--blue-light)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            marginBottom: '2.5rem',
            opacity: 0,
          }}
        >
          {/* Discount pills */}
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            background: 'var(--blue)', color: '#fff',
            fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '13px',
            padding: '0.4rem 1.1rem', borderRadius: '999px',
            letterSpacing: '0.3px',
          }}>
            🔄 Weekly Recurring = 10% Off
          </span>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            background: 'var(--blue-mid)', color: '#fff',
            fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '13px',
            padding: '0.4rem 1.1rem', borderRadius: '999px',
            letterSpacing: '0.3px',
          }}>
            📅 Bi-Weekly = 5% Off
          </span>

          {/* Text */}
          <p style={{
            fontSize: '14px',
            color: 'var(--gray)',
            margin: 0,
            fontWeight: 500,
          }}>
            Ask about recurring service discounts when you book.
          </p>
        </div>

        {/* ── Add-ons accordion ───────────────────────── */}
        <div ref={addonsRef} style={{ opacity: 0 }}>
          <AddonsAccordion />
        </div>

      </div>
    </section>
  );
}
