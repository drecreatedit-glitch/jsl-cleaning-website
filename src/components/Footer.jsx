import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ─── Link data ──────────────────────────────────────────── */
const NAV_COLS = [
  {
    heading: 'Services',
    links: [
      'Basic Cleaning', 'Residential', 'Deep Cleaning',
      'Move-In / Move-Out', 'Airbnb Cleaning', 'Office Cleaning',
    ],
  },
  {
    heading: 'Add-Ons',
    links: [
      'Window Cleaning', 'Oven Cleaning', 'Fridge Cleaning',
      'Carpet Steam', 'Laundry', 'Wall Washing',
    ],
  },
  {
    heading: 'Company',
    links: ['About JSL', 'Reviews', 'FAQ', 'Contact', 'Book a Service', '👑 CleanPass™ Membership'],
  },
];

/* ─── Social icons ───────────────────────────────────────── */
const IconInstagram = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);

const IconFacebook = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const IconGoogle = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="rgba(255,255,255,0.6)"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="rgba(255,255,255,0.6)"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="rgba(255,255,255,0.6)"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="rgba(255,255,255,0.6)"/>
  </svg>
);

/* ─── Reusable footer link ───────────────────────────────── */
const FootLink = ({ children, onClick }) => (
  <li>
    <a
      href="#"
      onClick={onClick ? (e) => { e.preventDefault(); onClick(); } : undefined}
      style={{
        color: children?.toString().includes('CleanPass') ? '#D97706' : 'rgba(255,255,255,0.45)',
        textDecoration: 'none',
        fontSize: '14px',
        lineHeight: 1.5,
        transition: 'color 0.18s ease',
        display: 'inline-block',
        fontWeight: children?.toString().includes('CleanPass') ? 700 : 400,
      }}
      onMouseEnter={e => e.currentTarget.style.color = children?.toString().includes('CleanPass') ? '#F59E0B' : 'rgba(255,255,255,0.9)'}
      onMouseLeave={e => e.currentTarget.style.color = children?.toString().includes('CleanPass') ? '#D97706' : 'rgba(255,255,255,0.45)'}
    >
      {children}
    </a>
  </li>
);

export default function Footer({ openLegal = () => {} }) {
  const footerRef = useRef(null);
  const colRefs   = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      /* Stagger columns fade-up */
      gsap.fromTo(colRefs.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0,
          duration: 0.6,
          ease: 'power3.out',
          stagger: 0.12,
          scrollTrigger: {
            trigger: footerRef.current,
            start: 'top 85%',
          },
        }
      );
    }, footerRef);
    return () => ctx.revert();
  }, []);

  return (
    <footer
      ref={footerRef}
      id="footer"
      style={{
        background: '#06101E',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        paddingTop: '5rem',
      }}
    >
      <div className="container-xl">

        {/* ── Four-column grid ─────────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.6fr 1fr 1fr 1fr',
          gap: 'clamp(2rem, 4vw, 3.5rem)',
          paddingBottom: '4rem',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>

          {/* ── Column 1 — Brand ─────────────────────── */}
          <div ref={el => colRefs.current[0] = el} style={{ opacity: 0 }}>

            {/* Logotype */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{
                display: 'inline-flex',
                flexDirection: 'column',
                gap: '0',
                borderLeft: '3px solid var(--blue)',
                paddingLeft: '0.75rem',
              }}>
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: '22px',
                  letterSpacing: '-0.5px',
                  color: 'var(--blue)',
                  lineHeight: 1.1,
                }}>JSL CLEANING</span>
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '11px',
                  letterSpacing: '3px',
                  color: 'rgba(255,255,255,0.6)',
                  textTransform: 'uppercase',
                }}>SERVICES LLC</span>
              </div>
            </div>

            <p style={{
              fontSize: '14px',
              lineHeight: 1.7,
              color: 'rgba(255,255,255,0.40)',
              maxWidth: '280px',
              marginBottom: '1.5rem',
              fontStyle: 'italic',
            }}>
              "Freshness You Can Feel,<br/>A Fragrance You Can Trust"
            </p>

            {/* Contact info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              <a href="tel:3479546309" style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                color: 'rgba(255,255,255,0.55)', textDecoration: 'none',
                fontSize: '13.5px', fontWeight: 500,
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.55)'}>
                <span style={{ color: 'var(--blue)', fontSize: '12px' }}>📞</span>
                (347) 954-6309
              </a>
              <a href="mailto:jlopez@jslcleaningservices.com" style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                color: 'rgba(255,255,255,0.55)', textDecoration: 'none',
                fontSize: '13.5px', fontWeight: 500,
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.55)'}>
                <span style={{ color: 'var(--blue)', fontSize: '12px' }}>✉️</span>
                jlopez@jslcleaningservices.com
              </a>
              <span style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                color: 'rgba(255,255,255,0.40)',
                fontSize: '13.5px',
              }}>
                <span style={{ color: 'var(--blue)', fontSize: '12px' }}>📍</span>
                South Florida &amp; Tampa Bay Area
              </span>
            </div>
          </div>

          {/* ── Columns 2-4 — nav links ──────────────── */}
          {NAV_COLS.map((col, i) => (
            <div
              key={col.heading}
              ref={el => colRefs.current[i + 1] = el}
              style={{ opacity: 0 }}
            >
              <h4 style={{
                fontFamily: 'var(--font-body)',
                fontWeight: 700,
                fontSize: '11px',
                letterSpacing: '2.5px',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.35)',
                marginBottom: '1.25rem',
              }}>
                {col.heading}
              </h4>
              <ul style={{
                listStyle: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem',
              }}>
                {col.links.map(link => (
                  <FootLink
                    key={link}
                    onClick={link.includes('CleanPass') ? () => openMembership('gold') : undefined}
                  >
                    {link}
                  </FootLink>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Bottom bar ───────────────────────────────── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.5rem 0',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.28)' }}>
            © 2026 JSL Cleaning Services LLC · All Rights Reserved
          </p>

          {/* Legal links */}
          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
            {[
              { label: 'Privacy Policy', page: 'privacy' },
              { label: 'Terms of Service', page: 'terms' },
            ].map(({ label, page }) => (
              <button
                key={page}
                onClick={() => openLegal(page)}
                style={{
                  background: 'none', border: 'none', padding: 0,
                  fontSize: '12px', color: 'rgba(255,255,255,0.35)',
                  cursor: 'pointer', fontFamily: 'var(--font-body)',
                  transition: 'color 0.2s', textDecoration: 'underline',
                  textUnderlineOffset: '3px',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.75)'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Social icons */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {[
              { Icon: IconInstagram, label: 'Instagram' },
              { Icon: IconFacebook,  label: 'Facebook'  },
              { Icon: IconGoogle,    label: 'Google'    },
            ].map(({ Icon, label }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                style={{
                  width: '36px', height: '36px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'rgba(255,255,255,0.35)',
                  transition: 'color 0.2s, background 0.2s, border-color 0.2s',
                  textDecoration: 'none',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = 'rgba(255,255,255,0.35)';
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                }}
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}
