import { useState } from 'react'
import Sheet, { CloseButton } from '../components/Sheet'
import { LogoLockup } from '../components/Logo'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

// Google-only sign-in. Guests continue without an account.
export default function AuthSheet({ closable, onGuest, onClose }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const backendDown = !isSupabaseConfigured || !supabase

  async function handleGoogle() {
    setError('')
    setBusy(true)
    try {
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          // Always show Google's account chooser — never silently reuse
          // the last signed-in Google account.
          queryParams: { prompt: 'select_account' },
        },
      })
      if (err) throw err
      // Browser leaves for Google here — App resumes the session on return.
    } catch (err) {
      setError(err?.message || 'Google sign-in failed. Check your connection and try again.')
      setBusy(false)
    }
  }

  return (
    <Sheet>
      {closable ? <CloseButton onClose={onClose} label="Close" /> : null}
      <div style={{ marginBottom: 4 }}>
        <LogoLockup />
      </div>
      <h1>Welcome to UrgeSurf</h1>
      <p className="s" style={{ marginTop: 6 }}>
        Log in to share with the community and sync across devices — or continue as a guest and keep
        everything on this device only.
      </p>

      {backendDown ? (
        <div className="error-banner">
          Sign-in is not connected yet (missing Supabase URL). You can still continue as a guest.
        </div>
      ) : null}

      <button
        className="card opt"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 14 }}
        onClick={handleGoogle}
        disabled={backendDown || busy}
      >
        <svg width="19" height="19" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <b>{busy ? 'Please wait…' : 'Continue with Google'}</b>
      </button>
      {error ? (
        <span role="alert" className="field-error">
          {error}
        </span>
      ) : null}

      <div className="card" style={{ marginTop: 14 }}>
        <b>Just looking around?</b>
        <p className="s" style={{ marginTop: 4 }}>
          Guests can use every recovery tool and read community posts. Posting to the community needs
          an account — you can log in later from the menu.
        </p>
        <button className="ghost" onClick={onGuest}>
          Continue as guest
        </button>
      </div>
    </Sheet>
  )
}
