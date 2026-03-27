import { useEffect, useRef } from 'react';
import PrivacyPolicy from './PrivacyPolicy';
import TermsOfService from './TermsOfService';

const DARK  = '#0B1220';
const BLUE  = '#1578E5';
const GRAY  = '#5A6A82';

/**
 * LegalModal — full-screen overlay for Privacy Policy and Terms of Service.
 * Accessible: Esc to close, focus trap, scroll lock, aria-modal.
 *
 * @param {('privacy'|'terms'|null)} page — which page to show
 * @param {Function} onClose — callback to close the modal
 */
export default function LegalModal({ page, onClose }) {
  const overlayRef  = useRef(null);
  const closeRef    = useRef(null);

  /* Focus the close button on open */
  useEffect(() => {
    if (page) {
      closeRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [page]);

  /* Esc key to close */
  useEffect(() => {
    if (!page) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [page, onClose]);

  /* Click outside content to close */
  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  if (!page) return null;

  const title = page === 'privacy' ? 'Privacy Policy' : 'Terms of Service';
  const updated = 'March 27, 2026';

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={handleOverlayClick}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        background: 'rgba(11,18,32,0.75)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        overflowY: 'auto',
        padding: 'clamp(1rem, 3vw, 3rem) clamp(1rem, 3vw, 2rem)',
        animation: 'jsl-fade-in 0.2s ease both',
      }}
    >
      <style>{`
        @keyframes jsl-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes jsl-slide-modal {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{
        background: '#ffffff',
        borderRadius: '24px',
        maxWidth: '760px',
        width: '100%',
        boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
        animation: 'jsl-slide-modal 0.25s cubic-bezier(0.16,1,0.3,1) both',
        overflow: 'hidden',
      }}>

        {/* ── Header bar ───────────────────────────────── */}
        <div style={{
          background: DARK,
          padding: '1.5rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{
              fontSize: '11px', fontWeight: 700, letterSpacing: '2px',
              color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase',
              marginBottom: '4px', fontFamily: "'DM Sans', sans-serif",
            }}>
              JSL Cleaning Services LLC
            </div>
            <h2 style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800, fontSize: '22px',
              color: '#ffffff', margin: 0, letterSpacing: '-0.5px',
            }}>
              {title}
            </h2>
          </div>
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 40, height: 40, borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.07)',
              color: 'rgba(255,255,255,0.7)',
              fontSize: '18px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.15s',
              fontFamily: 'inherit',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
          >
            ✕
          </button>
        </div>

        {/* ── Last updated ─────────────────────────────── */}
        <div style={{
          background: '#F4F9FF',
          padding: '0.6rem 2rem',
          borderBottom: '1px solid #D8E6F8',
          fontSize: '12px',
          color: GRAY,
          fontFamily: "'DM Sans', sans-serif",
        }}>
          Last updated: {updated} · Questions?&nbsp;
          <a href="mailto:jlopez@jslcleaningservices.com" style={{ color: BLUE, textDecoration: 'none', fontWeight: 600 }}>
            jlopez@jslcleaningservices.com
          </a>
        </div>

        {/* ── Content ──────────────────────────────────── */}
        <div style={{ padding: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
          {page === 'privacy' ? <PrivacyPolicy /> : <TermsOfService />}
        </div>

        {/* ── Footer ───────────────────────────────────── */}
        <div style={{
          padding: '1.25rem 2rem',
          borderTop: '1px solid #D8E6F8',
          display: 'flex',
          justifyContent: 'flex-end',
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.75rem 2rem',
              borderRadius: '999px',
              background: BLUE,
              border: 'none',
              color: '#fff',
              fontWeight: 700, fontSize: '14px',
              cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
