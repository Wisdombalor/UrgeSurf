import { useEffect, useRef, useState } from 'react'
import Sheet, { CloseButton } from '../components/Sheet'
import { LogoLockup } from '../components/Logo'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { isValidEmail } from '../lib/helpers'

const CODE_LEN = 6
const RESEND_COOLDOWN = 30

function OtpBoxes({ value, onChange, disabled }) {
  const refs = useRef([])

  function setDigit(i, d) {
    const next = value.slice()
    next[i] = d
    onChange(next)
  }

  function handleChange(i, e) {
    const raw = e.target.value.replace(/[^0-9]/g, '')
    if (!raw) {
      setDigit(i, '')
      return
    }
    // Paste of a full code spreads across boxes
    if (raw.length > 1) {
      const next = value.slice()
      for (let k = 0; k < raw.length && i + k < CODE_LEN; k++) next[i + k] = raw[k]
      onChange(next)
      const last = Math.min(i + raw.length, CODE_LEN - 1)
      refs.current[last]?.focus()
      return
    }
    setDigit(i, raw)
    if (i < CODE_LEN - 1) refs.current[i + 1]?.focus()
  }

  function handleKeyDown(i, e) {
    if (e.key === 'Backspace' && !value[i] && i > 0) {
      setDigit(i - 1, '')
      refs.current[i - 1]?.focus()
    }
  }

  return (
    <div className="otp-row" role="group" aria-label="6-digit verification code">
      {Array.from({ length: CODE_LEN }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el
          }}
          className="in otp-box"
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={i === 0 ? CODE_LEN : 1}
          value={value[i]}
          disabled={disabled}
          aria-label={`Digit ${i + 1}`}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
        />
      ))}
    </div>
  )
}

