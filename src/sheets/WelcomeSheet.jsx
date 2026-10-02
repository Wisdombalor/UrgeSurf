import { useMemo } from 'react'
import Sheet from '../components/Sheet'
import { LogoMark } from '../components/Logo'
import { WELCOME_QUOTES } from '../lib/constants'

export default function WelcomeSheet({ name, onViewRecovery, onLogUrge, onClose }) {
  const quote = useMemo(() => WELCOME_QUOTES[Math.floor(Math.random() * WELCOME_QUOTES.length)], [])
  return (
    <Sheet>
      <div className="pop-card" role="status" aria-live="polite">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }} aria-hidden="true">
          <LogoMark size={64} />
        </div>
        <p className="s" style={{ textAlign: 'center' }}>
          Welcome{name ? `, ${name}` : ''} — you&apos;re in.
        </p>
        <h1 style={{ textAlign: 'center', marginTop: 8 }}>{quote[0]}</h1>
        <p className="s" style={{ marginTop: 8, textAlign: 'center' }}>
          {quote[1]}
        </p>
        <button className="cta" onClick={onViewRecovery}>
          See my recovery timer
        </button>
        <button className="ghost" onClick={onLogUrge}>
          Log an urge first
        </button>
        <button className="ghost" style={{ paddingTop: 0 }} onClick={onClose}>
          Explore on my own
        </button>
      </div>
    </Sheet>
  )
}
