import { useState } from 'react'
import Sheet, { CloseButton } from '../components/Sheet'
import { SelectableCard } from '../components/ui'
import { crisisEntry, validateSupport } from '../lib/helpers'

export default function SupportRequestSheet({ data, onClose, onSubmit }) {
  const [name, setName] = useState(data.name || '')
  const [text, setText] = useState('')
  const [how, setHow] = useState('email')
  const [contact, setContact] = useState('')
  const [urgent, setUrgent] = useState(false)
  const [sending, setSending] = useState(false)
  const [errors, setErrors] = useState({})
  const [submitFailed, setSubmitFailed] = useState(false)

  async function handleSend() {
    const errs = validateSupport({ text, how, contact })
    setErrors(errs)
    setSubmitFailed(Object.keys(errs).length > 0)
    if (Object.keys(errs).length > 0) return
    setSubmitFailed(false)
    setSending(true)
    await onSubmit({ name: name.trim(), text: text.trim(), how, contact: contact.trim(), urgent })
    setSending(false)
  }

  return (
    <Sheet>
      <CloseButton onClose={onClose} />
      <h1>Request support</h1>
      <p className="s" style={{ margin: '6px 0' }}>
        This is emailed to the UrgeSurf support team. It is never posted to the community.
      </p>
      {submitFailed ? (
        <div className="error-banner" role="alert">
          There are {Object.keys(errors).length} problem{Object.keys(errors).length > 1 ? 's' : ''} with this form.
          Check the highlighted fields below.
        </div>
      ) : null}
      <input className="in" placeholder="Name (optional)" value={name} onChange={(e) => setName(e.target.value)} />
      <textarea
        className="in story-box"
        rows="9"
        placeholder="What is going on? Take your time — the more detail you give, the better the team can help. (minimum 10 characters)"
        value={text}
        aria-invalid={!!errors.text}
        aria-describedby={errors.text ? 'support-text-error' : undefined}
        onChange={(e) => {
          setText(e.target.value)
          if (errors.text) setErrors((p) => ({ ...p, text: undefined }))
        }}
      />
      <p className="s" style={{ marginTop: 6 }}>
        {text.trim().length} characters · minimum 10
      </p>
      {errors.text ? (
        <span id="support-text-error" role="alert" className="field-error">
          {errors.text}
        </span>
      ) : null}
      <h2>How should we reply?</h2>
      <SelectableCard selected={how === 'email'} onSelect={() => setHow('email')} title="By email" value="email" />
      <SelectableCard selected={how === 'phone'} onSelect={() => setHow('phone')} title="By phone call" value="phone" />
      <input
        className="in"
        placeholder={how === 'email' ? 'Your email address' : 'Your phone number'}
        value={contact}
        inputMode={how === 'email' ? 'email' : 'tel'}
        aria-invalid={!!errors.contact}
        aria-describedby={errors.contact ? 'support-contact-error' : undefined}
        onChange={(e) => {
          setContact(e.target.value)
          if (errors.contact) setErrors((p) => ({ ...p, contact: undefined }))
        }}
      />
      {errors.contact ? (
        <span id="support-contact-error" role="alert" className="field-error">
          {errors.contact}
        </span>
      ) : null}
      <button
        className="chip"
        aria-pressed={urgent}
        style={{ marginTop: 12 }}
        onClick={() => setUrgent((u) => !u)}
      >
        I need help right now
      </button>
      <p className="s" style={{ display: urgent ? 'block' : 'none', marginBottom: 8 }}>
        Please call {crisisEntry(data.country)[1][0]?.[2] || 'your local emergency number'} now. Do not wait for a reply.
      </p>
      <button className="cta" disabled={sending} onClick={handleSend}>
        {sending ? 'Sending...' : 'Send request'}
      </button>
    </Sheet>
  )
}
