import { useState, useRef, useEffect } from 'react';

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzuC3j8kAyX9MTqPNWFbAaoPcgwjYj9xMVKE4qZWc5GH_KloNDeyklKeC2rq3lHbu7m/exec';

const BLUE  = '#1578E5';
const DARK  = '#0B1220';
const GRAY  = '#5A6A82';
const WHITE = '#FFFFFF';
const BORDER = '#D8E6F8';

function IconX() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconEnvelope() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <path d="M2 7l10 7 10-7"/>
    </svg>
  );
}

const FIELD = ({ label, id, type = 'text', value, onChange, required, placeholder }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
    <label htmlFor={id} style={{ fontSize: '12px', fontWeight: 700, color: GRAY, letterSpacing: '1px', textTransform: 'uppercase' }}>
      {label}{required && <span style={{ color: BLUE }}> *</span>}
    </label>
    <input
      id={id}
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      style={{
        padding: '0.75rem 1rem',
        borderRadius: '10px',
        border: `1.5px solid ${BORDER}`,
        fontSize: '15px',
        color: DARK,
        background: WHITE,
        outline: 'none',
        fontFamily: 'var(--font-body)',
        transition: 'border-color 0.2s',
      }}
      onFocus={e => { e.currentTarget.style.borderColor = BLUE; }}
      onBlur={e => { e.currentTarget.style.borderColor = BORDER; }}
    />
  </div>
);

export default function SpecialRequestModal({ onClose }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', summary: '' });
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const overlayRef = useRef(null);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  /* Close on overlay click */
  const handleOverlay = (e) => { if (e.target === overlayRef.current) onClose(); };

  /* Trap focus + close on Escape */
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (honeypot) return; // bot trap
    if (!form.name || !form.email || !form.summary) return;

    setStatus('submitting');
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'special-request', ...form }),
      });
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlay}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(11,18,32,0.65)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div style={{
        background: WHITE,
        borderRadius: '24px',
        width: '100%',
        maxWidth: '520px',
        boxShadow: '0 24px 80px rgba(11,18,32,0.25)',
        overflow: 'hidden',
        position: 'relative',
      }}>
        {/* Header */}
        <div style={{
          background: DARK,
          padding: '1.5rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: WHITE }}>
            <div style={{
              width: 40, height: 40, borderRadius: '12px',
              background: `rgba(21,120,229,0.2)`,
              border: '1px solid rgba(21,120,229,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: BLUE,
            }}>
              <IconEnvelope />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '17px', letterSpacing: '-0.3px' }}>Special Request</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '1px' }}>
                We'll reply within 24 hours
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '8px',
              color: 'rgba(255,255,255,0.7)',
              width: 36, height: 36,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <IconX />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '2rem' }}>
          {status === 'success' ? (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'linear-gradient(135deg, #1578E5, #3D8FF0)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.25rem',
                boxShadow: '0 8px 24px rgba(21,120,229,0.35)',
              }}>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <path d="M7 14l5 5 9-10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: 700, color: DARK, marginBottom: '0.5rem' }}>
                Request Sent!
              </h3>
              <p style={{ fontSize: '15px', color: GRAY, maxWidth: '340px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
                We've received your message and will get back to you within 24 hours.
              </p>
              <button
                onClick={onClose}
                style={{
                  padding: '0.75rem 2rem', borderRadius: '999px',
                  background: BLUE, color: WHITE, border: 'none',
                  fontWeight: 700, fontSize: '14px', cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                }}
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Honeypot */}
              <input
                type="text"
                name="website"
                value={honeypot}
                onChange={e => setHoneypot(e.target.value)}
                style={{ position: 'absolute', left: '-9999px', opacity: 0 }}
                tabIndex={-1}
                autoComplete="off"
              />

              <FIELD id="sr-name" label="Your Name" value={form.name} onChange={v => set('name', v)} required placeholder="Jane Smith" />
              <FIELD id="sr-email" label="Email Address" type="email" value={form.email} onChange={v => set('email', v)} required placeholder="you@example.com" />
              <FIELD id="sr-phone" label="Phone (optional)" type="tel" value={form.phone} onChange={v => set('phone', v)} placeholder="(555) 000-0000" />

              {/* Summary textarea */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label htmlFor="sr-summary" style={{ fontSize: '12px', fontWeight: 700, color: GRAY, letterSpacing: '1px', textTransform: 'uppercase' }}>
                  What are you looking for? <span style={{ color: BLUE }}>*</span>
                </label>
                <textarea
                  id="sr-summary"
                  value={form.summary}
                  onChange={e => set('summary', e.target.value)}
                  placeholder="Tell us about your space, what type of cleaning you need, any special requirements..."
                  required
                  rows={4}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    border: `1.5px solid ${BORDER}`,
                    fontSize: '15px',
                    color: DARK,
                    background: WHITE,
                    outline: 'none',
                    fontFamily: 'var(--font-body)',
                    resize: 'vertical',
                    lineHeight: 1.6,
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = BLUE; }}
                  onBlur={e => { e.currentTarget.style.borderColor = BORDER; }}
                />
              </div>

              {status === 'error' && (
                <p style={{ fontSize: '13px', color: '#DC2626', fontWeight: 500 }}>
                  Couldn't send — please email us directly at{' '}
                  <a href="mailto:jlopez@jslcleaningservices.com" style={{ color: '#DC2626' }}>
                    jlopez@jslcleaningservices.com
                  </a>
                </p>
              )}

              <button
                type="submit"
                disabled={status === 'submitting'}
                style={{
                  padding: '0.9rem',
                  borderRadius: '12px',
                  background: status === 'submitting' ? 'rgba(21,120,229,0.6)' : BLUE,
                  color: WHITE,
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '15px',
                  cursor: status === 'submitting' ? 'default' : 'pointer',
                  fontFamily: 'var(--font-body)',
                  transition: 'background 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
              >
                {status === 'submitting' ? 'Sending…' : 'Send Request'}
              </button>

              <p style={{ fontSize: '11px', color: GRAY, textAlign: 'center', lineHeight: 1.5 }}>
                We'll reply within 24 hours. No commitment required.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
