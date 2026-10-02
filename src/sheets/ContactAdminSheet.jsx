import { useState } from 'react'
import Sheet, { CloseButton } from '../components/Sheet'
import { isValidEmail } from '../lib/helpers'

export default function ContactAdminSheet({ onClose, onSubmit }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState({})
  const [sending, setSending] = useState(false)
  const [failed, setFailed] = useState('')

  async function handleSend() {
    const errs = {}
    if (!isValidEmail(email)) errs.email = 'Enter your email so the admin can reply to you.'
    if (!message.trim() || message.trim().length < 10)
      errs.message = 'Tell us a little more — at least 10 characters — so we can act on it.'
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    setSending(true)
    setFailed('')
    try {
      await onSubmit({ name: name.trim(), email: email.trim(), message: message.trim() })
      onClose()
    } catch (e) {
      setFailed(e?.message || 'Could not send. Check your connection and try again.')
      setSending(false)
    }
  }

  return (
    <Sheet>
      <CloseButton onClose={onClose} />
      <h1>Contact the admin</h1>
      <p className="s" style={{ margin: '6px 0' }}>
        Suggest an improvement, report a bug, or ask for help with the app. The admin replies by email.
      </p>
      {failed ? (
        <div className="error-banner" role="alert">
          {failed}
        </div>
      ) : null}
      <input className="in" placeholder="Your name (optional)" value={name} onChange={(e) => setName(e.target.value)} />
      <input
        className="in"
        placeholder="Your email so we can reply"
        value={email}
        inputMode="email"
        aria-invalid={!!errors.email}
        onChange={(e) => setEmail(e.target.value)}
      />
      {errors.email ? (
        <span role="alert" className="field-error">
          {errors.email}
        </span>
      ) : null}
      <textarea
        className="in story-box"
        rows="6"
        placeholder="What should be better?"
        value={message}
        aria-invalid={!!errors.message}
        onChange={(e) => setMessage(e.target.value)}
      />
      {errors.message ? (
        <span role="alert" className="field-error">
          {errors.message}
        </span>
      ) : null}
      <button className="cta" disabled={sending} onClick={handleSend}>
        {sending ? 'Sending…' : 'Send to admin'}
      </button>
    </Sheet>
  )
}
