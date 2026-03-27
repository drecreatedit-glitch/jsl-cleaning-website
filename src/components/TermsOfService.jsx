const DARK = '#0B1220';
const BLUE = '#1578E5';
const GRAY = '#5A6A82';

const Section = ({ title, children }) => (
  <section style={{ marginBottom: '2rem' }}>
    <h3 style={{
      fontFamily: "'Syne', sans-serif",
      fontWeight: 800, fontSize: '16px',
      color: DARK, marginBottom: '0.6rem',
      paddingBottom: '0.4rem',
      borderBottom: '2px solid #EBF3FF',
    }}>
      {title}
    </h3>
    <div style={{ fontSize: '14px', color: GRAY, lineHeight: 1.75, fontFamily: "'DM Sans', sans-serif" }}>
      {children}
    </div>
  </section>
);

const P = ({ children }) => <p style={{ margin: '0 0 0.75rem' }}>{children}</p>;
const Li = ({ children }) => (
  <li style={{ marginBottom: '0.4rem', paddingLeft: '0.25rem' }}>{children}</li>
);

export default function TermsOfService() {
  return (
    <div>
      {/* Intro */}
      <p style={{
        fontSize: '15px', color: DARK, lineHeight: 1.7,
        fontFamily: "'DM Sans', sans-serif",
        background: '#F4F9FF', borderRadius: '12px',
        padding: '1rem 1.25rem', marginBottom: '2rem',
        border: '1px solid #D8E6F8',
      }}>
        These Terms of Service govern your use of JSL Cleaning Services LLC (&ldquo;JSL&rdquo;) services.
        By booking a service, you agree to these terms. We&rsquo;ve written them in plain English —
        no legalese.
      </p>

      <Section title="1. Our Services">
        <P>JSL Cleaning Services LLC provides residential and commercial cleaning services in South Florida and the Tampa Bay Area, including:</P>
        <ul style={{ paddingLeft: '1.25rem', margin: '0 0 0.75rem' }}>
          <Li>Basic Cleaning</Li>
          <Li>Deep Cleaning</Li>
          <Li>Move-In / Move-Out Cleaning</Li>
          <Li>Airbnb Turnover Cleaning</Li>
          <Li>Office &amp; Commercial Cleaning</Li>
          <Li>Recurring Cleaning Plans (weekly, bi-weekly, monthly)</Li>
        </ul>
        <P>Services are performed by trained JSL staff. We bring all supplies and equipment unless otherwise agreed in writing.</P>
      </Section>

      <Section title="2. Quotes & Pricing">
        <P>Quotes provided on this website are <em>estimates</em> based on the information you provide. Final pricing may vary based on actual home size, current condition, and selected add-ons confirmed at time of appointment. You will be notified of any significant price difference before work begins.</P>
        <P>Prices are quoted in USD. We reserve the right to adjust pricing with 7 days&rsquo; written notice for recurring plans.</P>
      </Section>

      <Section title="3. Booking & Confirmation">
        <P>A quote request is not a confirmed booking. Your appointment is confirmed only after you receive written confirmation from JSL (by phone, text, or email).</P>
        <P>Please ensure that an adult (18+) is present or reachable by phone at the time of service, or that access to the property has been arranged in advance.</P>
      </Section>

      <Section title="4. Cancellation Policy">
        <P><strong>24-hour notice required.</strong> If you need to cancel or reschedule, please notify us at least 24 hours before your scheduled appointment time.</P>
        <ul style={{ paddingLeft: '1.25rem', margin: '0 0 0.75rem' }}>
          <Li><strong>More than 24 hours notice:</strong> No cancellation fee</Li>
          <Li><strong>Less than 24 hours notice:</strong> A $50 late cancellation fee may apply</Li>
          <Li><strong>No-show / locked out:</strong> Full service fee may be charged</Li>
        </ul>
        <P>To cancel or reschedule: call <a href="tel:3479546309" style={{ color: BLUE, fontWeight: 600 }}>(347) 954-6309</a> or email <a href="mailto:jlopez@jslcleaningservices.com" style={{ color: BLUE }}>jlopez@jslcleaningservices.com</a>.</P>
      </Section>

      <Section title="5. Damage Policy">
        <P>JSL Cleaning Services carries liability insurance. If you believe damage occurred during a service, you must report it <strong>within 24 hours</strong> of the appointment by contacting us directly.</P>
        <P>We cannot accept claims reported after 24 hours, as damage may have occurred from other causes. We will investigate all timely claims in good faith and respond within 3 business days.</P>
        <P>We are not responsible for pre-existing damage, items of exceptional value not disclosed before service, or damage resulting from fragile items not secured prior to our arrival.</P>
      </Section>

      <Section title="6. Payment">
        <P>Payment is due upon completion of service unless a recurring plan with alternative terms has been established in writing.</P>
        <P>Accepted payment methods: cash, Zelle, Venmo, and major credit cards (where available). We do not store payment information on this website.</P>
        <P>Invoices unpaid after 14 days may incur a late fee of 1.5% per month on the outstanding balance.</P>
      </Section>

      <Section title="7. Client Responsibilities">
        <P>To help us do our best work, please:</P>
        <ul style={{ paddingLeft: '1.25rem', margin: '0 0 0.75rem' }}>
          <Li>Secure pets in a separate room during the appointment</Li>
          <Li>Remove clutter from surfaces you&rsquo;d like cleaned</Li>
          <Li>Disclose any known hazards (mold, pests, biohazards) before our team enters</Li>
          <Li>Notify us of any alarm codes or access instructions in advance</Li>
        </ul>
      </Section>

      <Section title="8. Limitation of Liability">
        <P>To the maximum extent permitted by Florida law, JSL Cleaning Services LLC&rsquo;s total liability for any claim arising from our services is limited to the amount paid for the specific service in question.</P>
        <P>We are not liable for indirect, incidental, punitive, or consequential damages of any kind.</P>
      </Section>

      <Section title="9. Governing Law">
        <P>These terms are governed by the laws of the State of Florida. Any disputes shall be resolved in the courts of Miami-Dade County, Florida, or through binding arbitration if mutually agreed.</P>
      </Section>

      <Section title="10. Changes to These Terms">
        <P>We may update these Terms at any time. The &ldquo;Last updated&rdquo; date reflects the most recent revision. Continued use of our services constitutes acceptance of any changes.</P>
      </Section>

      <Section title="11. Contact">
        <div style={{
          background: '#F4F9FF', borderRadius: '12px', padding: '1rem 1.25rem',
          border: '1px solid #D8E6F8',
        }}>
          <strong style={{ color: DARK }}>JSL Cleaning Services LLC</strong><br />
          South Florida &amp; Tampa Bay Area<br />
          📞 <a href="tel:3479546309" style={{ color: BLUE, textDecoration: 'none' }}>(347) 954-6309</a><br />
          ✉️ <a href="mailto:jlopez@jslcleaningservices.com" style={{ color: BLUE, textDecoration: 'none' }}>jlopez@jslcleaningservices.com</a>
        </div>
      </Section>
    </div>
  );
}
