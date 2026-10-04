import { LogoLockup } from '../components/Logo'
import Icon from '../components/Icon'

const FEATURES = [
  ['buoy', 'Ride out urges', 'In-the-moment tools when a craving hits.'],
  ['chart', 'Track your streak', 'Watch sober days and money saved grow.'],
  ['users', 'Anonymous community', 'Real stories from people who get it.'],
  ['shield', 'Protect yourself', 'Blockers and trusted people, one tap away.'],
]

export default function Landing({ onSignup, onLogin, onGuest }) {
  return (
    <div className="landing">
      <div className="landing-hero">
        <LogoLockup />
        <h1 className="landing-title">
          You don&apos;t have to fight urges alone.
        </h1>
        <p className="s landing-sub">
          UrgeSurf helps you ride out gambling urges, track your recovery, and lean on an
          anonymous community — one day at a time.
        </p>
      </div>
      <div className="landing-feats">
        {FEATURES.map(([icon, title, sub]) => (
          <div key={title} className="landing-feat">
            <span className="row-ic" aria-hidden="true">
              <Icon name={icon} size={22} />
            </span>
            <div>
              <b>{title}</b>
              <p className="s">{sub}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="landing-ctas">
        <button className="cta" onClick={onSignup}>
          Get started
        </button>
        <button className="cta cta-outline" onClick={onLogin}>
          Log in
        </button>
        <button className="ghost" onClick={onGuest}>
          Continue as guest
        </button>
      </div>
      <p className="s landing-note">
        Guests get every recovery tool on this device. Posting to the community needs an account.
      </p>
      <p className="s landing-admin">
        <button
          className="linklike linklike-muted"
          onClick={() => {
            window.location.hash = '#/admin'
          }}
        >
          Temporary admin login
        </button>
      </p>
    </div>
  )
}
