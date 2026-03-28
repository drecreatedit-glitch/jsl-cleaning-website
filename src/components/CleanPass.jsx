import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ─── Brand tokens ─────────────────────────────────────────── */
const DARK     = '#0B1220';
const BLUE     = '#1578E5';
const LIGHT_BG = '#F4F9FF';
const GRAY     = '#5A6A82';
const WHITE    = '#FFFFFF';
const BORDER   = '#D8E6F8';

/* ─── Tier config ──────────────────────────────────────────── */
export const TIERS = [
  {
    id:         'silver',
    name:       'Silver',
    plan:       'The Essentials Plan',
    icon:       '🥈',
    accent:     '#64748B',
    accentBg:   'rgba(100,116,139,0.08)',
    commitment: 'Month-to-month · Cancel anytime',
    discount:   '5%',
    price:      'No enrollment fee',
    elevated:   false,
    tagline:    'The smart starter — consistency without the commitment.',
    benefits: [
      '5% discount on all cleans',
      'Priority scheduling (72-hour window)',
      'Same cleaning team every visit',
      'Monthly "Your Home This Month" recap email',
      'Silver member badge',
    ],
    comparison: {
      discount:       '5%',
      freeAddons:     '—',
      scheduling:     '72-hr priority',
      sameTeam:       true,
      birthdayBonus:  false,
      directJosh:     false,
      deepClean:      false,
      rateLock:       false,
      referralCredit: false,
      report:         false,
    },
  },
  {
    id:         'gold',
    name:       'Gold',
    plan:       'The Preferred Plan',
    icon:       '👑',
    accent:     '#D97706',
    accentBg:   'rgba(217,119,6,0.08)',
    commitment: '3-month minimum, then month-to-month',
    discount:   '10%',
    price:      'Most popular',
    elevated:   true,
    tagline:    'The full JSL experience — the way our best clients live.',
    benefits: [
      '10% discount on all cleans & add-ons',
      '1 free add-on per month (windows / blinds / laundry)',
      'Same-day rescheduling (no 24h notice needed)',
      'Priority text line directly to Josh',
      'First access to new JSL services',
      'Birthday month 20% bonus discount',
      'Gold member badge',
    ],
    comparison: {
      discount:       '10%',
      freeAddons:     '1/month',
      scheduling:     'Same-day',
      sameTeam:       true,
      birthdayBonus:  true,
      directJosh:     true,
      deepClean:      false,
      rateLock:       false,
      referralCredit: false,
      report:         false,
    },
  },
  {
    id:         'platinum',
    name:       'Platinum',
    plan:       'The Premium Annual Plan',
    icon:       '💎',
    accent:     '#7C3AED',
    accentBg:   'rgba(124,58,237,0.08)',
    commitment: 'Annual commitment · Pay monthly or yearly',
    discount:   '15%',
    price:      'Annual saves 1 month free',
    elevated:   false,
    tagline:    "JSL's inner circle. Your home treated like our own — every single time.",
    benefits: [
      '15% discount on all cleans & add-ons',
      '2 free add-ons per month',
      '1 complimentary Deep Clean per quarter (value: $220)',
      'Rate locked for 12 months — no price increases',
      'Dedicated 2-person team, guaranteed every visit',
      '$25 referral credit per new JSL client',
      'Annual Home Cleaning Report',
      'Platinum VIP badge',
    ],
    comparison: {
      discount:       '15%',
      freeAddons:     '2/month',
      scheduling:     'Same-day + dedicated',
      sameTeam:       true,
      birthdayBonus:  true,
      directJosh:     true,
      deepClean:      '1/quarter ($220 value)',
      rateLock:       true,
      referralCredit: '$25/referral',
      report:         true,
    },
  },
];

const COMPARISON_ROWS = [
  { key: 'discount',       label: 'Discount on all cleans' },
  { key: 'freeAddons',     label: 'Free add-ons per month' },
  { key: 'scheduling',     label: 'Scheduling priority' },
  { key: 'sameTeam',       label: 'Same team every visit' },
  { key: 'birthdayBonus',  label: 'Birthday month bonus (20% off)' },
  { key: 'directJosh',     label: 'Direct text line to Josh' },
  { key: 'deepClean',      label: 'Complimentary Deep Clean' },
  { key: 'rateLock',       label: '12-month rate lock' },
  { key: 'referralCredit', label: 'Referral credit ($25)' },
  { key: 'report',         label: 'Annual Home Cleaning Report' },
];

