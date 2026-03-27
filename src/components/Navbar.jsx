import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const NAV_LINKS = [
  { label: 'Services',    href: '#services'    },
  { label: 'Pricing',     href: '#pricing'     },
  { label: 'About',       href: '#about'       },
  { label: 'How It Works',href: '#how-it-works'},
  { label: 'Contact',     href: '#cta'         },
];

const SECTIONS = ['hero','services','pricing','about','stats','how-it-works','cta'];

export default function Navbar() {
  const navRef      = useRef(null);
  const [scrolled,  setScrolled]  = useState(false);
  const [active,    setActive]    = useState('hero');
  const [menuOpen,  setMenuOpen]  = useState(false);
  const menuRef     = useRef(null);
  const hamRef      = useRef(null);
  const linksRef    = useRef([]);

  /* ── Scroll → solid background ─────────────────────────── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Active section tracking via ScrollTrigger ──────────── */
  useEffect(() => {
    const triggers = SECTIONS.map(id => {
      const el = document.getElementById(id);
      if (!el) return null;
      return ScrollTrigger.create({
        trigger: el,
        start: 'top 55%',
        end: 'bottom 55%',
        onEnter:      () => setActive(id),
        onEnterBack:  () => setActive(id),
      });
    });
    return () => triggers.forEach(t => t?.kill());
  }, []);

  /* ── Mobile menu GSAP open/close ────────────────────────── */
  useEffect(() => {
    const items = menuRef.current?.querySelectorAll('li');
    if (!items) return;
    if (menuOpen) {
      gsap.fromTo(menuRef.current,
        { height: 0, opacity: 0 },
        { height: 'auto', opacity: 1, duration: 0.35, ease: 'power3.out' }
      );
      gsap.fromTo(items,
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, stagger: 0.06, delay: 0.1, ease: 'power3.out' }
      );
    } else {
      gsap.to(menuRef.current, { height: 0, opacity: 0, duration: 0.25, ease: 'power3.in' });
    }
  }, [menuOpen]);

  /* ── Smooth scroll on link click ────────────────────────── */
  const scrollTo = (e, href) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) target.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  const scrolled_style = scrolled
    ? { background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(16px)',
        boxShadow: '0 2px 24px rgba(21,120,229,0.12)', }
    : { background: 'transparent' };

  return (
    <header
      ref={navRef}
      style={{
        position: 'fixed',
        top: '3px', /* sit below the 3px scroll progress bar */
        left: 0, right: 0,
        zIndex: 1000,
        transition: 'background 0.3s ease, box-shadow 0.3s ease',
        ...scrolled_style,
      }}
    >
      <div className="container-xl" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '68px',
      }}>

        {/* ── Logo ──────────────────────────────────────── */}
        <a href="#hero" onClick={e => scrollTo(e, '#hero')}
          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0' }}>
          <div style={{
            borderLeft: '3px solid var(--blue)',
            paddingLeft: '0.6rem',
            display: 'flex', flexDirection: 'column',
          }}>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: '16px',
              letterSpacing: '-0.3px',
              lineHeight: 1.1,
              color: scrolled ? 'var(--blue)' : 'var(--blue)',
              transition: 'color 0.3s',
            }}>JSL CLEANING</span>
            <span style={{
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
              fontSize: '9px',
              letterSpacing: '2.5px',
              textTransform: 'uppercase',
              color: scrolled ? 'var(--dark)' : 'rgba(255,255,255,0.7)',
              transition: 'color 0.3s',
            }}>SERVICES LLC</span>
          </div>
        </a>

        {/* ── Desktop nav links ─────────────────────────── */}
        <nav style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}
          className="nav-desktop">
          {NAV_LINKS.map((link, i) => {
            const sectionId = link.href.replace('#', '');
            const isActive  = active === sectionId ||
              (link.href === '#cta' && active === 'cta');
            return (
              <a
                key={link.href}
                ref={el => linksRef.current[i] = el}
                href={link.href}
                onClick={e => scrollTo(e, link.href)}
                className="nav-link"
                style={{
                  fontFamily: 'var(--font-body)',
                  fontWeight: 600,
                  fontSize: '14px',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  color: isActive
                    ? 'var(--blue)'
                    : scrolled ? 'var(--dark)' : 'rgba(255,255,255,0.85)',
                  transition: 'color 0.2s ease, background 0.2s ease',
                  position: 'relative',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.color = 'var(--blue)';
                    e.currentTarget.style.background = scrolled
                      ? 'rgba(21,120,229,0.06)' : 'rgba(255,255,255,0.08)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.color = scrolled ? 'var(--dark)' : 'rgba(255,255,255,0.85)';
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                {link.label}
                {isActive && (
                  <span style={{
                    position: 'absolute', bottom: '2px', left: '0.85rem', right: '0.85rem',
                    height: '2px', background: 'var(--blue)',
                    borderRadius: '999px',
                  }} />
                )}
              </a>
            );
          })}

          {/* CTA button */}
          <a
            href="tel:3479546309"
            style={{
              marginLeft: '0.5rem',
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.5rem 1.2rem',
              background: 'var(--blue)',
              color: '#fff',
              borderRadius: '8px',
              fontFamily: 'var(--font-body)',
              fontWeight: 700,
              fontSize: '13.5px',
              textDecoration: 'none',
              transition: 'transform 0.2s var(--ease-expo), box-shadow 0.2s var(--ease-expo)',
              boxShadow: '0 4px 16px rgba(21,120,229,0.35)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(21,120,229,0.45)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(21,120,229,0.35)';
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.44 2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.9a16 16 0 0 0 6 6l.9-.9a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z"/>
            </svg>
            Call Now
          </a>
        </nav>

        {/* ── Hamburger (mobile) ────────────────────────── */}
        <button
          ref={hamRef}
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
          className="nav-hamburger"
          style={{
            width: '40px', height: '40px',
            background: 'none', border: 'none',
            display: 'none', /* shown via CSS on mobile */
            flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: '5px', cursor: 'pointer',
            padding: '4px',
          }}
        >
          <span style={{
            display: 'block', width: '22px', height: '2px',
            background: scrolled ? 'var(--dark)' : '#fff',
            borderRadius: '999px',
            transition: 'transform 0.3s ease, opacity 0.3s ease',
            transform: menuOpen ? 'translateY(7px) rotate(45deg)' : 'none',
          }} />
          <span style={{
            display: 'block', width: '22px', height: '2px',
            background: scrolled ? 'var(--dark)' : '#fff',
            borderRadius: '999px',
            transition: 'transform 0.3s ease, opacity 0.3s ease',
            opacity: menuOpen ? 0 : 1,
          }} />
          <span style={{
            display: 'block', width: '22px', height: '2px',
            background: scrolled ? 'var(--dark)' : '#fff',
            borderRadius: '999px',
            transition: 'transform 0.3s ease, opacity 0.3s ease',
            transform: menuOpen ? 'translateY(-7px) rotate(-45deg)' : 'none',
          }} />
        </button>
      </div>

      {/* ── Mobile menu ───────────────────────────────────── */}
      <div
        ref={menuRef}
        style={{
          height: 0,
          overflow: 'hidden',
          background: 'rgba(255,255,255,0.98)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid var(--border)',
        }}
      >
        <ul style={{ listStyle: 'none', padding: '1rem 1.5rem 1.5rem' }}>
          {NAV_LINKS.map(link => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={e => scrollTo(e, link.href)}
                style={{
                  display: 'block',
                  padding: '0.85rem 0',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 600,
                  fontSize: '16px',
                  color: 'var(--dark)',
                  textDecoration: 'none',
                  borderBottom: '1px solid var(--border)',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--blue)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--dark)'}
              >
                {link.label}
              </a>
            </li>
          ))}
          <li style={{ marginTop: '1rem' }}>
            <a href="tel:3479546309" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '0.85rem',
              background: 'var(--blue)', color: '#fff',
              borderRadius: '10px',
              fontWeight: 700, fontSize: '15px',
              textDecoration: 'none',
            }}>
              📞 &nbsp;(347) 954-6309
            </a>
          </li>
        </ul>
      </div>

      {/* Responsive CSS for nav */}
      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-hamburger { display: flex !important; }
        }
      `}</style>
    </header>
  );
}
