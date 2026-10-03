import { useState } from 'react'
import Sheet, { CloseButton } from '../components/Sheet'
import { AmountInput, CountrySelect, CurrencySelect } from '../components/ui'
import { readFilesAsDataUrls, today } from '../lib/helpers'

export default function ProfileSheet({ data, user, isGuest, onClose, onSave, onDelete, onDeleteAccount, onSignOut, onLogin }) {
  const signedIn = Boolean(user) && !isGuest
  const [name, setName] = useState(data.name || '')
  const [date, setDate] = useState(data.since || today())
  const [country, setCountry] = useState(data.country || 'NG')
  const [avatar, setAvatar] = useState(data.avatar || '')
  const [weeklySpend, setWeeklySpend] = useState(data.weeklySpend ?? '')
  const [currency, setCurrency] = useState(data.currency || 'NGN')
  const [nameError, setNameError] = useState('')
  const [spendError, setSpendError] = useState('')
  const [avatarError, setAvatarError] = useState('')
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  async function handleAvatar(e) {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    if (!f.type.startsWith('image/')) {
      setAvatarError('Pick an image file for your profile picture.')
      return
    }
    try {
      const [img] = await readFilesAsDataUrls([f], { maxEach: 2 * 1024 * 1024, maxCount: 1 })
      setAvatar(img.url)
      setAvatarError('')
    } catch (err) {
      setAvatarError(err.message)
    }
  }

  function handleSave() {
    if (!name.trim()) {
      setNameError('Enter your name so the app knows what to call you.')
      return
    }
    const mustEnterSpend = data.assessment?.isAddict
    const spend = Number(weeklySpend)
    if (mustEnterSpend && (weeklySpend === '' || !(spend > 0))) {
      setSpendError('Your self-test showed risky patterns, so weekly spend is required to keep your savings tracker accurate.')
      return
    }
    if (weeklySpend !== '' && !(spend >= 0)) {
      setSpendError('Enter a valid amount, e.g. 5000.')
      return
    }
    setNameError('')
    setSpendError('')
    const soberDay = date || today()
    // Anchor the live timer to the start of the chosen streak date so
    // editing the date actually moves the streak (not "now").
    onSave({
      name: name.trim(),
      since: soberDay,
      sinceTs: new Date(soberDay + 'T00:00:00').getTime(),
      country,
      avatar,
      weeklySpend: weeklySpend === '' ? '' : String(spend),
      currency,
    })
  }

  const a = data.assessment

  return (
    <Sheet>
      <CloseButton onClose={onClose} />
      <h1>Your profile</h1>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 12 }}>
        {avatar ? (
          <img src={avatar} alt="Your profile" className="avatar-lg" />
        ) : (
          <div className="avatar-lg avatar-fallback" aria-hidden="true">
            {(name.trim()[0] || '🙂').toUpperCase()}
          </div>
        )}
        <div>
          <input className="in" style={{ marginTop: 0 }} type="file" accept="image/*" onChange={handleAvatar} aria-label="Upload profile picture" />
          {avatar ? (
            <button className="ghost" style={{ padding: '6px 0', textAlign: 'left' }} onClick={() => setAvatar('')}>
              Remove picture
            </button>
          ) : null}
        </div>
      </div>
      {avatarError ? (
        <span role="alert" className="field-error">
          {avatarError}
        </span>
      ) : null}
      <h2>Name</h2>
      <input
        className="in"
        value={name}
        aria-invalid={!!nameError}
        aria-describedby={nameError ? 'profile-name-error' : undefined}
        onChange={(e) => {
          setName(e.target.value)
          if (nameError && e.target.value.trim()) setNameError('')
        }}
      />
      {nameError ? (
        <span id="profile-name-error" role="alert" className="field-error">
          {nameError}
        </span>
      ) : null}
      <h2>Sober date</h2>
      <input className="in" type="date" max={today()} value={date} onChange={(e) => setDate(e.target.value)} />
      <p className="s" style={{ marginTop: 6 }}>
        Your streak timer counts from this date. After a slip, use “Reset my streak” instead so your history is
        kept.
      </p>
      <h2>Country</h2>
      <CountrySelect value={country} onChange={setCountry} />
      <h2>Weekly gambling spend{a?.isAddict ? ' (required)' : ''}</h2>
      <p className="s">Used to show how much money your sobriety is protecting.</p>
      <div className="row">
        <div style={{ flex: 2 }}>
          <AmountInput
            value={weeklySpend}
            aria-invalid={!!spendError}
            aria-label="Amount spent gambling per week"
            onChange={(v) => {
              setWeeklySpend(v)
              if (spendError) setSpendError('')
            }}
          />
        </div>
        <div style={{ flex: 3 }}>
          <CurrencySelect value={currency} onChange={setCurrency} />
        </div>
      </div>
      {spendError ? (
        <span role="alert" className="field-error">
          {spendError}
        </span>
      ) : null}
      {a ? (
        <>
          <h2>Self-test result</h2>
          <div className="card">
            <b>
              {a.title} · {a.score}/27
            </b>
            <p className="s" style={{ marginTop: 4 }}>
              For self-reflection only, not a diagnosis.
            </p>
          </div>
        </>
      ) : null}
      <button className="cta" onClick={handleSave}>
        Save
      </button>

      <h2 style={{ marginTop: 28 }}>Account</h2>
      {signedIn ? (
        <div className="card">
          <b>Signed in</b>
          <p className="s" style={{ marginTop: 4 }}>
            {user.email} · you can post to the community.
          </p>
          <button className="ghost" style={{ padding: '8px 0 0', textAlign: 'left' }} onClick={onSignOut}>
            Log out
          </button>
        </div>
      ) : (
        <div className="card" style={{ borderColor: 'var(--acc)' }}>
          <b>Browsing as a guest</b>
          <p className="s" style={{ marginTop: 4 }}>
            Log in to post in the community. Everything else already works offline on this device.
          </p>
          <button className="cta" style={{ marginTop: 10, padding: '10px 14px', fontSize: 14 }} onClick={onLogin}>
            Log in / Sign up
          </button>
        </div>
      )}

      <h2 style={{ marginTop: 28 }}>Danger zone</h2>
      <div className="card" style={{ borderColor: 'var(--urge)' }}>
        <b>{signedIn ? 'Delete account' : 'Delete my data'}</b>
        <p className="s" style={{ marginTop: 4 }}>
          {signedIn
            ? 'Deletes your community posts and everything on this device, signs you out, and takes you back to the start screen.'
            : 'Erases everything on this device — profile, streak, urges, journal — signs you out, and takes you back to the start screen.'}
        </p>
        {confirmingDelete ? (
          <>
            <p className="s" style={{ marginTop: 8 }}>
              <b>Are you sure? This cannot be undone.</b>
            </p>
            <div className="row" style={{ marginTop: 8 }}>
              <button className="danger" style={{ marginTop: 0 }} onClick={signedIn ? onDeleteAccount : onDelete}>
                {signedIn ? 'Yes, delete my account' : 'Yes, delete everything'}
              </button>
              <button className="ghost" style={{ flex: 1 }} onClick={() => setConfirmingDelete(false)}>
                Keep my data
              </button>
            </div>
          </>
        ) : (
          <button className="danger" onClick={() => setConfirmingDelete(true)}>
            {signedIn ? 'Delete account' : 'Delete my data'}
          </button>
        )}
      </div>
    </Sheet>
  )
}
