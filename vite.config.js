import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// ─── Security Headers ────────────────────────────────────────
// Applied in dev via Vite server.headers.
// For production, copy these to your host config:
//   Netlify  → netlify.toml  [[headers]] section
//   Vercel   → vercel.json   "headers" array
//   Nginx    → add_header directives
// ─────────────────────────────────────────────────────────────
const SECURITY_HEADERS = {
  // Prevents the page from being embedded in iframes (clickjacking)
  'X-Frame-Options': 'DENY',

  // Blocks MIME-type sniffing attacks
  'X-Content-Type-Options': 'nosniff',

  // Controls how much referrer info is sent on navigation
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // Restricts browser feature access — cleaning sites don't need camera/mic/geo
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',

  // Content Security Policy — whitelist only what the site actually uses
  // Fonts: fonts.googleapis.com + fonts.gstatic.com
  // Images: unsplash.com (hero/service images) + self
  // Scripts: self only (no CDN scripts)
  // Styles: self + fonts.googleapis.com (for @import in CSS)
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",         // unsafe-inline needed for Vite HMR in dev; tighten in prod with nonce
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: https://images.unsplash.com https://plus.unsplash.com",
    "connect-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com",
    "frame-ancestors 'none'",                    // Belt-and-suspenders with X-Frame-Options
    "base-uri 'self'",                           // Prevents base tag hijacking
    "form-action 'self'",                        // Form submissions stay on-domain
    "object-src 'none'",                         // No Flash / plugins
  ].join('; '),

  // Force HTTPS in prod (informational in dev — hosts enforce this)
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
};

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  // Apply headers in Vite dev server
  server: {
    headers: SECURITY_HEADERS,
  },

  // Preview server (npm run preview) also gets headers
  preview: {
    headers: SECURITY_HEADERS,
  },

  build: {
    // Emit a _headers file for Netlify — copy to public/ if using Netlify
    // (handled by the public/_headers file below — see audit report)
    rollupOptions: {
      output: {
        // Fingerprint all assets for safe long-term caching
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
  },
})