const MARQUEE_ITEMS = [
  'Priority Scheduling',
  'Consistent Team',
  'Member Discounts',
  'Cancel Anytime',
  'Direct Josh Access',
  'Rate Lock Guarantee',
  'Free Monthly Add-On',
  'Complimentary Deep Cleans',
  'Birthday Bonus Discount',
  'Referral Credits',
];

/* ─── Tier card ────────────────────────────────────────────── */
function TierCard({ tier, onJoin, delay = 0 }) {
  const cardRef = useRef(null);
  const isGold  = tier.elevated;

  useEffect(() => {
    if (!cardRef.current) return;
    gsap.fromTo(cardRef.current,
      { opacity: 0, y: 48, scale: 0.96 },
      {
        opacity: 1, y: 0, scale: 1,
        duration: 0.65, ease: 'power3.out', delay,
        scrollTrigger: { trigger: cardRef.current, start: 'top 85%', once: true },
      }
    );
  }, [delay]);

  return (
    <div
      ref={cardRef}
      style={{
        position: 'relative',
        background: isGold ? DARK : WHITE,
        border: `2px solid ${isGold ? tier.accent : BORDER}`,
        borderRadius: '24px',
        padding: isGold ? '2.25rem 2rem' : '2rem',
        marginTop: isGold ? '-20px' : '0',
        marginBottom: isGold ? '0' : '0',
        zIndex: isGold ? 2 : 1,
        boxShadow: isGold
          ? `0 24px 64px rgba(217,119,6,0.25), 0 0 0 1px ${tier.accent}40`
          : '0 4px 24px rgba(11,18,32,0.06)',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
        cursor: 'default',
        flex: '1',
        minWidth: '260px',
        maxWidth: '360px',
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = isGold ? `0 32px 80px rgba(217,119,6,0.35), 0 0 0 1px ${tier.accent}60` : '0 12px 40px rgba(11,18,32,0.12)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = isGold ? `0 24px 64px rgba(217,119,6,0.25), 0 0 0 1px ${tier.accent}40` : '0 4px 24px rgba(11,18,32,0.06)'; }}
    >
      {/* Most Popular badge */}
      {isGold && (
        <div style={{
          position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)',
          background: tier.accent, color: WHITE, fontFamily: "'DM Sans', sans-serif",
          fontWeight: 800, fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase',
          padding: '4px 16px', borderRadius: '999px', whiteSpace: 'nowrap',
          boxShadow: `0 4px 12px ${tier.accent}60`,
        }}>
          ⭐ Most Popular
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '28px', marginBottom: '0.5rem' }}>{tier.icon}</div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
          background: tier.accentBg, borderRadius: '999px',
          padding: '4px 12px', marginBottom: '0.5rem',
        }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: tier.accent, letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: "'DM Sans', sans-serif" }}>
            {tier.name}
          </span>
        </div>
        <div style={{ fontSize: '14px', fontWeight: 600, color: isGold ? 'rgba(255,255,255,0.55)' : GRAY, fontFamily: "'DM Sans', sans-serif", marginBottom: '0.75rem' }}>
          {tier.plan}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginBottom: '0.25rem' }}>
          <span style={{
            fontFamily: "'Syne', sans-serif", fontWeight: 900,
            fontSize: '52px', color: tier.accent, lineHeight: 1,
          }}>
            {tier.discount}
          </span>
          <span style={{ fontSize: '16px', fontWeight: 600, color: isGold ? 'rgba(255,255,255,0.5)' : GRAY, fontFamily: "'DM Sans', sans-serif" }}>
            off every clean
          </span>
        </div>
        <div style={{ fontSize: '12px', color: isGold ? 'rgba(255,255,255,0.35)' : GRAY, fontFamily: "'DM Sans', sans-serif" }}>
          {tier.commitment}
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: isGold ? 'rgba(255,255,255,0.1)' : BORDER, marginBottom: '1.25rem' }} />

      {/* Benefits */}
      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem', flex: 1 }}>
        {tier.benefits.map(b => (
          <li key={b} style={{
            display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
            marginBottom: '0.5rem', fontSize: '13.5px', lineHeight: 1.5,
            color: isGold ? 'rgba(255,255,255,0.8)' : DARK,
            fontFamily: "'DM Sans', sans-serif",
          }}>
            <span style={{ color: tier.accent, flexShrink: 0, marginTop: '1px', fontSize: '14px' }}>✓</span>
            {b}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <button
        onClick={() => onJoin(tier)}
        style={{
          width: '100%', padding: '0.9rem', borderRadius: '999px',
          background: isGold ? tier.accent : 'transparent',
          border: `2px solid ${isGold ? tier.accent : tier.accent}`,
          color: isGold ? WHITE : tier.accent,
          fontWeight: 800, fontSize: '15px', cursor: 'pointer',
          fontFamily: "'DM Sans', sans-serif",
          transition: 'all 0.2s ease',
          letterSpacing: '-0.2px',
        }}
        onMouseEnter={e => {
          if (!isGold) { e.currentTarget.style.background = tier.accent; e.currentTarget.style.color = WHITE; }
          e.currentTarget.style.transform = 'scale(1.02)';
        }}
        onMouseLeave={e => {
          if (!isGold) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = tier.accent; }
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        Join {tier.name} CleanPass →
      </button>

      {/* Tagline */}
      <p style={{ fontSize: '12px', color: isGold ? 'rgba(255,255,255,0.35)' : GRAY, textAlign: 'center', margin: '0.75rem 0 0', fontFamily: "'DM Sans', sans-serif", fontStyle: 'italic' }}>
        {tier.tagline}
      </p>
    </div>
  );
}

/* ─── Comparison table ─────────────────────────────────────── */
function ComparisonTable({ onJoin }) {
  const tableRef = useRef(null);
  useEffect(() => {
    if (!tableRef.current) return;
    gsap.fromTo(tableRef.current,
      { opacity: 0, y: 32 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out',
        scrollTrigger: { trigger: tableRef.current, start: 'top 85%', once: true } }
    );
  }, []);

  const renderCell = (val, accent) => {
    if (val === true)  return <span style={{ color: accent || BLUE, fontSize: '16px' }}>✓</span>;
    if (val === false || val === '—') return <span style={{ color: '#CBD5E1', fontSize: '16px' }}>—</span>;
    return <span style={{ fontSize: '13px', fontWeight: 600, color: DARK, fontFamily: "'DM Sans', sans-serif" }}>{val}</span>;
  };

  return (
    <div ref={tableRef} style={{ overflowX: 'auto', marginTop: '3rem' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '560px' }}>
        <thead>
          <tr style={{ background: DARK }}>
            <th style={{ padding: '1rem 1.25rem', textAlign: 'left', fontSize: '12px', color: 'rgba(255,255,255,0.45)', fontFamily: "'DM Sans', sans-serif", fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', borderRadius: '12px 0 0 0' }}>
              Benefit
            </th>
            {TIERS.map(t => (
              <th key={t.id} style={{
                padding: '1rem', textAlign: 'center', fontFamily: "'Syne', sans-serif",
                fontWeight: 800, fontSize: '14px', color: t.accent,
                borderLeft: '1px solid rgba(255,255,255,0.07)',
                ...(t.id === 'platinum' ? { borderRadius: '0 12px 0 0' } : {}),
              }}>
                {t.icon} {t.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {COMPARISON_ROWS.map((row, i) => (
            <tr
              key={row.key}
              style={{ background: i % 2 === 0 ? WHITE : LIGHT_BG }}
            >
              <td style={{ padding: '0.85rem 1.25rem', fontSize: '13.5px', color: DARK, fontFamily: "'DM Sans', sans-serif", fontWeight: 500, borderBottom: `1px solid ${BORDER}` }}>
                {row.label}
              </td>
              {TIERS.map(t => (
                <td key={t.id} style={{ padding: '0.85rem 1rem', textAlign: 'center', borderLeft: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
                  {renderCell(t.comparison[row.key], t.accent)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr style={{ background: LIGHT_BG }}>
            <td style={{ padding: '1rem 1.25rem' }} />
            {TIERS.map(t => (
              <td key={t.id} style={{ padding: '1rem', textAlign: 'center', borderLeft: `1px solid ${BORDER}` }}>
                <button
                  onClick={() => onJoin(t)}
                  style={{
                    padding: '0.6rem 1.25rem', borderRadius: '999px', fontSize: '12px',
                    fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
                    background: t.elevated ? t.accent : 'transparent',
                    border: `2px solid ${t.accent}`,
                    color: t.elevated ? WHITE : t.accent,
                    cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = t.accent; e.currentTarget.style.color = WHITE; e.currentTarget.style.transform = 'scale(1.03)'; }}
                  onMouseLeave={e => { if (!t.elevated) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = t.accent; } e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  Join {t.name} →
                </button>
              </td>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

/* ─── Marquee strip ────────────────────────────────────────── */
function MemberMarquee() {
  return (
    <div style={{ overflow: 'hidden', padding: '1.5rem 0', borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`, marginBottom: '3rem', background: WHITE }}>
      <div style={{
        display: 'flex', gap: '3rem',
        animation: 'cleanpass-marquee 22s linear infinite',
        width: 'max-content',
      }}>
        <style>{`
          @keyframes cleanpass-marquee {
            from { transform: translateX(0); }
            to   { transform: translateX(-50%); }
          }
        `}</style>
        {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
          <span key={i} style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
            fontSize: '13px', color: GRAY, whiteSpace: 'nowrap',
          }}>
            <span style={{ color: BLUE, fontSize: '8px' }}>●</span>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Main CleanPass Section ──────────────────────────────── */
export default function CleanPass({ onOpenMembership }) {
  const headerRef = useRef(null);

  useEffect(() => {
    if (!headerRef.current) return;
    gsap.fromTo(headerRef.current,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: headerRef.current, start: 'top 80%', once: true } }
    );
  }, []);

  const handleJoin = (tier) => onOpenMembership?.(tier.id);

  return (
    <section
      id="membership"
      style={{ background: LIGHT_BG, padding: 'clamp(4rem, 7vw, 7rem) 0', overflow: 'hidden' }}
    >
      <div style={{ maxWidth: '1160px', margin: '0 auto', padding: '0 clamp(1.25rem, 4vw, 3rem)' }}>

        {/* ── Header ──────────────────────────────────────── */}
        <div ref={headerRef} style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(21,120,229,0.08)', borderRadius: '999px',
            padding: '6px 16px', marginBottom: '1.25rem',
          }}>
            <span style={{ fontSize: '14px' }}>👑</span>
            <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: BLUE, fontFamily: "'DM Sans', sans-serif" }}>
              JSL CleanPass™ Membership
            </span>
          </div>
          <h2 style={{
            fontFamily: "'Syne', sans-serif", fontWeight: 800,
            fontSize: 'clamp(32px, 4.5vw, 54px)', color: DARK,
            letterSpacing: '-2px', lineHeight: 1.1, marginBottom: '1rem',
          }}>
            Become a CleanPass™ Member
          </h2>
          <p style={{ fontSize: 'clamp(16px, 1.8vw, 19px)', color: GRAY, fontFamily: "'DM Sans', sans-serif", maxWidth: '600px', margin: '0 auto 0.75rem' }}>
            Join the JSL loyalty program — and never think about cleaning again.
          </p>
          <p style={{ fontSize: '14px', color: GRAY, fontFamily: "'DM Sans', sans-serif", opacity: 0.75 }}>
            No enrollment fee · No contracts on Silver · Cancel anytime
          </p>
        </div>

        {/* ── Marquee strip ───────────────────────────────── */}
        <MemberMarquee />

        {/* ── Tier cards ──────────────────────────────────── */}
        <div style={{
          display: 'flex',
          gap: 'clamp(1rem, 2vw, 1.75rem)',
          justifyContent: 'center',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
        }}>
          {TIERS.map((tier, i) => (
            <TierCard key={tier.id} tier={tier} onJoin={handleJoin} delay={i * 0.12} />
          ))}
        </div>

        {/* ── Comparison table ────────────────────────────── */}
        <ComparisonTable onJoin={handleJoin} />

        {/* ── Bottom note ─────────────────────────────────── */}
        <p style={{ textAlign: 'center', fontSize: '13px', color: GRAY, fontFamily: "'DM Sans', sans-serif", marginTop: '2rem', opacity: 0.7 }}>
          All memberships start with a free consultation. No payment required to enroll — Josh will reach out within 24 hours.
        </p>
      </div>
    </section>
  );
}
