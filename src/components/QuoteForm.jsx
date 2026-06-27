import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import useIsMobile from '../hooks/useIsMobile';

/* ─── Brand tokens ───────────────────────────────────────── */
const BLUE     = '#1578E5';
const DARK     = '#0B1220';
const LIGHT_BG = '#F4F9FF';
const BORDER   = '#D8E6F8';
const GRAY     = '#5A6A82';
const WHITE    = '#FFFFFF';
const BLUE_MID = '#3D8FF0';
const RED      = '#DC2626';

/* ─── Estimate range formatter ───────────────────────────────
   Returns "$180–$230" (±10–15%, rounded to nearest $5).
   Keeps "Custom" path for isCustom estimates.
   ─────────────────────────────────────────────────────────── */
function formatRange(total) {
  const low  = Math.round((total * 0.90) / 5) * 5;
  const high = Math.round((total * 1.15) / 5) * 5;
  return `$${low}–$${high}`;
}

/* ─── Image downscaler ───────────────────────────────────────
   Resizes an uploaded image so its longest edge ≤ 1280px and
   re-encodes as JPEG (~0.7 quality). Keeps the base64 payload
   small (~100–300 KB) so submissions don't fail on size.
   Returns a Promise resolving to a data-URL string.
   ─────────────────────────────────────────────────────────── */
function downscaleImage(file, maxEdge = 1280, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('image load failed')); };
    img.src = url;
  });
}

/* ─── Google Sheets webhook ──────────────────────────────────
   Paste your Apps Script Web App URL here after deploying.
   See: google-apps-script.js in project root for the script.
   ─────────────────────────────────────────────────────────── */
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzuC3j8kAyX9MTqPNWFbAaoPcgwjYj9xMVKE4qZWc5GH_KloNDeyklKeC2rq3lHbu7m/exec';

/* ══════════════════════════════════════════════════════════
   SECURITY LAYER
   ══════════════════════════════════════════════════════════ */

/**
 * sanitizeText — strips HTML tags, script content, and control
 * characters from any free-text input before it enters state or
 * gets sent anywhere. React already escapes output, but this
 * ensures no malicious strings are stored even in state.
 */
const sanitizeText = (str) => {
  if (typeof str !== 'string') return '';
  return str
    .replace(/<[^>]*>/g, '')           // strip HTML tags
    .replace(/javascript:/gi, '')      // strip JS pseudo-protocol
    .replace(/on\w+\s*=/gi, '')        // strip inline event handlers
    .replace(/[<>'"\\]/g, (c) => ({    // encode remaining specials
      '<': '&lt;', '>': '&gt;',
      "'": '&#39;', '"': '&quot;',
      '\\': '&#92;',
    }[c]))
    .trim()
    .slice(0, 500);                    // hard length cap — 500 chars max per field
};

