import { useState } from 'react'
import { greet, longest, today } from '../lib/helpers'
import SobrietyTimer from '../components/SobrietyTimer'
import SavingsCard from '../components/SavingsCard'
import AccountMenu from '../components/AccountMenu'
import { LogoMark } from '../components/Logo'
import Icon from '../components/Icon'

const CHECKIN_LABELS = ['Turn on my blocker', 'Tell someone', 'Move my money']

export default function Home({
  data,
  user,
  isGuest,
  theme,
  onToggleTheme,
  onLogin,
  onSignOut,
  onOpenUrge,
  onOpenProfile,
  onOpenBlockers,
  onResetStreak,
  onSaveCheckin,
  onGoRecovery,
}) {
  const activeKeys = Object.keys(data.active || {}).filter((k) => data.active[k])
  const day = today()
  const saved = data.checkins?.[day] || []
  const [checks, setChecks] = useState(saved)
  const [done, setDone] = useState(saved.length > 0)
  const [error, setError] = useState('')

  function toggle(i) {
    if (done) return
    setChecks((c) => {
      const label = CHECKIN_LABELS[i]
      return c.includes(label) ? c.filter((x) => x !== label) : [...c, label]
    })
    if (error) setError('')
  }

  function complete() {
    if (checks.length === 0) {
      setError('Pick at least one action to complete your check-in.')
      return
    }
    setError('')
    onSaveCheckin(checks)
    setDone(true)
  }

  function undo() {
    onSaveCheckin([])
    setChecks([])
    setDone(false)
  }

  return (
    <div>
      <div className="row" style={{ alignItems: 'center' }}>
        <p className="s brand-line">
          <LogoMark size={26} />
          <span className="brand-text">
            <b style={{ color: 'var(--acc)' }}>UrgeSurf</b>
          </span>
        </p>
        <button
          className="icon-btn"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          onClick={onToggleTheme}
        >
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={24} />
        </button>
        <AccountMenu
          name={data.name}
          email={user?.email}
          avatar={data.avatar}
          isGuest={isGuest}
          onProfile={onOpenProfile}
          onLogin={onLogin}
          onSignOut={onSignOut}
        />
      </div>
      <p className="s home-greet">
        {greet()}
        {data.name ? ', ' + data.name : ''}
      </p>
      <h1>How are you feeling right now?</h1>
      <button className="urge" onClick={onOpenUrge} aria-label="I'm having an urge. Get help through it.">
        <span className="urge-icon" aria-hidden="true">
          <Icon name="buoy" size={24} />
        </span>
        <span className="urge-text">
          I&apos;m having an urge<small>Ride it out — most urges peak and pass.</small>
        </span>
        <span className="urge-arrow" aria-hidden="true">
          ›
        </span>
      </button>
      <SobrietyTimer data={data} />
      <button className="ghost" style={{ padding: '6px' }} onClick={onOpenProfile}>
        Edit streak date
      </button>
      <button className="danger" onClick={onResetStreak}>
        Reset my streak
      </button>
      <p className="s" style={{ marginTop: 6, textAlign: 'center' }}>
        Slipped? Resetting starts a new period — your past progress stays saved.
      </p>
      <div className="row" style={{ marginTop: 10 }}>
        <div className="card stat">
          <b>{longest(data)}</b>
          <span>longest period (days)</span>
        </div>
        <div className="card stat">
          <b>{data.urges.length}</b>
          <span>urges handled</span>
        </div>
      </div>
      <SavingsCard data={data} onEdit={onOpenProfile} />
      <div className="duo">
        <section>
          <h2>Today&apos;s check-in</h2>
          <div className="card">
            {done ? (
              <>
                <p>
                  <b>Checked in for today.</b>
                </p>
                <p className="s" style={{ marginTop: 6 }}>
                  You chose: {saved.length ? saved.join(' · ') : checks.join(' · ')}. Nice — small protections add up.
                  Next: keep your blocker on and check your streak in Recovery.
                </p>
                <div className="row" style={{ marginTop: 12 }}>
                  <button className="cta" style={{ marginTop: 0, padding: 12 }} onClick={onGoRecovery}>
                    View my recovery
                  </button>
                  <button className="ghost" style={{ flex: 1 }} onClick={undo}>
                    Undo
                  </button>
                </div>
              </>
            ) : (
              <>
                <p>What is one thing you can do today that makes gambling less accessible?</p>
                <div style={{ marginTop: 12 }}>
                  {CHECKIN_LABELS.map((label, i) => (
                    <button
                      key={label}
                      className="chip"
                      aria-pressed={checks.includes(label)}
                      onClick={() => toggle(i)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {error ? (
                  <span role="alert" className="field-error">
                    {error}
                  </span>
                ) : null}
                <button className="cta" style={{ padding: 12 }} onClick={complete}>
                  Complete check-in
                </button>
              </>
            )}
          </div>
        </section>
        <section>
          <h2>Protection</h2>
      <div className="card">
        <b>Blocker status</b>
        <p className="s" style={{ margin: '4px 0 0' }}>
          {activeKeys.length ? 'Active: ' + activeKeys.join(', ') : 'No blocker marked active yet.'}
        </p>
        <button
          className="cta"
          style={{ marginTop: 12, padding: '10px 14px', fontSize: 14 }}
          onClick={onOpenBlockers}
        >
          Open Protect Me
        </button>
      </div>
        </section>
      </div>
    </div>
  )
}
