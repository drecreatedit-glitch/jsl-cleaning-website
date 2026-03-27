import { Component } from 'react';

/**
 * ErrorBoundary — catches uncaught render errors in child components.
 * Shows a JSL-branded fallback instead of a raw stack trace.
 * Stack traces expose tech stack info — never show them in production.
 *
 * Usage: wrap <App /> or individual sections in <ErrorBoundary>
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorId: null };
  }

  static getDerivedStateFromError() {
    // Generate a short reference code so Josh can cross-reference logs
    const errorId = Math.random().toString(36).slice(2, 8).toUpperCase();
    return { hasError: true, errorId };
  }

  componentDidCatch(error, info) {
    // Log full details server-side / to monitoring only — never to the UI
    console.error('[JSL ErrorBoundary] Render error:', error, info);
    // Future: send to Sentry / Datadog here
    // logErrorToService(error, info, this.state.errorId);
  }

  handleReset = () => {
    this.setState({ hasError: false, errorId: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const BLUE = '#1578E5';
    const DARK = '#0B1220';
    const GRAY = '#5A6A82';

    return (
      <div
        role="alert"
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#F4F9FF',
          fontFamily: "'DM Sans', sans-serif",
          padding: '2rem',
        }}
      >
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #D8E6F8',
          borderRadius: '24px',
          padding: 'clamp(2rem, 5vw, 3.5rem)',
          maxWidth: '520px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 8px 40px rgba(21,120,229,0.08)',
        }}>
          {/* Logo mark */}
          <div style={{
            width: 56, height: 56,
            borderRadius: '16px',
            background: 'rgba(21,120,229,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            fontSize: '24px',
          }}>
            🧹
          </div>

          <h1 style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: 'clamp(22px, 3vw, 28px)',
            color: DARK,
            letterSpacing: '-1px',
            marginBottom: '0.75rem',
          }}>
            Something went wrong
          </h1>

          <p style={{ fontSize: '15px', color: GRAY, lineHeight: 1.6, marginBottom: '0.5rem' }}>
            We&rsquo;re sorry — an unexpected error occurred on this page.
            Our team has been notified.
          </p>

          <p style={{ fontSize: '13px', color: GRAY, marginBottom: '2rem' }}>
            Reference: <code style={{ background: '#F4F9FF', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>{this.state.errorId}</code>
          </p>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={this.handleReset}
              style={{
                padding: '0.75rem 1.75rem',
                borderRadius: '999px',
                background: BLUE,
                border: 'none',
                color: '#fff',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Try Again
            </button>
            <a
              href="/"
              style={{
                padding: '0.75rem 1.75rem',
                borderRadius: '999px',
                border: '2px solid #D8E6F8',
                color: GRAY,
                fontWeight: 700,
                fontSize: '14px',
                textDecoration: 'none',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Go Home
            </a>
          </div>

          {/* Direct contact fallback */}
          <p style={{ fontSize: '13px', color: GRAY, marginTop: '2rem' }}>
            Need help right now?{' '}
            <a href="tel:3479546309" style={{ color: BLUE, fontWeight: 600, textDecoration: 'none' }}>
              (347) 954-6309
            </a>
          </p>
        </div>
      </div>
    );
  }
}