/** Field-level validation rules */
const RULES = {
  firstName: {
    re: /^[A-Za-zÀ-ÿ' -]{1,60}$/,
    msg: 'First name must be letters only (1–60 characters)',
  },
  lastName: {
    re: /^[A-Za-zÀ-ÿ' -]{0,60}$/,
    msg: 'Last name must be letters only (max 60 characters)',
  },
  email: {
    re: /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/,
    msg: 'Enter a valid email address',
  },
  phone: {
    // Accepts: (123) 456-7890, 123-456-7890, +1 123 456 7890, etc.
    re: /^[\d\s()+\-\.]{7,20}$/,
    msg: 'Enter a valid phone number',
  },
  address: {
    re: /^.{5,200}$/,
    msg: 'Enter a full service address (5–200 characters)',
  },
};

/**
 * validateStep — returns an object of { fieldName: errorMessage }
 * for all invalid fields in the given step. Empty object = valid.
 */
const validateStep = (step, data) => {
  const errors = {};
  if (step === 5) {
    ['firstName', 'email', 'phone', 'address'].forEach(field => {
      const val = data[field] || '';
      const rule = RULES[field];
      if (!val.trim()) {
        errors[field] = `${field === 'firstName' ? 'First name' : field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      } else if (rule && !rule.re.test(val.trim())) {
        errors[field] = rule.msg;
      }
    });
    if (data.lastName && !RULES.lastName.re.test(data.lastName.trim())) {
      errors.lastName = RULES.lastName.msg;
    }
  }
  return errors;
};

/**
 * Rate-limit guard — allows max 3 submissions per 10 minutes.
 * Client-side only (server-side rate-limiting needed via backend/Netlify Forms).
 * Returns { allowed: bool, secondsUntilReset: number }
 */
const RATE_LIMIT_MAX  = 3;
const RATE_LIMIT_MS   = 10 * 60 * 1000; // 10 minutes
const submissionTimes = []; // module-level — persists across renders

const checkRateLimit = () => {
  const now = Date.now();
  // Purge timestamps older than the window
  while (submissionTimes.length && submissionTimes[0] < now - RATE_LIMIT_MS) {
    submissionTimes.shift();
  }
  if (submissionTimes.length >= RATE_LIMIT_MAX) {
    const oldestInWindow = submissionTimes[0];
    const secondsUntilReset = Math.ceil((oldestInWindow + RATE_LIMIT_MS - now) / 1000);
    return { allowed: false, secondsUntilReset };
  }
  return { allowed: true, secondsUntilReset: 0 };
};

const recordSubmission = () => submissionTimes.push(Date.now());

/* ══════════════════════════════════════════════════════════ */

/* ─── Service data ───────────────────────────────────────── */
const SERVICES = [
  { id: 'basic',     label: 'Basic Cleaning',     icon: '🧹', base: 150, rate: 0.135, desc: 'Kitchens, baths, living areas' },
  { id: 'deep',      label: 'Deep Cleaning',       icon: '✨', base: 245, rate: 0.22,  desc: 'Inside appliances, grout, corners' },
  { id: 'movein',    label: 'Move-In / Move-Out',  icon: '📦', base: 320, rate: 0.28,  desc: 'Cabinet interiors, deodorize, full detail' },
  { id: 'airbnb',    label: 'Airbnb Turnover',    icon: '🏠', base: 0,   desc: 'Guest-ready between stays', customQuote: true },
  { id: 'office',    label: 'Office Cleaning',     icon: '🏢', base: 0,   desc: 'Commercial & retail spaces', customQuote: true },
  { id: 'recurring', label: 'Recurring Plan',      icon: '🔄', base: 140, rate: 0.135, desc: 'Weekly, bi-weekly, or monthly' },
];

const FREQUENCIES = [
  { id: 'onetime',    label: 'One-Time',    multiplier: 1.0,  discount: null },
  { id: 'monthly',    label: 'Monthly',     multiplier: 0.90, discount: '10% off' },
  { id: 'biweekly',   label: 'Bi-Weekly',   multiplier: 0.85, discount: '15% off' },
  { id: 'weekly',     label: 'Weekly',      multiplier: 0.80, discount: '20% off' },
];

const ADDONS = [
  { id: 'inside_fridge', label: 'Inside Refrigerator', price: 35, icon: '🧊' },
  { id: 'inside_oven',   label: 'Inside Oven',          price: 35, icon: '🍳' },
  { id: 'laundry',       label: 'Laundry (wash + fold)', price: 40, icon: '👕' },
  { id: 'windows',       label: 'Interior Windows',     price: 50, icon: '🪟' },
  { id: 'garage',        label: 'Garage Sweep',         price: 45, icon: '🚗' },
  { id: 'patio',         label: 'Patio / Balcony',      price: 40, icon: '🌿' },
  { id: 'cabinets',      label: 'Inside Cabinets',      price: 60, icon: '🗄️' },
  { id: 'carpet',        label: 'Carpet Shampoo',       price: 80, icon: '🪣' },
];

const STEPS = [
  { num: 1, label: 'Service' },
  { num: 2, label: 'Property' },
  { num: 3, label: 'Schedule' },
  { num: 4, label: 'Add-Ons' },
  { num: 5, label: 'Contact' },
  { num: 6, label: 'Review' },
];

/* ─── Pricing factors ─────────────────────────────────────────
   Square-footage-based model. Each service has a per-sqft `rate`
   and a minimum floor (`base`, also the "Starting at" anchor).
   South Florida market rates are baked into the per-sqft rates.
   Bedrooms/bathrooms are collected for scoping but do NOT affect
   the ballpark — square footage is the single pricing driver.
   ─────────────────────────────────────────────────────────── */
const OFFICE_SURCHARGE = 1.35; // +35% for commercial / office property type
const PET_SURCHARGE    = 1.10; // +10% when pets are present (hair/dander adds labor)

/* ─── Framer Motion variants ─────────────────────────────── */
const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:  (dir) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

/* ─── Shared UI atoms ────────────────────────────────────── */
const Pill = ({ children, active, onClick, extraStyle = {} }) => (
  <button
    onClick={onClick}
    style={{
      padding: '0.45rem 1.1rem',
      borderRadius: '999px',
      border: `1.5px solid ${active ? BLUE : BORDER}`,
      background: active ? BLUE : WHITE,
      color: active ? WHITE : GRAY,
      fontSize: '13px', fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.18s ease',
      fontFamily: 'var(--font-body)',
      ...extraStyle,
    }}
  >
    {children}
  </button>
);

const Counter = ({ label, sub, value, onDec, onInc, min = 0, max = 20 }) => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '1rem 1.25rem',
    background: WHITE, borderRadius: '14px',
    border: `1.5px solid ${BORDER}`,
  }}>
    <div>
      <div style={{ fontWeight: 600, fontSize: '15px', color: DARK }}>{label}</div>
      {sub && <div style={{ fontSize: '12px', color: GRAY }}>{sub}</div>}
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <button onClick={onDec} disabled={value <= min} style={{
        width: 32, height: 32, borderRadius: '50%',
        border: `1.5px solid ${BORDER}`, background: WHITE,
        fontSize: '18px', cursor: value <= min ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: value <= min ? BORDER : DARK, transition: 'all 0.15s',
      }}>−</button>
      <span style={{ fontWeight: 700, fontSize: '18px', color: DARK, minWidth: 24, textAlign: 'center' }}>{value}</span>
      <button onClick={onInc} disabled={value >= max} style={{
        width: 32, height: 32, borderRadius: '50%',
        border: `1.5px solid ${BLUE}`, background: BLUE,
        fontSize: '18px', cursor: value >= max ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: WHITE, transition: 'all 0.15s',
      }}>+</button>
    </div>
  </div>
);

const Input = ({ label, type = 'text', value, onChange, placeholder, required }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
    <label style={{ fontSize: '13px', fontWeight: 600, color: DARK, fontFamily: 'var(--font-body)' }}>
      {label}{required && <span style={{ color: BLUE }}> *</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      style={{
        padding: '0.75rem 1rem',
        border: `1.5px solid ${BORDER}`,
        borderRadius: '10px',
        fontSize: '15px',
        color: DARK,
        background: WHITE,
        outline: 'none',
        fontFamily: 'var(--font-body)',
        transition: 'border-color 0.15s',
      }}
      onFocus={e => e.target.style.borderColor = BLUE}
      onBlur={e => e.target.style.borderColor = BORDER}
    />
  </div>
);

/* ─── Step 1: Service selection ───────────────────────────── */
function Step1({ data, set }) {
  return (
    <div>
      <h3 style={{ fontSize: '22px', fontWeight: 800, color: DARK, marginBottom: '0.4rem', fontFamily: 'var(--font-display)' }}>
        What type of cleaning do you need?
      </h3>
      <p style={{ fontSize: '15px', color: GRAY, marginBottom: '1.75rem' }}>Choose the service that best fits your space.</p>
      <div className="qf-step-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.85rem' }}>
        {SERVICES.map(svc => (
          <button
            key={svc.id}
            onClick={() => set('service', svc.id)}
            style={{
              textAlign: 'left', padding: '1.2rem',
              borderRadius: '16px',
              border: `2px solid ${data.service === svc.id ? BLUE : BORDER}`,
              background: data.service === svc.id ? 'rgba(21,120,229,0.06)' : WHITE,
              cursor: 'pointer', transition: 'all 0.18s ease',
              position: 'relative', overflow: 'hidden',
            }}
          >
            {data.service === svc.id && (
              <div style={{
                position: 'absolute', top: 10, right: 10,
                width: 20, height: 20, borderRadius: '50%',
                background: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ color: WHITE, fontSize: '11px', fontWeight: 700 }}>✓</span>
              </div>
            )}
            <div style={{ fontSize: '28px', marginBottom: '0.5rem' }}>{svc.icon}</div>
            <div style={{ fontWeight: 700, fontSize: '14px', color: DARK, marginBottom: '0.2rem', fontFamily: 'var(--font-display)' }}>{svc.label}</div>
            <div style={{ fontSize: '12px', color: GRAY, lineHeight: 1.4 }}>{svc.desc}</div>
            {svc.customQuote && (
              <div style={{ marginTop: '0.5rem', fontSize: '11px', fontWeight: 700, color: BLUE_MID }}>CUSTOM QUOTE</div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Step 2: Property details ────────────────────────────── */
function Step2({ data, set }) {
  const sqft = data.sqft || 1000;
  const [showSqftTip, setShowSqftTip] = useState(false);
  return (
    <div>
      <h3 style={{ fontSize: '22px', fontWeight: 800, color: DARK, marginBottom: '0.4rem', fontFamily: 'var(--font-display)' }}>
        Tell us about your property.
      </h3>
      <p style={{ fontSize: '15px', color: GRAY, marginBottom: '1.75rem' }}>This helps us give you an accurate estimate.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <Counter label="Bedrooms" value={data.bedrooms || 1} onDec={() => set('bedrooms', Math.max(0, (data.bedrooms||1) - 1))} onInc={() => set('bedrooms', Math.min(10, (data.bedrooms||1) + 1))} min={0} max={10} />
        <Counter label="Bathrooms" sub="Full baths" value={data.bathrooms || 1} onDec={() => set('bathrooms', Math.max(1, (data.bathrooms||1) - 1))} onInc={() => set('bathrooms', Math.min(8, (data.bathrooms||1) + 1))} min={1} max={8} />
        <Counter label="Half Baths" sub="Powder rooms" value={data.halfBaths || 0} onDec={() => set('halfBaths', Math.max(0, (data.halfBaths||0) - 1))} onInc={() => set('halfBaths', Math.min(4, (data.halfBaths||0) + 1))} min={0} max={4} />

        {/* Sq ft slider + typed input */}
        <div style={{ background: WHITE, borderRadius: '14px', border: `1.5px solid ${BORDER}`, padding: '1rem 1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontWeight: 600, fontSize: '15px', color: DARK }}>Square Footage</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <input
                type="number"
                min={400} max={5000} step={50}
                value={sqft}
                onChange={e => {
                  const v = Math.min(5000, Math.max(400, Number(e.target.value) || 400));
                  set('sqft', v);
                }}
                style={{
                  width: '80px', padding: '0.3rem 0.5rem',
                  border: `1.5px solid ${BORDER}`, borderRadius: '8px',
                  fontSize: '14px', fontWeight: 700, color: BLUE,
                  fontFamily: 'var(--font-display)', textAlign: 'right',
                  outline: 'none',
                }}
                onFocus={e => { e.target.style.borderColor = BLUE; }}
                onBlur={e => { e.target.style.borderColor = BORDER; }}
              />
              <span style={{ fontSize: '13px', color: GRAY }}>sq ft</span>
            </div>
          </div>
          <input
            type="range" min={400} max={5000} step={50}
            value={sqft}
            onChange={e => set('sqft', Number(e.target.value))}
            style={{ width: '100%', accentColor: BLUE, height: '4px', cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem' }}>
            <span style={{ fontSize: '11px', color: GRAY }}>400 sq ft</span>
            <span style={{ fontSize: '11px', color: GRAY }}>5,000 sq ft</span>
          </div>

          {/* "How do I find my sq ft?" collapsible tip */}
          <div style={{ marginTop: '0.85rem', borderTop: `1px solid ${BORDER}`, paddingTop: '0.75rem' }}>
            <button
              type="button"
              onClick={() => setShowSqftTip(v => !v)}
              style={{
                background: 'none', border: 'none', padding: 0,
                fontSize: '12px', fontWeight: 600, color: BLUE,
                cursor: 'pointer', fontFamily: 'var(--font-body)',
                display: 'flex', alignItems: 'center', gap: '0.3rem',
              }}
            >
              <span style={{ fontSize: '14px' }}>{showSqftTip ? '▾' : '▸'}</span>
              How do I find my square footage?
            </button>
            {showSqftTip && (
              <div style={{
                marginTop: '0.65rem', fontSize: '12.5px', color: GRAY,
                lineHeight: 1.65, display: 'flex', flexDirection: 'column', gap: '0.35rem',
              }}>
                <span>📄 Check your <strong>lease, closing disclosure, or listing</strong> (Zillow, Redfin, Trulia).</span>
                <span>🏛 Search your address on your <strong>county property appraiser</strong> website:<br />
                  &nbsp;&nbsp;• Broward: <strong>bcpa.net</strong> &nbsp;• Palm Beach: <strong>pbcgov.com/papa</strong><br />
                  &nbsp;&nbsp;• Miami-Dade: <strong>miamidade.gov/pa</strong>
                </span>
                <span>📏 Typical sizes to help you estimate:<br />
                  &nbsp;&nbsp;Studio ~500 · 1 bed ~750 · 2 bed ~1,100 · 3 bed ~1,600 · 4 bed ~2,200 sq ft
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Property type */}
        <div style={{ background: WHITE, borderRadius: '14px', border: `1.5px solid ${BORDER}`, padding: '1rem 1.25rem' }}>
          <div style={{ fontWeight: 600, fontSize: '15px', color: DARK, marginBottom: '0.75rem' }}>Property Type</div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['House', 'Apartment', 'Condo', 'Townhouse', 'Office'].map(t => (
              <Pill key={t} active={data.propertyType === t} onClick={() => set('propertyType', t)}>{t}</Pill>
            ))}
          </div>
        </div>

        {/* Pets */}
        <div style={{ background: WHITE, borderRadius: '14px', border: `1.5px solid ${BORDER}`, padding: '1rem 1.25rem' }}>
          <div style={{ fontWeight: 600, fontSize: '15px', color: DARK, marginBottom: '0.25rem' }}>Any pets in the home? 🐾</div>
          <div style={{ fontSize: '12px', color: GRAY, marginBottom: '0.75rem' }}>Helps us bring the right supplies for hair & dander.</div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Pill active={data.pets === true}  onClick={() => set('pets', true)}>Yes</Pill>
            <Pill active={data.pets === false} onClick={() => set('pets', false)}>No</Pill>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Step 3: Schedule ────────────────────────────────────── */
function Step3({ data, set }) {
  const today = new Date().toISOString().split('T')[0];
  return (
    <div>
      <h3 style={{ fontSize: '22px', fontWeight: 800, color: DARK, marginBottom: '0.4rem', fontFamily: 'var(--font-display)' }}>
        How often do you need cleaning?
      </h3>
      <p style={{ fontSize: '15px', color: GRAY, marginBottom: '1.75rem' }}>Recurring plans save you more every visit.</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {FREQUENCIES.map(f => (
          <button
            key={f.id}
            onClick={() => set('frequency', f.id)}
            style={{
              padding: '1rem 1.1rem', textAlign: 'left',
              borderRadius: '14px',
              border: `2px solid ${data.frequency === f.id ? BLUE : BORDER}`,
              background: data.frequency === f.id ? 'rgba(21,120,229,0.06)' : WHITE,
              cursor: 'pointer', transition: 'all 0.18s ease',
              position: 'relative',
            }}
          >
            <div style={{ fontWeight: 700, fontSize: '15px', color: DARK, fontFamily: 'var(--font-display)' }}>{f.label}</div>
          </button>
        ))}
      </div>

      {/* Date picker */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: DARK }}>Preferred Start Date <span style={{ color: BLUE }}>*</span></label>
          <input
            type="date" min={today}
            value={data.startDate || ''}
            onChange={e => set('startDate', e.target.value)}
            style={{
              padding: '0.75rem 1rem', border: `1.5px solid ${BORDER}`,
              borderRadius: '10px', fontSize: '15px', color: DARK,
              background: WHITE, outline: 'none', fontFamily: 'var(--font-body)',
            }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: DARK }}>Preferred Time</label>
          <select
            value={data.preferredTime || ''}
            onChange={e => set('preferredTime', e.target.value)}
            style={{
              padding: '0.75rem 1rem', border: `1.5px solid ${BORDER}`,
              borderRadius: '10px', fontSize: '15px', color: DARK,
              background: WHITE, outline: 'none', fontFamily: 'var(--font-body)', cursor: 'pointer',
            }}
          >
            <option value="">Any time</option>
            <option value="morning">Morning (8am–12pm)</option>
            <option value="afternoon">Afternoon (12pm–5pm)</option>
            <option value="evening">Evening (5pm–8pm)</option>
          </select>
        </div>
      </div>

      <div style={{ marginTop: '1rem', padding: '0.85rem 1.1rem', borderRadius: '12px', background: 'rgba(21,120,229,0.07)', border: `1px solid rgba(21,120,229,0.2)` }}>
        <p style={{ fontSize: '13px', color: BLUE, fontWeight: 500, margin: 0 }}>
          📅 We'll confirm availability and send you a booking confirmation within 24 hours.
        </p>
      </div>
    </div>
  );
}

/* ─── Step 4: Add-ons ─────────────────────────────────────── */
function Step4({ data, set }) {
  const photos   = data.photos || [];
  const [photoError, setPhotoError] = useState('');

  const handlePhotoChange = (e) => {
    setPhotoError('');
    const files = Array.from(e.target.files || []);
    const remaining = 3 - photos.length;
    if (remaining <= 0) { setPhotoError('Max 3 photos allowed.'); e.target.value = ''; return; }
    const toProcess = files.slice(0, remaining);
    if (files.length > remaining) setPhotoError(`Max 3 photos — only the first ${remaining} were added.`);
    Promise.all(toProcess.map(async file => {
      if (file.size > 3 * 1024 * 1024) { setPhotoError('Keep each photo under 3 MB.'); return null; }
      try {
        const base64 = await downscaleImage(file); // resize + compress to keep payload small
        return { name: file.name, base64, preview: base64 };
      } catch {
        setPhotoError('That image could not be processed — try another.');
        return null;
      }
    })).then(results => {
      const valid = results.filter(Boolean);
      if (valid.length) set('photos', [...photos, ...valid]);
    });
    e.target.value = '';
  };

  const removePhoto = (idx) => {
    const updated = [...photos];
    URL.revokeObjectURL(updated[idx]?.preview);
    updated.splice(idx, 1);
    set('photos', updated);
  };

  const toggle = (id) => {
    const current = data.addons || [];
    set('addons', current.includes(id) ? current.filter(a => a !== id) : [...current, id]);
  };
  const selected = data.addons || [];

  return (
    <div>
      <h3 style={{ fontSize: '22px', fontWeight: 800, color: DARK, marginBottom: '0.4rem', fontFamily: 'var(--font-display)' }}>
        Any add-ons?
      </h3>
      <p style={{ fontSize: '15px', color: GRAY, marginBottom: '1.75rem' }}>All optional — customize your clean.</p>
      <div className="qf-step-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
        {ADDONS.map(addon => {
          const on = selected.includes(addon.id);
          return (
            <button
              key={addon.id}
              onClick={() => toggle(addon.id)}
              style={{
                padding: '1rem', textAlign: 'left',
                borderRadius: '14px',
                border: `2px solid ${on ? BLUE : BORDER}`,
                background: on ? 'rgba(21,120,229,0.07)' : WHITE,
                cursor: 'pointer', transition: 'all 0.18s ease',
                display: 'flex', alignItems: 'center', gap: '0.75rem',
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: '10px',
                background: on ? BLUE : 'rgba(21,120,229,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px', flexShrink: 0,
              }}>{addon.icon}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '13px', color: DARK, lineHeight: 1.3 }}>{addon.label}</div>
              </div>
              {on && (
                <div style={{ marginLeft: 'auto', width: 20, height: 20, borderRadius: '50%', background: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: WHITE, fontSize: '11px' }}>✓</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
      {selected.length > 0 && (
        <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', borderRadius: '10px', background: LIGHT_BG, border: `1px solid ${BORDER}` }}>
          <span style={{ fontSize: '13px', color: GRAY }}>
            {selected.length} add-on{selected.length > 1 ? 's' : ''} selected
          </span>
        </div>
      )}

      {/* Photo upload — shown when at least 1 add-on is selected */}
      {selected.length > 0 && (
        <div style={{ marginTop: '1.5rem', padding: '1.25rem', borderRadius: '14px', border: `1.5px dashed ${BORDER}`, background: 'rgba(21,120,229,0.03)' }}>
          <div style={{ fontWeight: 600, fontSize: '14px', color: DARK, marginBottom: '0.35rem' }}>
            📷 Upload photos <span style={{ fontWeight: 400, color: GRAY }}>(optional)</span>
          </div>
          <p style={{ fontSize: '12px', color: GRAY, marginBottom: '1rem', lineHeight: 1.55 }}>
            Photos help our team arrive prepared with the right supplies and know what to expect.
          </p>

          {/* Thumbnail previews */}
          {photos.length > 0 && (
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.85rem' }}>
              {photos.map((p, i) => (
                <div key={i} style={{ position: 'relative', width: 80, height: 80, borderRadius: '10px', overflow: 'hidden', border: `1.5px solid ${BORDER}` }}>
                  <img src={p.preview} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    style={{
                      position: 'absolute', top: 3, right: 3,
                      width: 20, height: 20, borderRadius: '50%',
                      background: 'rgba(11,18,32,0.75)', border: 'none',
                      color: '#fff', fontSize: '12px', lineHeight: 1,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                    aria-label="Remove photo"
                  >✕</button>
                </div>
              ))}
            </div>
          )}

          {photos.length < 3 && (
            <label style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.55rem 1.1rem', borderRadius: '8px',
              background: BLUE, color: WHITE,
              fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              fontFamily: 'var(--font-body)',
            }}>
              + Add Photo{photos.length > 0 ? ' (max 3)' : ''}
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoChange}
                style={{ display: 'none' }}
              />
            </label>
          )}

          {photoError && (
            <p style={{ fontSize: '12px', color: '#DC2626', marginTop: '0.5rem', fontWeight: 500 }}>
              {photoError}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Step 5: Contact info ────────────────────────────────── */
function Step5({ data, set, fieldErrors = {} }) {
  const FieldError = ({ name }) => fieldErrors[name]
    ? <span style={{ fontSize: '12px', color: RED, fontWeight: 600, marginTop: '2px' }}>⚠ {fieldErrors[name]}</span>
    : null;

  return (
    <div>
      <h3 style={{ fontSize: '22px', fontWeight: 800, color: DARK, marginBottom: '0.4rem', fontFamily: 'var(--font-display)' }}>
        How can we reach you?
      </h3>
      <p style={{ fontSize: '15px', color: GRAY, marginBottom: '1.75rem' }}>We'll send your quote and booking confirmation here.</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <Input label="First Name" value={data.firstName || ''} onChange={v => set('firstName', v)} placeholder="Josh" required />
          <FieldError name="firstName" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <Input label="Last Name" value={data.lastName || ''} onChange={v => set('lastName', v)} placeholder="Lopez" />
          <FieldError name="lastName" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <Input label="Email Address" type="email" value={data.email || ''} onChange={v => set('email', v)} placeholder="josh@example.com" required />
          <FieldError name="email" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <Input label="Phone Number" type="tel" value={data.phone || ''} onChange={v => set('phone', v)} placeholder="(347) 954-6309" required />
          <FieldError name="phone" />
        </div>
      </div>
      <div style={{ marginTop: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <Input label="Service Address" value={data.address || ''} onChange={v => set('address', v)} placeholder="123 Palm Drive, Miami, FL 33101" required />
        <FieldError name="address" />
      </div>
      <div style={{ marginTop: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <label style={{ fontSize: '13px', fontWeight: 600, color: DARK, fontFamily: 'var(--font-body)' }}>Special Instructions / Notes</label>
        <textarea
          value={data.notes || ''}
          onChange={e => set('notes', e.target.value)}
          placeholder="Any pets, gate codes, special requests..."
          rows={3}
          maxLength={500}
          style={{
            padding: '0.75rem 1rem', border: `1.5px solid ${BORDER}`,
            borderRadius: '10px', fontSize: '15px', color: DARK, background: WHITE,
            outline: 'none', resize: 'vertical', fontFamily: 'var(--font-body)',
          }}
          onFocus={e => e.target.style.borderColor = BLUE}
          onBlur={e => e.target.style.borderColor = BORDER}
        />
        <span style={{ fontSize: '11px', color: GRAY, textAlign: 'right' }}>{(data.notes || '').length}/500</span>
      </div>
    </div>
  );
}

/* ─── Shared review row (hoisted so it's not recreated each render) ─── */
const ReviewRow = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: `1px solid ${BORDER}` }}>
    <span style={{ fontSize: '14px', color: GRAY }}>{label}</span>
    <span style={{ fontSize: '14px', fontWeight: 600, color: DARK }}>{value}</span>
  </div>
);

/* ─── Step 6: Review ─────────────────────────────────────── */
function Step6({ data, estimate, consentChecked, setConsentChecked }) {
  const svc = SERVICES.find(s => s.id === data.service);
  const freq = FREQUENCIES.find(f => f.id === data.frequency);
  const selectedAddons = (data.addons || []).map(id => ADDONS.find(a => a.id === id)).filter(Boolean);

  return (
    <div>
      <h3 style={{ fontSize: '22px', fontWeight: 800, color: DARK, marginBottom: '0.4rem', fontFamily: 'var(--font-display)' }}>
        Review Your Quote
      </h3>
      <p style={{ fontSize: '15px', color: GRAY, marginBottom: '1.5rem' }}>Everything look right? Hit submit and we&apos;ll confirm within 24 hours.</p>

      <div style={{ background: WHITE, borderRadius: '16px', border: `1.5px solid ${BORDER}`, overflow: 'hidden' }}>
        <div style={{ background: DARK, padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase' }}>Quote Summary</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: WHITE, fontFamily: 'var(--font-display)', marginTop: '0.2rem' }}>JSL Cleaning Services</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Estimated Range</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: BLUE, fontFamily: 'var(--font-display)', marginTop: '0.2rem' }}>
              {estimate.isCustom ? 'Custom' : formatRange(estimate.total)}
            </div>
          </div>
        </div>
        <div style={{ padding: '1rem 1.5rem' }}>
          <ReviewRow label="Service" value={svc?.label || '—'} />
          <ReviewRow label="Property" value={`${data.bedrooms || 1} bed / ${data.bathrooms || 1} bath · ${(data.sqft || 1000).toLocaleString()} sq ft`} />
          <ReviewRow label="Type" value={data.propertyType || 'House'} />
          <ReviewRow label="Pets" value={data.pets ? 'Yes' : 'No'} />
          <ReviewRow label="Frequency" value={freq?.label || '—'} />
          <ReviewRow label="Start Date" value={data.startDate || 'TBD'} />
          <ReviewRow label="Time Preference" value={data.preferredTime === 'morning' ? 'Morning (8am–12pm)' : data.preferredTime === 'afternoon' ? 'Afternoon (12pm–5pm)' : data.preferredTime === 'evening' ? 'Evening (5pm–8pm)' : 'Any time'} />
          {selectedAddons.length > 0 && (
            <ReviewRow label="Add-Ons" value={selectedAddons.map(a => `${a.icon} ${a.label}`).join(', ')} />
          )}
          <ReviewRow label="Contact" value={`${data.firstName || ''} ${data.lastName || ''} · ${data.phone || ''}`} />
          <ReviewRow label="Address" value={data.address || '—'} />
        </div>
        <div style={{ background: LIGHT_BG, padding: '0.85rem 1.5rem', borderTop: `1px solid ${BORDER}` }}>
          <span style={{ fontSize: '12px', color: GRAY, lineHeight: 1.5 }}>
            Estimated range based on your home's size · your JSL rep confirms the final price within 24 hours — no payment now.
          </span>
        </div>
      </div>

      {/* ── Required consent checkbox ─────────────────────────── */}
      <label
        htmlFor="qf-consent"
        style={{
          display: 'flex', alignItems: 'flex-start', gap: '0.65rem',
          marginTop: '1.25rem', cursor: 'pointer',
          padding: '0.85rem 1rem', borderRadius: '12px',
          background: consentChecked ? 'rgba(21,120,229,0.05)' : '#FFF9F9',
          border: `1.5px solid ${consentChecked ? 'rgba(21,120,229,0.25)' : '#FECACA'}`,
          transition: 'all 0.2s ease',
        }}
      >
        <input
          id="qf-consent"
          type="checkbox"
          checked={consentChecked}
          onChange={e => setConsentChecked(e.target.checked)}
          required
          style={{ width: 16, height: 16, marginTop: '2px', accentColor: BLUE, flexShrink: 0, cursor: 'pointer' }}
        />
        <span style={{ fontSize: '13px', color: GRAY, lineHeight: 1.6, fontFamily: 'var(--font-body)' }}>
          I agree that JSL Cleaning Services LLC may contact me about this quote by phone, email, or text.
          No payment is required now. View our{' '}
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('jsl:open-legal', { detail: 'privacy' }))}
            style={{
              background: 'none', border: 'none', padding: 0,
              color: BLUE, fontWeight: 600, fontSize: '13px',
              cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline',
            }}
          >
            Privacy Policy
          </button>.
          {' '}<span style={{ color: RED, fontWeight: 700 }}>*</span>
        </span>
      </label>
    </div>
  );
}

/* ─── Live Estimate Sidebar ───────────────────────────────── */
function EstimateSidebar({ estimate, data, currentStep }) {
  const selected = data.addons || [];
  const selectedAddons = selected.map(id => ADDONS.find(a => a.id === id)).filter(Boolean);
  const svc = SERVICES.find(s => s.id === data.service);
  const freq = FREQUENCIES.find(f => f.id === data.frequency);

  return (
    <div style={{
      background: DARK,
      borderRadius: '20px',
      padding: '1.75rem',
      position: 'sticky',
      top: '6rem',
      color: WHITE,
    }}>
      <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: '1rem' }}>
        Your Quote
      </div>

      {/* Reassurance — no price shown during the form */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '15px', fontWeight: 600, color: WHITE, lineHeight: 1.5, marginBottom: '0.4rem' }}>
          We're building your personalized quote.
        </div>
        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.55 }}>
          A JSL rep will confirm your final price within 24 hours — no payment now.
        </div>
      </div>

      {/* Breakdown lines */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', marginBottom: '1.25rem' }}>
        {svc && (
          <div style={{ fontSize: '13px' }}>
            <span style={{ color: 'rgba(255,255,255,0.55)' }}>{svc.label}</span>
          </div>
        )}
        {data.sqft && !estimate.isCustom && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
            <span style={{ color: 'rgba(255,255,255,0.55)' }}>{(data.sqft).toLocaleString()} sq ft</span>
          </div>
        )}
        {freq && !estimate.isCustom && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
            <span style={{ color: 'rgba(255,255,255,0.55)' }}>{freq.label}</span>
          </div>
        )}
        {selectedAddons.map(a => (
          <div key={a.id} style={{ fontSize: '13px' }}>
            <span style={{ color: 'rgba(255,255,255,0.55)' }}>{a.icon} {a.label}</span>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', marginBottom: '1.25rem' }} />

      {/* Trust badges */}
      {['✅ Free estimate', '🔒 No payment now', '📞 Response within 24hrs'].map(t => (
        <div key={t} style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '0.4rem', fontWeight: 500 }}>{t}</div>
      ))}

      {/* Step progress */}
      <div style={{ marginTop: '1.5rem' }}>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '0.6rem' }}>Progress</div>
        <div style={{ display: 'flex', gap: '4px' }}>
          {STEPS.map(s => (
            <div key={s.num} style={{
              flex: 1, height: '3px', borderRadius: '999px',
              background: s.num <= currentStep ? BLUE : 'rgba(255,255,255,0.12)',
              transition: 'background 0.3s ease',
            }} />
          ))}
        </div>
        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginTop: '0.4rem' }}>Step {currentStep} of {STEPS.length}</div>
      </div>
    </div>
  );
}

/* ─── Success Screen ─────────────────────────────────────── */
function SuccessScreen({ data, estimate }) {
  const svc = SERVICES.find(s => s.id === data.service);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{ textAlign: 'center', padding: '3rem 2rem' }}
    >
      {/* Checkmark */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 400, damping: 20 }}
        style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'linear-gradient(135deg, #1578E5 0%, #3D8FF0 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.5rem',
          boxShadow: '0 8px 30px rgba(21,120,229,0.4)',
        }}
      >
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
          <path d="M10 18L15.5 23.5L26 13" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </motion.div>

      <h2 style={{ fontSize: 'clamp(26px, 3vw, 36px)', fontWeight: 800, color: DARK, letterSpacing: '-1px', marginBottom: '0.75rem', fontFamily: 'var(--font-display)' }}>
        You're All Set! 🎉
      </h2>
      <p style={{ fontSize: '16px', color: GRAY, maxWidth: '460px', margin: '0 auto 2rem', lineHeight: 1.65 }}>
        Thanks, <strong style={{ color: DARK }}>{data.firstName}</strong>! We've received your quote request for <strong style={{ color: DARK }}>{svc?.label}</strong>.
        Our team will confirm your appointment and send a detailed quote to <strong style={{ color: DARK }}>{data.email}</strong> within 24 hours.
      </p>

      {/* Estimated range callout — the only place a price is shown */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(21,120,229,0.08) 0%, rgba(21,120,229,0.03) 100%)',
        border: `1.5px solid rgba(21,120,229,0.25)`,
        borderRadius: '16px', padding: '1.5rem',
        maxWidth: '400px', margin: '0 auto 1.5rem',
      }}>
        <div style={{ fontSize: '12px', fontWeight: 700, color: BLUE, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          Estimated Range
        </div>
        <div style={{ fontSize: '34px', fontWeight: 800, color: DARK, fontFamily: 'var(--font-display)', letterSpacing: '-1px', lineHeight: 1 }}>
          {estimate.isCustom ? 'Custom Quote' : formatRange(estimate.total)}
          {!estimate.isCustom && <span style={{ fontSize: '15px', fontWeight: 500, color: GRAY }}> / clean</span>}
        </div>
        <p style={{ fontSize: '13px', color: GRAY, lineHeight: 1.55, marginTop: '0.75rem' }}>
          💡 This is a ballpark based on your home's size. Your JSL rep will confirm the exact final price within 24 hours.
        </p>
      </div>

      {/* Summary card */}
      <div style={{
        background: LIGHT_BG, borderRadius: '16px', border: `1.5px solid ${BORDER}`,
        padding: '1.5rem', maxWidth: '400px', margin: '0 auto 2rem', textAlign: 'left',
      }}>
        <div style={{ fontSize: '12px', fontWeight: 700, color: GRAY, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Your Quote Summary</div>
        {[
          ['Service', svc?.label],
          ['Date', data.startDate || 'TBD'],
          ['Address', data.address || '—'],
        ].map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: `1px solid ${BORDER}` }}>
            <span style={{ fontSize: '13px', color: GRAY }}>{k}</span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: DARK }}>{v}</span>
          </div>
        ))}
      </div>

      {/* CleanPass upsell */}
      <div style={{
        maxWidth: '400px', margin: '0 auto 2rem',
        borderRadius: '16px', overflow: 'hidden',
        border: '2px solid rgba(217,119,6,0.35)',
        background: 'linear-gradient(135deg, rgba(217,119,6,0.08) 0%, rgba(217,119,6,0.03) 100%)',
      }}>
        <div style={{ padding: '1.1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <span style={{ fontSize: '28px', flexShrink: 0 }}>👑</span>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#D97706', fontFamily: 'var(--font-display)', marginBottom: '2px' }}>
              Did you know? CleanPass™ members save up to 15%
            </div>
            <div style={{ fontSize: '12px', color: GRAY, fontFamily: 'var(--font-body)', lineHeight: 1.5 }}>
              Ask Josh about membership when he reaches out — or join now.
            </div>
          </div>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('jsl:open-membership', { detail: 'gold' }))}
            style={{
              flexShrink: 0, padding: '0.5rem 1rem', borderRadius: '999px',
              background: '#D97706', border: 'none', color: '#fff',
              fontWeight: 700, fontSize: '12px', cursor: 'pointer',
              fontFamily: 'var(--font-body)', whiteSpace: 'nowrap',
            }}
          >
            Learn More
          </button>
        </div>
      </div>

      {/* Contact */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <a href="tel:3479546309" style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.8rem 1.5rem', borderRadius: '999px',
          background: BLUE, color: WHITE,
          fontWeight: 700, fontSize: '14px', textDecoration: 'none',
          boxShadow: '0 4px 16px rgba(21,120,229,0.35)',
        }}>
          📞 (347) 954-6309
        </a>
        <a href="mailto:jlopez@jslcleaningservices.com" style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.8rem 1.5rem', borderRadius: '999px',
          border: `2px solid ${BORDER}`, color: GRAY,
          fontWeight: 600, fontSize: '14px', textDecoration: 'none',
        }}>
          Send an Email
        </a>
      </div>
    </motion.div>
  );
}

/* ─── Main QuoteForm component ───────────────────────────── */
export default function QuoteForm({ openMembership }) {
  const isMobile = useIsMobile();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);   // loading state
  const [submitError, setSubmitError] = useState('');        // network error
  const [fieldErrors, setFieldErrors] = useState({});        // validation errors
  const [rateLimitMsg, setRateLimitMsg] = useState('');      // rate-limit message
  const [consentChecked, setConsentChecked] = useState(false); // privacy consent
  const honeypotRef = useRef(null);                          // bot trap
  const stepBodyRef = useRef(null);
  const stepDirRef = useRef(1); /* 1 = forward, -1 = backward */
  const [data, setData] = useState({
    service: '',
    bedrooms: 2, bathrooms: 1, halfBaths: 0, sqft: 1200,
    propertyType: 'House',
    pets: false,
    frequency: 'onetime',
    startDate: '', preferredTime: '',
    addons: [],
    photos: [],
    firstName: '', lastName: '', email: '', phone: '', address: '', notes: '',
  });

  /**
   * set — sanitizes string values before storing.
   * Non-string values (numbers, arrays) pass through unchanged.
   */
  const set = useCallback((key, val) =>
    setData(prev => ({
      ...prev,
      [key]: typeof val === 'string' ? sanitizeText(val) : val,
    })), []);

  /* GSAP slide transition on step change */
  useEffect(() => {
    const el = stepBodyRef.current;
    if (!el) return;
    const dir = stepDirRef.current;
    gsap.fromTo(el,
      { opacity: 0, x: dir > 0 ? 40 : -40 },
      { opacity: 1, x: 0, duration: 0.28, ease: 'power2.out' }
    );
  }, [step]);

  /* Live estimate calculation — square-footage driven, floored at the
     service minimum. Bedrooms/bathrooms do not affect the ballpark. */
  const estimate = useMemo(() => {
    const svc = SERVICES.find(s => s.id === data.service);
    if (!svc || svc.customQuote) return { total: 0, isCustom: true };

    const sqft       = data.sqft || 1200;
    const freq       = FREQUENCIES.find(f => f.id === data.frequency);
    const freqMult   = freq?.multiplier || 1;
    const addonTotal = (data.addons || []).reduce((s, id) => s + (ADDONS.find(a => a.id === id)?.price || 0), 0);
    const officeMult = data.propertyType === 'Office' ? OFFICE_SURCHARGE : 1;
    const petMult    = data.pets ? PET_SURCHARGE : 1;

    const raw   = Math.max(svc.rate * sqft, svc.base) * officeMult * petMult; // per-sqft, floored at minimum
    const total = Math.round(raw * freqMult) + addonTotal;
    return { total, isCustom: false };
  }, [data]);

  /* Step validation */
  const canAdvance = () => {
    if (step === 1) return !!data.service;
    if (step === 3) return !!data.startDate;
    if (step === 5) return !!data.firstName && !!data.email && !!data.phone && !!data.address;
    if (step === 6) return consentChecked; // must agree to privacy policy before submit
    return true;
  };

  const advance = async () => {
    // ── Honeypot check: bots fill hidden 'website' field; humans don't
    if (honeypotRef.current && honeypotRef.current.value) {
      // Silently pretend to submit — don't alert the bot
      setSubmitted(true);
      return;
    }

    // ── Field-level validation for Step 5
    if (step === 5) {
      const errors = validateStep(5, data);
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        return; // Stop navigation until fixed
      }
      setFieldErrors({});
    }

    if (step < STEPS.length) {
      stepDirRef.current = 1;
      setStep(s => s + 1);
    } else {
      // ── Final submit: rate-limit guard
      const { allowed, secondsUntilReset } = checkRateLimit();
      if (!allowed) {
        const mins = Math.ceil(secondsUntilReset / 60);
        setRateLimitMsg(`Too many submissions. Please wait ${mins} minute${mins !== 1 ? 's' : ''} before trying again.`);
        return;
      }

      // ── POST to Google Sheets
      setIsSubmitting(true);
      setSubmitError('');
      try {
        const payload = {
          firstName:     data.firstName,
          lastName:      data.lastName,
          email:         data.email,
          phone:         data.phone,
          address:       data.address,
          service:       SERVICES.find(s => s.id === data.service)?.label || data.service,
          frequency:     FREQUENCIES.find(f => f.id === data.frequency)?.label || data.frequency,
          bedrooms:      data.bedrooms,
          bathrooms:     data.bathrooms,
          sqft:          data.sqft,
          propertyType:  data.propertyType,
          pets:          data.pets ? 'Yes' : 'No',
          addons:        (data.addons || []).map(id => ADDONS.find(a => a.id === id)?.label || id),
          photos:        (data.photos || []).map(p => ({ name: p.name, base64: p.base64 })),
          startDate:     data.startDate,
          preferredTime: data.preferredTime,
          estimate:      estimate.isCustom ? null : estimate.total,
          notes:         data.notes,
        };

        // no-cors: Apps Script doesn't return CORS headers, so we can't read
        // the response body — but the request still goes through.
        await fetch(GOOGLE_SCRIPT_URL, {
          method:  'POST',
          mode:    'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(payload),
        });

        recordSubmission();
        setRateLimitMsg('');
        setSubmitted(true);
      } catch (err) {
        // Network error fallback — give client Josh's phone so they're not left hanging
        setSubmitError('Could not send your request automatically. Please call us directly at (347) 954-6309 or email jlopez@jslcleaningservices.com — we\'re happy to help!');
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  const back = () => { setFieldErrors({}); stepDirRef.current = -1; setStep(s => s - 1); };

  const renderStep = () => {
    switch (step) {
      case 1: return <Step1 data={data} set={set} />;
      case 2: return <Step2 data={data} set={set} />;
      case 3: return <Step3 data={data} set={set} />;
      case 4: return <Step4 data={data} set={set} />;
      case 5: return <Step5 data={data} set={set} fieldErrors={fieldErrors} />;
      case 6: return <Step6 data={data} estimate={estimate} consentChecked={consentChecked} setConsentChecked={setConsentChecked} />;
      default: return null;
    }
  };

  return (
    <section
      id="quote"
      style={{
        background: LIGHT_BG,
        padding: 'clamp(4rem, 7vw, 7rem) 0',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Mobile responsive overrides for inner step grids */}
      <style>{`
        @media (max-width: 768px) {
          .qf-step-grid { grid-template-columns: 1fr !important; }
          .qf-form-inner { padding: 1.5rem !important; }
          .qf-step-header { padding: 1rem 1.5rem !important; }
        }
      `}</style>

      {/* Dot pattern background */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: `radial-gradient(circle, rgba(21,120,229,0.07) 1px, transparent 1px)`,
        backgroundSize: '28px 28px',
        zIndex: 0,
      }} />

      <div style={{
        maxWidth: '1200px', margin: '0 auto',
        padding: '0 clamp(1.5rem, 4vw, 3rem)',
        position: 'relative', zIndex: 1,
      }}>

        {/* Section header */}
        {!submitted && (
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.35rem 1rem', borderRadius: '999px',
              background: 'rgba(21,120,229,0.1)', border: `1px solid rgba(21,120,229,0.2)`,
              fontSize: '11px', fontWeight: 700, color: BLUE, letterSpacing: '2px', textTransform: 'uppercase',
              marginBottom: '1rem',
            }}>
              Get a Free Quote
            </div>
            <h2 style={{
              fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 800, color: DARK,
              letterSpacing: '-2px', lineHeight: 1.1, marginBottom: '0.75rem',
              fontFamily: 'var(--font-display)',
            }}>
              What Will It Cost?
            </h2>
            <p style={{ fontSize: '17px', color: GRAY, maxWidth: '500px', margin: '0 auto' }}>
              Get an instant estimate in under 2 minutes. No commitment. No card required.
            </p>
          </div>
        )}

        {submitted ? (
          <SuccessScreen data={data} estimate={estimate} />
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 320px',
            gap: '2rem',
            alignItems: 'start',
          }}>

            {/* ── Left: form card ───────────────────────── */}
            <div style={{
              background: WHITE,
              borderRadius: '24px',
              boxShadow: '0 4px 40px rgba(11,18,32,0.08)',
              overflow: 'hidden',
            }}>
              {/* Step header bar */}
              <div className="qf-step-header" style={{
                padding: '1.5rem 2rem',
                borderBottom: `1px solid ${BORDER}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {STEPS.map(s => (
                    <div key={s.num} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <div style={{
                        width: s.num === step ? 32 : 26, height: 26,
                        borderRadius: '999px',
                        background: s.num < step ? BLUE : s.num === step ? BLUE : 'transparent',
                        border: `2px solid ${s.num <= step ? BLUE : BORDER}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '11px', fontWeight: 700,
                        color: s.num <= step ? WHITE : GRAY,
                        transition: 'all 0.25s ease',
                      }}>
                        {s.num < step ? '✓' : s.num}
                      </div>
                      {s.num < STEPS.length && (
                        <div style={{ width: 20, height: 2, borderRadius: '999px', background: s.num < step ? BLUE : BORDER, transition: 'background 0.25s ease' }} />
                      )}
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: '12px', color: GRAY, fontWeight: 600 }}>
                  {STEPS[step - 1].label}
                </div>
              </div>

              {/* Step body — GSAP-animated on step change */}
              <div className="qf-form-inner" style={{ padding: '2rem', minHeight: '380px', overflow: 'hidden' }}>
                {/* ⚠️  Honeypot — hidden from real users, visible to bots.
                    If this field is filled, the submission is silently blocked.
                    MUST be visually hidden but NOT display:none (some bots detect that). */}
                <div
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    left: '-9999px',
                    opacity: 0,
                    pointerEvents: 'none',
                    height: 0,
                    overflow: 'hidden',
                  }}
                >
                  <label htmlFor="qf-website">Website (leave blank)</label>
                  <input
                    ref={honeypotRef}
                    id="qf-website"
                    name="website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    defaultValue=""
                  />
                </div>
                <div ref={stepBodyRef}>
                  {renderStep()}
                </div>
              </div>

              {/* Footer nav */}
              <div style={{
                padding: '1.25rem 2rem',
                borderTop: `1px solid ${BORDER}`,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <button
                  onClick={back}
                  disabled={step === 1}
                  style={{
                    padding: '0.75rem 1.5rem', borderRadius: '999px',
                    border: `2px solid ${step === 1 ? BORDER : DARK}`,
                    background: 'transparent', color: step === 1 ? GRAY : DARK,
                    fontWeight: 700, fontSize: '14px', cursor: step === 1 ? 'default' : 'pointer',
                    transition: 'all 0.18s ease', fontFamily: 'var(--font-body)',
                  }}
                >
                  ← Back
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexDirection: 'column', alignItems: 'flex-end' }}>
                  {rateLimitMsg && (
                    <span style={{ fontSize: '12px', color: RED, fontWeight: 600, maxWidth: '280px', textAlign: 'right' }}>
                      ⚠️ {rateLimitMsg}
                    </span>
                  )}
                  {submitError && (
                    <span style={{ fontSize: '12px', color: RED, fontWeight: 500, maxWidth: '320px', textAlign: 'right', lineHeight: 1.5 }}>
                      ⚠️ {submitError}
                    </span>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {!canAdvance() && step === 1 && (
                      <span style={{ fontSize: '12px', color: GRAY }}>Select a service to continue</span>
                    )}
                    <button
                      onClick={advance}
                      disabled={!canAdvance() || !!rateLimitMsg || isSubmitting}
                      style={{
                        padding: '0.8rem 2rem', borderRadius: '999px',
                        background: (canAdvance() && !rateLimitMsg && !isSubmitting) ? BLUE : 'rgba(21,120,229,0.3)',
                        border: 'none', color: WHITE,
                        fontWeight: 700, fontSize: '14px',
                        cursor: (canAdvance() && !rateLimitMsg && !isSubmitting) ? 'pointer' : 'not-allowed',
                        transition: 'all 0.18s ease', fontFamily: 'var(--font-body)',
                        boxShadow: (canAdvance() && !rateLimitMsg && !isSubmitting) ? '0 4px 16px rgba(21,120,229,0.35)' : 'none',
                        minWidth: '180px',
                      }}
                      onMouseEnter={e => { if (canAdvance() && !isSubmitting) e.currentTarget.style.transform = 'scale(1.03)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                    >
                      {isSubmitting
                        ? '⏳ Sending...'
                        : step === STEPS.length ? '🚀 Submit Quote Request' : 'Continue →'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Trust Badges */}
              <div style={{
                display: 'flex', justifyContent: 'center',
                gap: 'clamp(1rem, 3vw, 2.5rem)',
                padding: '0.75rem 2rem',
                borderTop: `1px solid ${BORDER}`,
                flexWrap: 'wrap',
              }}>
                {[
                  { icon: '🔒', text: 'Encrypted & secure' },
                  { icon: '🛡️', text: 'Never sold or shared' },
                  { icon: '✅', text: 'Free estimate, no commitment' },
                ].map(({ icon, text }) => (
                  <span key={text} style={{
                    fontSize: '11px', color: GRAY, fontWeight: 500,
                    display: 'flex', alignItems: 'center', gap: '0.3rem',
                    fontFamily: 'var(--font-body)',
                  }}>
                    <span>{icon}</span> {text}
                  </span>
                ))}
              </div>
            </div>

            {/* ── Right: sidebar ─────────────────────────── */}
            <EstimateSidebar estimate={estimate} data={data} currentStep={step} />
          </div>
        )}
      </div>
    </section>
  );
}
