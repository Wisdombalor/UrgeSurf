import { useState } from 'react'
import Sheet, { CloseButton } from '../components/Sheet'
import { isValidPhone } from '../lib/helpers'

export default function TrustedPeopleSheet({ contacts, addMode, onAddMode, onListMode, onSave, onRemove, onClose }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [rel, setRel] = useState('')
  const [errors, setErrors] = useState({})

  function handleSave() {
    const errs = {}
    if (!name.trim()) errs.name = 'Enter a name so you know who to call.'
    if (!phone.trim()) {
      errs.phone = 'Enter a phone number with at least 7 digits.'
    } else if (!isValidPhone(phone)) {
      errs.phone = 'That phone number does not look valid. Use digits only — at least 7 digits, e.g. +234 801 234 5678.'
    }
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    onSave({ n: name.trim(), p: phone.trim(), r: rel.trim() })
    setName('')
    setPhone('')
    setRel('')
    setErrors({})
  }

  return (
    <Sheet>
      <CloseButton onClose={onClose} />
      <h1>My trusted people</h1>
      {addMode ? (
        <>
          <p className="s" style={{ margin: '6px 0 8px' }}>
            Someone you can call or message when an urge hits.
          </p>
          <input
            className="in"
            placeholder="Name"
            value={name}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'trusted-name-error' : undefined}
            onChange={(e) => {
              setName(e.target.value)
              if (errors.name) setErrors((p) => ({ ...p, name: undefined }))
            }}
          />
          {errors.name ? (
            <span id="trusted-name-error" role="alert" className="field-error">
              {errors.name}
            </span>
          ) : null}
          <input
            className="in"
            type="tel"
            inputMode="tel"
            placeholder="Phone number, e.g. +234 801 234 5678"
            value={phone}
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? 'trusted-phone-error' : undefined}
            onChange={(e) => {
              setPhone(e.target.value)
              if (errors.phone) setErrors((p) => ({ ...p, phone: undefined }))
            }}
          />
          {errors.phone ? (
            <span id="trusted-phone-error" role="alert" className="field-error">
              {errors.phone}
            </span>
          ) : null}
          <input className="in" placeholder="Relationship (optional)" value={rel} onChange={(e) => setRel(e.target.value)} />
          <button className="cta" onClick={handleSave}>
            Save
          </button>
          <button className="ghost" onClick={onListMode}>
            Cancel
          </button>
        </>
      ) : contacts.length === 0 ? (
        <>
          <div style={{ textAlign: 'center', margin: '44px 0 24px' }}>
            <div style={{ fontSize: 54 }}>🤝</div>
            <b style={{ fontSize: 18 }}>No trusted people yet</b>
            <p className="s" style={{ marginTop: 6 }}>
              Add someone you trust. You can add up to 5.
            </p>
          </div>
          <button className="cta" onClick={onAddMode}>
            Add a trusted person
          </button>
        </>
      ) : (
        <>
          {contacts.map((c, i) => (
            <div className="card" style={{ marginTop: 12 }} key={c.p + '-' + i}>
              <b>{c.n}</b>
              <p className="s">
                {c.r || 'Trusted person'} · {c.p}
              </p>
              <div className="row">
                <a className="cta" style={{ textAlign: 'center', textDecoration: 'none', padding: 10 }} href={'tel:' + c.p}>
                  Call
                </a>
                <a className="cta" style={{ textAlign: 'center', textDecoration: 'none', padding: 10 }} href={'sms:' + c.p}>
                  Message
                </a>
              </div>
              <button className="ghost" onClick={() => onRemove(i)}>
                Remove
              </button>
            </div>
          ))}
          {contacts.length < 5 ? (
            <button className="cta" onClick={onAddMode}>
              Add another
            </button>
          ) : null}
        </>
      )}
    </Sheet>
  )
}
