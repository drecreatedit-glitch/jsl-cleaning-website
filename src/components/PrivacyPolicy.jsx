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

export default function PrivacyPolicy() {
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
        JSL Cleaning Services LLC (&ldquo;JSL,&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo;) respects your privacy.
        This policy explains what personal information we collect, how we use it, and your rights.
        We keep it short, plain, and human.
      </p>

      <Section title="1. What We Collect">
        <P>When you request a quote or contact us, we collect:</P>
        <ul style={{ paddingLeft: '1.25rem', margin: '0 0 0.75rem' }}>
          <Li><strong>Contact info:</strong> first name, last name, email address, phone number</Li>
          <Li><strong>Service location:</strong> home or business address</Li>
          <Li><strong>Service preferences:</strong> type of cleaning, frequency, add-ons, scheduling</Li>
          <Li><strong>Notes:</strong> any special instructions you enter voluntarily</Li>
        </ul>
        <P>We do <strong>not</strong> collect payment information on this website. No credit card numbers are stored here.</P>
      </Section>

      <Section title="2. How We Use Your Information">
        <P>Your information is used <em>only</em> to:</P>
        <ul style={{ paddingLeft: '1.25rem', margin: '0 0 0.75rem' }}>
          <Li>Respond to your quote request and provide a service estimate</Li>
          <Li>Confirm and schedule cleaning appointments</Li>
          <Li>Send service-related communications (booking confirmations, reminders)</Li>
          <Li>Improve the quality of our service</Li>
        </ul>
        <P>We will <strong>never</strong> use your information for unsolicited marketing, and we will never sell it.</P>
      </Section>

      <Section title="3. Who We Share It With">
        <P>We do not sell, rent, or trade your personal information to anyone.</P>
        <P>Your submitted quote information is stored in a private Google Sheets document accessible only to JSL Cleaning Services staff. Google processes this data under their own privacy policy at{' '}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: BLUE }}>policies.google.com/privacy</a>.
        </P>
        <P>We do not currently use any third-party analytics, advertising, or tracking services.</P>
      </Section>

      <Section title="4. Data Retention & Deletion">
        <P>We retain your information for as long as is necessary to provide the service you requested, or as required by applicable law.</P>
        <P>
          <strong>To request deletion of your data:</strong> Email{' '}
          <a href="mailto:jlopez@jslcleaningservices.com" style={{ color: BLUE, fontWeight: 600 }}>
            jlopez@jslcleaningservices.com
          </a>{' '}
          with the subject line &ldquo;Data Deletion Request.&rdquo; We will delete your record within 30 days and confirm by email.
        </P>
      </Section>

      <Section title="5. Cookies">
        <P>This website uses only a single essential cookie: a small flag that remembers whether you&rsquo;ve dismissed our cookie notice. We do not use tracking cookies, advertising cookies, or analytics cookies.</P>
        <P>You can clear cookies at any time in your browser settings. This will not affect your ability to use the site.</P>
      </Section>

      <Section title="6. Security">
        <P>Your data is transmitted over HTTPS (SSL/TLS encryption). Our website is protected with industry-standard HTTP security headers including Content Security Policy, HSTS, and clickjacking protection. We take reasonable technical precautions to protect your information.</P>
        <P>No method of transmission or storage is 100% secure. If you believe your information has been compromised, contact us immediately at{' '}
          <a href="mailto:jlopez@jslcleaningservices.com" style={{ color: BLUE }}>jlopez@jslcleaningservices.com</a>.
        </P>
      </Section>

      <Section title="7. Florida Information Protection Act (FIPA)">
        <P>JSL Cleaning Services LLC complies with the Florida Information Protection Act (Fla. Stat. § 501.171). If a data breach occurs that is reasonably believed to have affected your personal information, we will notify you within 30 days as required by Florida law.</P>
      </Section>

      <Section title="8. Children's Privacy">
        <P>This website is not directed to children under 13. We do not knowingly collect personal information from children. If you believe a child has submitted information through our site, please contact us to have it removed.</P>
      </Section>

      <Section title="9. Changes to This Policy">
        <P>We may update this policy from time to time. The &ldquo;Last updated&rdquo; date at the top of this page reflects the most recent revision. Continued use of our site after changes constitutes acceptance of the revised policy.</P>
      </Section>

      <Section title="10. Contact Us">
        <P>Questions or concerns about your privacy? Contact:</P>
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
