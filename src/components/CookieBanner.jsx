import { useState, useEffect } from 'react';

const STORAGE_KEY = 'jsl_cookie_notice_dismissed';

/**
 * CookieBanner — minimal, non-intrusive bottom-left notice.
 * JSL currently uses no tracking cookies. This banner is informational —
 * just lets visitors know. Dismissed state persists in localStorage.
 *
 * If analytics (GA4) are added in future, upgrade this to a proper
 * accept/decline consent banner and update the CSP connect-src.
 */
export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show only if not already dismissed
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      // Small delay so it doesn't pop up before the hero loads
      const t = setTimeout(() => setVisible(true), 1800);
      return () => clearTimeout(t);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie notice"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        left: '1.5rem',
        zIndex: 9000,
        maxWidth: '340px',
        background: '#0B1220',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px',
        padding: '1rem 1.25rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
        animation: 'jsl-slide-up 0.3s cubic-bezier(0.16,1,0.3,1) both',
      }}
    >
      <style>{`
        @keyframes jsl-slide-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Icon */}
      <span style={{ fontSize: '20px', flexShrink: 0, marginTop: '1px' }}>🍪</span>

      {/* Text */}
      <div style={{ flex: 1 }}>
        <p style={{
          fontSize: '13px',
          color: 'rgba(255,255,255,0.75)',
          lineHeight: 1.55,
          margin: 0,
          fontFamily: "'DM Sans', sans-serif",
        }}>
          We use only essential cookies — no tracking or advertising.{' '}
          <button
            onClick={() => { window.dispatchEvent(new CustomEvent('jsl:open-legal', { detail: 'privacy' })); dismiss(); }}
            aria-label="Open privacy policy"
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              color: '#1578E5',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              textDecoration: 'underline',
            }}
          >
            Learn more
          </button>
        </p>
      </div>

      {/* Dismiss */}
      <button
        onClick={dismiss}
        aria-label="Dismiss cookie notice"
        style={{
          flexShrink: 0,
          background: '#1578E5',
          border: 'none',
          borderRadius: '8px',
          padding: '0.35rem 0.85rem',
          color: '#fff',
          fontSize: '12px',
          fontWeight: 700,
          cursor: 'pointer',
          fontFamily: "'DM Sans', sans-serif",
          whiteSpace: 'nowrap',
        }}
      >
        Got it
      </button>
    </div>
  );
}
