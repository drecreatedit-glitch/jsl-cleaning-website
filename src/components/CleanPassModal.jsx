import { useState, useEffect, useRef, useCallback } from 'react';
import { TIERS } from './CleanPass';

/* ─── Brand tokens ─────────────────────────────────────────── */
const DARK   = '#0B1220';
const BLUE   = '#1578E5';
const GRAY   = '#5A6A82';
const WHITE  = '#FFFFFF';
const BORDER = '#D8E6F8';
const RED    = '#DC2626';
const LIGHT  = '#F4F9FF';

/* ─── Google Sheets endpoint (reuse same Apps Script) ───────── */
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzuC3j8kAyX9MTqPNWFbAaoPcgwjYj9xMVKE4qZWc5GH_KloNDeyklKeC2rq3lHbu7m/exec';

/* ─── Sanitize helper ───────────────────────────────────────── */
const sanitize = (s) => typeof s === 'string'
  ? s.replace(/<[^>]*>/g, '').replace(/javascript:/gi, '').replace(/on\w+\s*=/gi, '').trim().slice(0, 500)
  : s;

/* Validation */
const VALIDATE = {
  firstName: (v) => /^[A-Za-zÀ-ÿ' -]{1,60}$/.test(v.trim()) ? '' : 'Enter a valid first name',
  email:     (v) => /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Enter a valid email address',
  phone:     (v) => /^[\d\s()+\-.]{7,20}$/.test(v.trim()) ? '' : 'Enter a valid phone number',
  address:   (v) => v.trim().length >= 5 ? '' : 'Enter your full service address',
};

/* ─── Step indicator ────────────────────────────────────────── */
function StepDots({ step }) {
  return (
    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
      {[1, 2, 3].map(n => (
        <div key={n} style={{
          width: n === step ? 28 : 8, height: 8, borderRadius: '999px',
          background: n <= step ? BLUE : BORDER,
          transition: 'all 0.3s ease',
        }} />
      ))}
    </div>
  );
}

/* ─── Step 1: Choose tier ───────────────────────────────────── */
function Step1({ selectedTierId, onSelect }) {
  return (
    <div>
      <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '20px', color: DARK, marginBottom: '0.4rem', letterSpacing: '-0.5px' }}>
        Choose your CleanPass™ plan
      </h3>
      <p style={{ fontSize: '14px', color: GRAY, marginBottom: '1.5rem', fontFamily: "'DM Sans', sans-serif" }}>
        You can change or cancel anytime. No payment required today.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        {TIERS.map(tier => {
          const isSelected = selectedTierId === tier.id;
          return (
            <button
              key={tier.id}
              onClick={() => onSelect(tier.id)}
              style={{
                width: '100%', textAlign: 'left', cursor: 'pointer',
                padding: '1rem 1.25rem', borderRadius: '14px',
                border: `2px solid ${isSelected ? tier.accent : BORDER}`,
                background: isSelected ? tier.accentBg : WHITE,
                transition: 'all 0.18s ease', fontFamily: "'DM Sans', sans-serif",
                display: 'flex', alignItems: 'center', gap: '1rem',
                boxShadow: isSelected ? `0 4px 20px ${tier.accent}25` : 'none',
              }}
              onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = tier.accent; }}
              onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = BORDER; }}
            >
              <span style={{ fontSize: '28px', flexShrink: 0 }}>{tier.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2px' }}>
                  <span style={{ fontWeight: 800, fontSize: '16px', color: tier.accent }}>{tier.name}</span>
                  {tier.elevated && (
                    <span style={{ fontSize: '10px', fontWeight: 700, background: tier.accent, color: WHITE, borderRadius: '999px', padding: '2px 8px', letterSpacing: '0.5px' }}>MOST POPULAR</span>
                  )}
                </div>
                <div style={{ fontSize: '13px', color: GRAY }}>{tier.plan} · {tier.discount} off every clean</div>
                <div style={{ fontSize: '12px', color: GRAY, opacity: 0.7, marginTop: '1px' }}>{tier.commitment}</div>
              </div>
              <div style={{
                width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                border: `2px solid ${isSelected ? tier.accent : BORDER}`,
                background: isSelected ? tier.accent : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {isSelected && <span style={{ color: WHITE, fontSize: '10px', fontWeight: 700 }}>✓</span>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Step 2: Contact info ──────────────────────────────────── */
function Step2({ data, onChange, errors }) {
  const field = (key, label, placeholder, type = 'text', span = false) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', gridColumn: span ? '1 / -1' : undefined }}>
      <label style={{ fontSize: '12px', fontWeight: 600, color: DARK, fontFamily: "'DM Sans', sans-serif" }}>{label}</label>
      <input
        type={type}
        value={data[key] || ''}
        onChange={e => onChange(key, e.target.value)}
        placeholder={placeholder}
        maxLength={key === 'address' ? 200 : 100}
        style={{
          padding: '0.7rem 1rem', borderRadius: '10px', fontSize: '14px',
          border: `1.5px solid ${errors[key] ? RED : BORDER}`,
          outline: 'none', color: DARK, background: WHITE,
          fontFamily: "'DM Sans', sans-serif", transition: 'border-color 0.15s',
        }}
        onFocus={e => e.target.style.borderColor = BLUE}
        onBlur={e => e.target.style.borderColor = errors[key] ? RED : BORDER}
      />
      {errors[key] && <span style={{ fontSize: '11px', color: RED, fontWeight: 600 }}>⚠ {errors[key]}</span>}
    </div>
  );

  return (
    <div>
      <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '20px', color: DARK, marginBottom: '0.4rem', letterSpacing: '-0.5px' }}>
        Your contact details
      </h3>
      <p style={{ fontSize: '14px', color: GRAY, marginBottom: '1.5rem', fontFamily: "'DM Sans', sans-serif" }}>
        Josh will personally reach out to confirm your membership within 24 hours.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        {field('firstName', 'First Name *', 'Josh')}
        {field('lastName',  'Last Name',    'Lopez')}
        {field('email',     'Email *',      'josh@example.com', 'email')}
        {field('phone',     'Phone *',      '(347) 954-6309', 'tel')}
        {field('address',   'Service Address *', '123 Main St, Miami FL 33101', 'text', true)}
      </div>
      <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <label style={{ fontSize: '12px', fontWeight: 600, color: DARK, fontFamily: "'DM Sans', sans-serif" }}>Notes (optional)</label>
        <textarea
          value={data.notes || ''}
          onChange={e => onChange('notes', e.target.value)}
          placeholder="Any details about your home, entry instructions, or questions..."
          rows={3}
          maxLength={500}
          style={{
            padding: '0.7rem 1rem', borderRadius: '10px', fontSize: '14px',
            border: `1.5px solid ${BORDER}`, outline: 'none', color: DARK, background: WHITE,
            fontFamily: "'DM Sans', sans-serif", resize: 'vertical',
          }}
          onFocus={e => e.target.style.borderColor = BLUE}
          onBlur={e => e.target.style.borderColor = BORDER}
        />
      </div>
    </div>
  );
}

/* ─── Step 3: Confirm ───────────────────────────────────────── */
function Step3({ data, tier, consentChecked, setConsentChecked }) {
  const rows = [
    ['Plan',    `${tier.icon} ${tier.name} CleanPass™`],
    ['Discount', `${tier.discount} off every clean`],
    ['Commitment', tier.commitment],
    ['Name',    `${data.firstName || ''} ${data.lastName || ''}`.trim()],
    ['Email',   data.email || '—'],
    ['Phone',   data.phone || '—'],
    ['Address', data.address || '—'],
  ];

  return (
    <div>
      <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '20px', color: DARK, marginBottom: '0.4rem', letterSpacing: '-0.5px' }}>
        Confirm your enrollment
      </h3>
      <p style={{ fontSize: '14px', color: GRAY, marginBottom: '1.25rem', fontFamily: "'DM Sans', sans-serif" }}>
        Everything look right? Josh will personally reach out within 24 hours.
      </p>

      {/* Summary card */}
      <div style={{ borderRadius: '16px', border: `2px solid ${tier.accent}40`, overflow: 'hidden', marginBottom: '1.25rem' }}>
        <div style={{ background: DARK, padding: '0.85rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '20px' }}>{tier.icon}</span>
          <div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontFamily: "'DM Sans', sans-serif", fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase' }}>CleanPass™ Enrollment</div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: tier.accent, fontFamily: "'Syne', sans-serif" }}>{tier.name} Plan</div>
          </div>
        </div>
        <div style={{ padding: '0.5rem 0' }}>
          {rows.map(([label, val]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 1.25rem', borderBottom: `1px solid ${BORDER}` }}>
              <span style={{ fontSize: '13px', color: GRAY, fontFamily: "'DM Sans', sans-serif" }}>{label}</span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: DARK, fontFamily: "'DM Sans', sans-serif", textAlign: 'right', maxWidth: '60%' }}>{val}</span>
            </div>
          ))}
        </div>
        <div style={{ background: LIGHT, padding: '0.75rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', color: GRAY, fontFamily: "'DM Sans', sans-serif" }}>Enrollment fee</span>
          <span style={{ fontSize: '16px', fontWeight: 800, color: BLUE, fontFamily: "'Syne', sans-serif" }}>Free</span>
        </div>
      </div>

      {/* Consent */}
      <label style={{
        display: 'flex', alignItems: 'flex-start', gap: '0.6rem', cursor: 'pointer',
        padding: '0.85rem 1rem', borderRadius: '12px',
        background: consentChecked ? `${tier.accent}0D` : '#FFF9F9',
        border: `1.5px solid ${consentChecked ? `${tier.accent}40` : '#FECACA'}`,
        transition: 'all 0.2s', marginTop: '0.5rem',
      }}>
        <input
          type="checkbox"
          checked={consentChecked}
          onChange={e => setConsentChecked(e.target.checked)}
          style={{ width: 16, height: 16, marginTop: '2px', accentColor: tier.accent, flexShrink: 0, cursor: 'pointer' }}
        />
        <span style={{ fontSize: '12.5px', color: GRAY, lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif" }}>
          I agree that JSL Cleaning Services LLC may contact me to confirm my CleanPass™ membership. No payment is required today. I have read the{' '}
          <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('jsl:open-legal', { detail: 'terms' }))}
            style={{ background: 'none', border: 'none', padding: 0, color: BLUE, fontWeight: 600, fontSize: '12.5px', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline' }}>
            Terms of Service
          </button>. <span style={{ color: RED, fontWeight: 700 }}>*</span>
        </span>
      </label>
    </div>
  );
}

/* ─── Success screen ────────────────────────────────────────── */
function SuccessScreen({ data, tier, onClose }) {
  return (
    <div style={{ textAlign: 'center', padding: '1rem 0' }}>
      <div style={{ fontSize: '56px', marginBottom: '1rem', animation: 'jsl-pop 0.5s cubic-bezier(0.16,1,0.3,1) both' }}>
        {tier.icon}
      </div>
      <style>{`
        @keyframes jsl-pop { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
        background: `${tier.accent}15`, borderRadius: '999px', padding: '5px 14px', marginBottom: '1rem',
      }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color: tier.accent, letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: "'DM Sans', sans-serif" }}>
          {tier.name} Member
        </span>
      </div>
      <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '24px', color: '#0B1220', marginBottom: '0.75rem', letterSpacing: '-0.5px', lineHeight: 1.2 }}>
        Welcome to JSL CleanPass™, {data.firstName || 'there'}!
      </h3>
      <p style={{ fontSize: '15px', color: GRAY, lineHeight: 1.65, marginBottom: '1rem', fontFamily: "'DM Sans', sans-serif", maxWidth: '400px', margin: '0 auto 1rem' }}>
        Josh will personally reach out within 24 hours to confirm your {tier.name} membership and schedule your first clean.
      </p>
      <div style={{
        background: LIGHT, borderRadius: '12px', padding: '0.85rem 1.25rem',
        border: `1px solid ${BORDER}`, marginBottom: '1.5rem', display: 'inline-flex', gap: '0.75rem', alignItems: 'center',
      }}>
        <span style={{ fontSize: '18px' }}>📱</span>
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontSize: '11px', color: GRAY, fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>Josh's direct line</div>
          <a href="tel:3479546309" style={{ fontSize: '15px', fontWeight: 700, color: BLUE, textDecoration: 'none', fontFamily: "'DM Sans', sans-serif" }}>(347) 954-6309</a>
        </div>
      </div>
      <div>
        <button
          onClick={onClose}
          style={{
            padding: '0.9rem 2.5rem', borderRadius: '999px', background: BLUE,
            border: 'none', color: WHITE, fontWeight: 700, fontSize: '15px',
            cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
            boxShadow: '0 4px 16px rgba(21,120,229,0.35)',
            transition: 'transform 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          Done ✓
        </button>
      </div>
    </div>
  );
}

/* ─── Main CleanPassModal ───────────────────────────────────── */
export default function CleanPassModal({ initialTierId = 'gold', onClose }) {
  const [step, setStep] = useState(1);
  const [tierId, setTierId] = useState(initialTierId || 'gold');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [errors, setErrors] = useState({});
  const honeypotRef = useRef(null);
  const closeRef = useRef(null);
  const [data, setData] = useState({ firstName: '', lastName: '', email: '', phone: '', address: '', notes: '' });

  const tier = TIERS.find(t => t.id === tierId) || TIERS[1];

  const onChange = useCallback((key, val) => {
    setData(prev => ({ ...prev, [key]: sanitize(val) }));
    setErrors(prev => ({ ...prev, [key]: '' }));
  }, []);

  /* Focus + scroll lock */
  useEffect(() => {
    closeRef.current?.focus();
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  /* Esc */
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  const canProceed = () => {
    if (step === 1) return !!tierId;
    if (step === 2) return !!data.firstName && !!data.email && !!data.phone && !!data.address;
    if (step === 3) return consentChecked;
    return true;
  };

  const handleNext = async () => {
    if (step === 1) { setStep(2); return; }
    if (step === 2) {
      const errs = {};
      ['firstName', 'email', 'phone', 'address'].forEach(k => {
        const msg = VALIDATE[k]?.(data[k] || '');
        if (msg) errs[k] = msg;
      });
      if (Object.keys(errs).length) { setErrors(errs); return; }
      setStep(3); return;
    }
    if (step === 3) {
      if (honeypotRef.current?.value) { setSubmitted(true); return; }
      setIsSubmitting(true);
      try {
        await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST', mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: data.firstName, lastName: data.lastName,
            email: data.email, phone: data.phone, address: data.address,
            service: `CleanPass™ ${tier.name} Membership`,
            frequency: tier.commitment, notes: data.notes,
            estimate: null,
          }),
        });
      } catch (_) { /* Network error — still show success (no payment involved) */ }
      finally { setIsSubmitting(false); }
      setSubmitted(true);
    }
  };

  const STEP_LABELS = ['Choose Plan', 'Your Info', 'Confirm'];

  return (
    <div
      role="dialog" aria-modal="true" aria-label="CleanPass Enrollment"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 10001,
        background: 'rgba(11,18,32,0.8)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 'clamp(0.75rem, 2vw, 2rem)',
        animation: 'jsl-fade-in 0.2s ease both',
        overflowY: 'auto',
      }}
    >
      <div style={{
        background: WHITE, borderRadius: '24px', width: '100%', maxWidth: '540px',
        boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
        animation: 'jsl-slide-modal 0.28s cubic-bezier(0.16,1,0.3,1) both',
        overflow: 'hidden', flexShrink: 0,
      }}>

        {/* Header */}
        <div style={{ background: DARK, padding: '1.25rem 1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '2px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontFamily: "'DM Sans', sans-serif", marginBottom: '4px' }}>
              JSL CleanPass™
            </div>
            {!submitted ? (
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '18px', color: WHITE }}>
                {STEP_LABELS[step - 1]}
              </div>
            ) : (
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '18px', color: tier.accent }}>
                Enrollment Complete!
              </div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {!submitted && <StepDots step={step} />}
            <button
              ref={closeRef}
              onClick={onClose}
              aria-label="Close"
              style={{
                width: 36, height: 36, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.7)',
                fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'inherit', transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
            >✕</button>
          </div>
        </div>

        {/* Honeypot */}
        <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none', height: 0 }}>
          <input ref={honeypotRef} name="cp_website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
        </div>

        {/* Body */}
        <div style={{ padding: 'clamp(1.5rem, 4vw, 2rem)' }}>
          {submitted ? (
            <SuccessScreen data={data} tier={tier} onClose={onClose} />
          ) : step === 1 ? (
            <Step1 selectedTierId={tierId} onSelect={setTierId} />
          ) : step === 2 ? (
            <Step2 data={data} onChange={onChange} errors={errors} />
          ) : (
            <Step3 data={data} tier={tier} consentChecked={consentChecked} setConsentChecked={setConsentChecked} />
          )}
        </div>

        {/* Footer nav */}
        {!submitted && (
          <div style={{
            padding: '1rem 1.75rem', borderTop: `1px solid ${BORDER}`,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem',
          }}>
            <button
              onClick={step === 1 ? onClose : () => setStep(s => s - 1)}
              style={{
                padding: '0.7rem 1.25rem', borderRadius: '999px',
                border: `2px solid ${BORDER}`, background: 'transparent',
                color: GRAY, fontWeight: 700, fontSize: '13px',
                cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {step === 1 ? 'Cancel' : '← Back'}
            </button>
            <button
              onClick={handleNext}
              disabled={!canProceed() || isSubmitting}
              style={{
                padding: '0.75rem 1.75rem', borderRadius: '999px',
                background: canProceed() && !isSubmitting ? tier.accent : `${tier.accent}50`,
                border: 'none', color: WHITE, fontWeight: 700, fontSize: '14px',
                cursor: canProceed() && !isSubmitting ? 'pointer' : 'not-allowed',
                fontFamily: "'DM Sans', sans-serif", transition: 'all 0.18s', minWidth: '130px',
                boxShadow: canProceed() ? `0 4px 16px ${tier.accent}35` : 'none',
              }}
              onMouseEnter={e => { if (canProceed()) e.currentTarget.style.transform = 'scale(1.03)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              {isSubmitting ? '⏳ Submitting...' : step === 3 ? `👑 Enroll in ${tier.name}` : 'Continue →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
