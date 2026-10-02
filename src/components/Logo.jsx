import { useId } from 'react'

// UrgeSurf mark: sun over two surf waves in a rounded badge.
// One SVG language for header, auth, onboarding, welcome and favicon.
export function LogoMark({ size = 32 }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const grad = `usg${uid}`
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      role="img"
      aria-label="UrgeSurf logo"
      focusable="false"
    >
      <defs>
        <linearGradient id={grad} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0b3b34" />
          <stop offset="1" stopColor="#0f8f7b" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill={`url(#${grad})`} />
      <circle cx="22.5" cy="9.5" r="2.4" fill="#ffd9a0" />
      <path
        d="M6 19.5c2.8-4.2 5.6-4.2 8.4 0s5.6 4.2 8.4 0"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path
        d="M6 24.5c2.8-4.2 5.6-4.2 8.4 0s5.6 4.2 8.4 0"
        fill="none"
        stroke="#6fd3c0"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function LogoLockup({ markSize = 28, fontSize = 19 }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9 }}>
      <LogoMark size={markSize} />
      <b style={{ fontSize, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--tx)' }}>
        Urge<span style={{ color: 'var(--acc)' }}>Surf</span>
      </b>
    </span>
  )
}