export default function AuthSheet({ initialStep = 'form', closable, onAuthed, onGuest, onClose }) {
  const [mode, setMode] = useState('login') // login | signup
  const [step, setStep] = useState(initialStep) // form | code | forgot | sent | reset
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [code, setCode] = useState(Array(CODE_LEN).fill(''))
  const [cooldown, setCooldown] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const backendDown = !isSupabaseConfigured || !supabase
  const codeString = code.join('')
  const codeComplete = codeString.length === CODE_LEN

  useEffect(() => {
    if (cooldown <= 0) return
    const id = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000)
    return () => clearInterval(id)
  }, [cooldown])

  async function handleGoogle() {
    setError('')
    setBusy(true)
    try {
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      })
      if (err) throw err
      // Browser leaves for Google here — App resumes the session on return.
    } catch (err) {
      setError(err?.message || 'Google sign-in failed. Try email instead.')
      setBusy(false)
    }
  }

  async function handlePasswordAuth() {
    setError('')
    if (!isValidEmail(email)) {
      setError('Enter a valid email address, e.g. name@example.com.')
      return
    }
    if (password.length < 6) {
      setError('Password needs at least 6 characters.')
      return
    }
    setBusy(true)
    try {
      if (mode === 'signup') {
        const { data, error: err } = await supabase.auth.signUp({ email: email.trim(), password })
        if (err) throw err
        if (data?.session) {
          onAuthed()
        } else {
          // Email confirmation required — Supabase already sent the 6-digit code.
          setCode(Array(CODE_LEN).fill(''))
          setCooldown(RESEND_COOLDOWN)
          setStep('code')
        }
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
        if (err) throw err
        onAuthed()
      }
    } catch (err) {
      const msg = err?.message || 'Something went wrong. Check your connection and try again.'
      if (/email not confirmed/i.test(msg)) {
        setError('')
        try {
          await supabase.auth.resend({ type: 'signup', email: email.trim() })
        } catch {
          // ignore — code screen still lets them retry
        }
        setCode(Array(CODE_LEN).fill(''))
        setCooldown(RESEND_COOLDOWN)
        setStep('code')
      } else {
        setError(msg)
      }
    } finally {
      setBusy(false)
    }
  }

  async function handleVerify() {
    if (!codeComplete || busy) return
    setError('')
    setBusy(true)
    try {
      const { error: err } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: codeString,
        type: 'signup',
      })
      if (err) throw err
      onAuthed()
    } catch (err) {
      setError(err?.message || 'That code did not work. Check it and try again.')
    } finally {
      setBusy(false)
    }
  }

  async function handleResend() {
    if (cooldown > 0 || busy) return
    setError('')
    setBusy(true)
    try {
      const { error: err } = await supabase.auth.resend({ type: 'signup', email: email.trim() })
      if (err) throw err
      setCooldown(RESEND_COOLDOWN)
    } catch (err) {
      setError(err?.message || 'Could not resend the code. Try again in a moment.')
    } finally {
      setBusy(false)
    }
  }

  async function handleForgot() {
    setError('')
    if (!isValidEmail(email)) {
      setError('Enter the email address of your account first.')
      return
    }
    setBusy(true)
    try {
      const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin,
      })
      if (err) throw err
      setStep('sent')
    } catch (err) {
      setError(err?.message || 'Could not send the reset email. Try again in a moment.')
    } finally {
      setBusy(false)
    }
  }

  async function handleReset() {
    setError('')
    if (newPass.length < 6) {
      setError('New password needs at least 6 characters.')
      return
    }
    if (newPass !== confirmPass) {
      setError('The two passwords do not match.')
      return
    }
    setBusy(true)
    try {
      const { error: err } = await supabase.auth.updateUser({ password: newPass })
      if (err) throw err
      onAuthed()
    } catch (err) {
      setError(err?.message || 'Could not set the new password. Request a fresh link and try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Sheet>
      {step === 'form' ? (
        <>
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
              Email login is not connected yet (missing Supabase URL). You can still continue as a guest.
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
            <b>Continue with Google</b>
          </button>

          <div
            style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '14px 0 2px' }}
            aria-hidden="true"
          >
            <span style={{ flex: 1, height: 1, background: 'var(--line)' }} />
            <span className="s" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              or use email
            </span>
            <span style={{ flex: 1, height: 1, background: 'var(--line)' }} />
          </div>

          <div style={{ marginTop: 12 }}>
            {[
              ['login', 'Log in'],
              ['signup', 'Sign up'],
            ].map(([k, label]) => (
              <button key={k} className="chip" aria-pressed={mode === k} onClick={() => { setMode(k); setError('') }}>
                {label}
              </button>
            ))}
          </div>

          <h2>Email</h2>
          <input
            className="in"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); if (error) setError('') }}
          />
          <h2>Password</h2>
          <input
            className="in"
            type="password"
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            placeholder={mode === 'signup' ? 'Create a password (6+ characters)' : 'Your password'}
            value={password}
            onChange={(e) => { setPassword(e.target.value); if (error) setError('') }}
            onKeyDown={(e) => { if (e.key === 'Enter') handlePasswordAuth() }}
          />
          {mode === 'signup' ? (
            <p className="s" style={{ marginTop: 8 }}>
              We will email you a 6-digit code to verify it is really you.
            </p>
          ) : null}
          {error ? (
            <span role="alert" className="field-error">
              {error}
            </span>
          ) : null}
          <button className="cta" disabled={backendDown || busy} onClick={handlePasswordAuth}>
            {busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
          </button>
          {mode === 'login' ? (
            <button
              className="ghost"
              style={{ padding: '10px 0 0' }}
              onClick={() => { setStep('forgot'); setError('') }}
            >
              Forgot password?
            </button>
          ) : null}

          <div className="card" style={{ marginTop: 14 }}>
            <b>Just looking around?</b>
            <p className="s" style={{ marginTop: 4 }}>
              Guests can use every recovery tool. Community posts need an account — you can log in later
              from the menu.
            </p>
            <button className="ghost" onClick={onGuest}>
              Continue as guest
            </button>
          </div>
        </>
      ) : null}
      {step === 'code' ? (
        <>
          {closable ? <CloseButton onClose={onClose} label="Close" /> : null}
          <h1>Check your email</h1>
          <p className="s" style={{ marginTop: 6 }}>
            We sent a 6-digit code to <b style={{ color: 'var(--tx)' }}>{email.trim()}</b>. Enter it below
            to verify your account.
          </p>
          <div style={{ marginTop: 16 }}>
            <OtpBoxes value={code} onChange={(next) => { setCode(next); if (error) setError('') }} disabled={busy} />
          </div>
          {error ? (
            <span role="alert" className="field-error">
              {error}
            </span>
          ) : null}
          <button className="cta" disabled={!codeComplete || busy} onClick={handleVerify}>
            {busy ? 'Verifying…' : 'Verify'}
          </button>
          <p className="s" style={{ marginTop: 12, textAlign: 'center' }}>
            Didn&apos;t get a code?{' '}
            {cooldown > 0 ? (
              <>Resend in {cooldown}s</>
            ) : (
              <button
                className="ghost"
                style={{ display: 'inline', width: 'auto', padding: 0, color: 'var(--acc)', fontWeight: 700 }}
                onClick={handleResend}
              >
                Resend
              </button>
            )}
          </p>
          <button
            className="ghost"
            onClick={() => { setStep('form'); setError(''); setCode(Array(CODE_LEN).fill('')) }}
          >
            Use a different email
          </button>
        </>
      ) : null}
      {step === 'forgot' ? (
        <>
          {closable ? <CloseButton onClose={onClose} label="Close" /> : null}
          <div style={{ marginBottom: 4 }}>
            <LogoLockup />
          </div>
          <h1>Reset password</h1>
          <p className="s" style={{ marginTop: 6 }}>
            Enter your account email and we will send you a link to choose a new password.
          </p>
          <h2>Email</h2>
          <input
            className="in"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); if (error) setError('') }}
            onKeyDown={(e) => { if (e.key === 'Enter') handleForgot() }}
          />
          {error ? (
            <span role="alert" className="field-error">
              {error}
            </span>
          ) : null}
          <button className="cta" disabled={backendDown || busy} onClick={handleForgot}>
            {busy ? 'Sending…' : 'Email me a reset link'}
          </button>
          <button
            className="ghost"
            onClick={() => { setStep('form'); setError('') }}
          >
            Back to log in
          </button>
        </>
      ) : null}
      {step === 'sent' ? (
        <>
          {closable ? <CloseButton onClose={onClose} label="Close" /> : null}
          <div style={{ marginBottom: 4 }}>
            <LogoLockup />
          </div>
          <h1>Check your inbox</h1>
          <p className="s" style={{ marginTop: 6 }}>
            If an account exists for <b style={{ color: 'var(--tx)' }}>{email.trim()}</b>, a reset link is
            on its way. Open it on this device, then choose a new password here.
          </p>
          <button
            className="ghost"
            onClick={() => { setStep('form'); setError('') }}
          >
            Back to log in
          </button>
        </>
      ) : null}
      {step === 'reset' ? (
        <>
          <div style={{ marginBottom: 4 }}>
            <LogoLockup />
          </div>
          <h1>Choose a new password</h1>
          <p className="s" style={{ marginTop: 6 }}>
            Almost done — set a fresh password to get back into your account.
          </p>
          <h2>New password</h2>
          <input
            className="in"
            type="password"
            autoComplete="new-password"
            placeholder="6+ characters"
            value={newPass}
            onChange={(e) => { setNewPass(e.target.value); if (error) setError('') }}
          />
          <h2>Confirm new password</h2>
          <input
            className="in"
            type="password"
            autoComplete="new-password"
            placeholder="Repeat the new password"
            value={confirmPass}
            onChange={(e) => { setConfirmPass(e.target.value); if (error) setError('') }}
            onKeyDown={(e) => { if (e.key === 'Enter') handleReset() }}
          />
          {error ? (
            <span role="alert" className="field-error">
              {error}
            </span>
          ) : null}
          <button className="cta" disabled={busy} onClick={handleReset}>
            {busy ? 'Saving…' : 'Set new password'}
          </button>
          {onClose ? (
            <button className="ghost" onClick={onClose}>
              Cancel
            </button>
          ) : null}
        </>
      ) : null}
    </Sheet>
  )
}
