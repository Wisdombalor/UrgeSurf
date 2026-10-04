import { useEffect, useState } from 'react'
import Icon from './Icon'

// Hamburger menu for the dashboard header. Holds everything account-related:
// identity, profile link, and login/logout — so the header stays clean.
export default function AccountMenu({ name, email, avatar, isGuest, onProfile, onLogin, onSignOut }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open ])

  function go(fn) {
    setOpen(false)
    fn?.()
  }

  const initial = (name?.trim()?.[0] || (isGuest ? '?' : '🙂')).toUpperCase()

  return (
    <div className="menu-wrap" data-guest={isGuest ? 'true' : 'false'}>
      <button
        className="icon-btn menu-trigger"
        aria-label="Open menu"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((o) => !o)}
      >
        <Icon name="menu" size={24} />
      </button>
      <div className="account-inline">
        <button className="account-btn" onClick={onProfile}>
          <Icon name="user" size={18} />
          My profile
        </button>
        {isGuest ? (
          <button className="account-btn account-btn-accent account-btn-auth" onClick={onLogin}>
            <Icon name="logIn" size={18} />
            Log in / Sign up
          </button>
        ) : (
          <button className="account-btn" onClick={onSignOut}>
            <Icon name="logOut" size={18} />
            Log out
          </button>
        )}
      </div>
      {open ? (
        <>
          <button className="menu-backdrop" aria-hidden="true" tabIndex={-1} onClick={() => setOpen(false)} />
          <div className="menu-pop card" role="menu" aria-label="Account menu">
            <div className="menu-id">
              {avatar ? (
                <img src={avatar} alt="" className="menu-avatar" />
              ) : (
                <div className="menu-avatar menu-avatar-fallback" aria-hidden="true">
                  {initial}
                </div>
              )}
              <div className="menu-id-text">
                <b>{isGuest ? 'Guest' : name || 'Your account'}</b>
                <span className="s">{isGuest ? 'Browsing on this device' : email || 'Signed in'}</span>
              </div>
            </div>
            <button className="menu-item" role="menuitem" onClick={() => go(onProfile)}>
              <span className="row-ic">
                <Icon name="user" size={19} />
              </span>
              My profile
              <span style={{ marginLeft: 'auto', color: 'var(--mut)' }}>
                <Icon name="chevR" size={18} />
              </span>
            </button>
            {isGuest ? (
              <button className="menu-item menu-item-accent" role="menuitem" onClick={() => go(onLogin)}>
                <span className="row-ic">
                  <Icon name="logIn" size={19} />
                </span>
                Log in / Sign up
              </button>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  )
}
