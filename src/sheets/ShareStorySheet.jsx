import { useState } from 'react'
import Sheet, { CloseButton } from '../components/Sheet'
import { SelectableCard } from '../components/ui'
import { COMMUNITY_RULES } from '../lib/constants'
import { containsContactInfo, readFilesAsDataUrls } from '../lib/helpers'

const MIN_LEN = 20

export default function ShareStorySheet({ defaultName, isGuest, onLogin, onClose, onPost }) {
  const [text, setText] = useState('')
  const [vis, setVis] = useState(isGuest ? 'priv' : 'com')
  const [anon, setAnon] = useState(true)
  const [showName, setShowName] = useState(defaultName || '')
  const [media, setMedia] = useState([])
  const [agreed, setAgreed] = useState(false)
  const [errors, setErrors] = useState({})

  async function handleFiles(e) {
    const files = e.target.files
    e.target.value = ''
    if (!files?.length) return
    try {
      const urls = await readFilesAsDataUrls(files, { maxEach: 3 * 1024 * 1024, maxCount: 4 })
      const next = [...media, ...urls].slice(0, 4)
      setMedia(next)
      setErrors((p) => ({ ...p, media: undefined }))
    } catch (err) {
      setErrors((p) => ({ ...p, media: err.message }))
    }
  }

  function handlePost() {
    // Guests can only save privately, even if the sheet was opened with com selected.
    const effectiveVis = isGuest ? 'priv' : vis
    const errs = {}
    const t = text.trim()
    if (!t || t.length < MIN_LEN)
      errs.text = `Give a little more detail — at least ${MIN_LEN} characters — so others can understand what helped.`
    else if (containsContactInfo(t))
      errs.text = 'Remove phone numbers or email addresses before posting. Stay anonymous-safe.'
    const w = showName.trim()
    if (effectiveVis === 'com' && !anon && !w) errs.showName = 'Enter the name you want shown with your story.'
    if (effectiveVis === 'com' && !agreed) errs.agreed = 'Please confirm you follow the community rules before posting.'
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    if (effectiveVis === 'priv') {
      onPost({ visibility: 'priv', text: t, media })
      return
    }
    onPost({ visibility: 'com', text: t, who: anon ? '' : w, media })
  }

  return (
    <Sheet>
      <CloseButton onClose={onClose} />
      <h1>Share your story</h1>
      <p className="s" style={{ marginTop: 6 }}>
        {text.trim().length}/{500} characters · minimum {MIN_LEN}. {vis === 'com' && anon ? 'Posting anonymously.' : ''}
      </p>
      <textarea
        className="in story-box"
        rows="9"
        maxLength={2000}
        placeholder="What happened, and what helped? Take your time — there is plenty of room."
        value={text}
        aria-invalid={!!errors.text}
        aria-describedby={errors.text ? 'share-text-error' : undefined}
        onChange={(e) => {
          setText(e.target.value.slice(0, 2000))
          if (errors.text) setErrors((p) => ({ ...p, text: undefined }))
        }}
      />
      {errors.text ? (
        <span id="share-text-error" role="alert" className="field-error">
          {errors.text}
        </span>
      ) : null}

      <h2>Add pictures or a short video (optional)</h2>
      <input className="in" type="file" accept="image/*,video/*" multiple onChange={handleFiles} />
      <p className="s" style={{ marginTop: 6 }}>
        Up to 4 files, 3MB each. Avoid faces, documents, or anything identifying.
      </p>
      {errors.media ? (
        <span role="alert" className="field-error">
          {errors.media}
        </span>
      ) : null}
      {media.length ? (
        <div className="media-grid" style={{ marginTop: 8 }}>
          {media.map((m, i) =>
            m.type.startsWith('video') ? (
              <div key={i} style={{ position: 'relative' }}>
                <video src={m.url} controls playsInline preload="metadata" />
                <button className="chip" style={{ marginTop: 6 }} onClick={() => setMedia((p) => p.filter((_, k) => k !== i))}>
                  Remove
                </button>
              </div>
            ) : (
              <div key={i} style={{ position: 'relative' }}>
                <img src={m.url} alt={`Attachment ${i + 1}`} />
                <button className="chip" style={{ marginTop: 6 }} onClick={() => setMedia((p) => p.filter((_, k) => k !== i))}>
                  Remove
                </button>
              </div>
            ),
          )}
        </div>
      ) : null}

      <h2>Who can see it?</h2>
      {isGuest ? (
        <div className="card" style={{ borderColor: 'var(--acc)' }}>
          <b>Guests can journal privately</b>
          <p className="s" style={{ marginTop: 4 }}>
            Posting to the recovery community needs an account — it keeps the space safe and moderated.
          </p>
          <button className="cta" style={{ marginTop: 10, padding: '10px 14px', fontSize: 14 }} onClick={onLogin}>
            Log in / Sign up to post publicly
          </button>
        </div>
      ) : (
        <SelectableCard
          selected={vis === 'com'}
          onSelect={() => setVis('com')}
          title="Recovery community"
          sub="Shows under Community → All and Mine instantly, even anonymously."
        />
      )}
      <SelectableCard
        selected={vis === 'priv'}
        onSelect={() => setVis('priv')}
        title="Only me"
        sub="Private journal entry under Community → Private."
      />
      <h2>How should we show you?</h2>
      <SelectableCard
        selected={anon}
        onSelect={() => setAnon(true)}
        title="Anonymous"
        sub="Shown as “Anonymous · You” so you can always find it."
      />
      <SelectableCard
        selected={!anon}
        onSelect={() => setAnon(false)}
        title="Use a name"
        sub="Show a name you choose. It need not be your real one."
      />
      {!anon ? (
        <>
          <input
            className="in"
            placeholder="Name to show"
            value={showName}
            aria-invalid={!!errors.showName}
            aria-describedby={errors.showName ? 'share-name-error' : undefined}
            onChange={(e) => {
              setShowName(e.target.value)
              if (errors.showName) setErrors((p) => ({ ...p, showName: undefined }))
            }}
          />
          {errors.showName ? (
            <span id="share-name-error" role="alert" className="field-error">
              {errors.showName}
            </span>
          ) : null}
        </>
      ) : null}

      {vis === 'com' ? (
        <div className="card" style={{ marginTop: 12 }}>
          <b>Community rules</b>
          <ul style={{ marginTop: 8, paddingLeft: 18, fontSize: 13, lineHeight: 1.55 }}>
            {COMMUNITY_RULES.map(([t, s]) => (
              <li key={t} style={{ marginBottom: 4 }}>
                <b>{t}.</b> <span className="s">{s}</span>
              </li>
            ))}
          </ul>
          <button
            className="chip"
            aria-pressed={agreed}
            style={{ marginTop: 10 }}
            onClick={() => {
              setAgreed((a) => !a)
              if (errors.agreed) setErrors((p) => ({ ...p, agreed: undefined }))
            }}
          >
            {agreed ? '✓ ' : ''}I follow these rules
          </button>
          {errors.agreed ? (
            <span role="alert" className="field-error">
              {errors.agreed}
            </span>
          ) : null}
        </div>
      ) : null}

      <button className="cta" onClick={handlePost}>
        {vis === 'priv' ? 'Save privately' : 'Post to community'}
      </button>
    </Sheet>
  )
}
