import { useEffect, useRef, useState } from 'react'
import Sheet from '../components/Sheet'
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

export default function AuthSheet({ onAuthed, onGuest }) {
  const [mode, setMode] = useState('login') // login | signup
  const [step, setStep] = useState('form') // form | code
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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

  return (
    <Sheet>
      {step === 'form' ? (
        <>
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
      ) : (
        <>
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
      )}
    </Sheet>
  )
}
