import { useState } from 'react'
import Sheet, { CloseButton } from '../components/Sheet'

const REASONS = ['Spam or scam', 'Gambling content', 'Harassment or hate', 'Personal info exposed', 'Something else']

export default function ReportSheet({ post, onClose, onSubmit }) {
  const [reason, setReason] = useState('')
  const [target, setTarget] = useState('post') // post | user
  const [details, setDetails] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)

  async function handleSend() {
    if (!reason) {
      setError('Pick a reason so the admin knows what to review.')
      return
    }
    setError('')
    setSending(true)
    try {
      await onSubmit({ reason, details: details.trim(), target })
    } catch {
      setError('Could not send the report. Check your connection and try again.')
      setSending(false)
    }
  }

  return (
    <Sheet>
      <CloseButton onClose={onClose} />
      <h1>Report this post</h1>
      <div className="card" style={{ marginTop: 12 }}>
        <div className="m" style={{ fontSize: 12, color: 'var(--mut)', marginBottom: 6 }}>
          {(post?.who || '') || 'Anonymous member'}
        </div>
        <p style={{ fontSize: 14, lineHeight: 1.5 }}>{(post?.text || '').slice(0, 300)}</p>
      </div>
      <p className="s" style={{ marginTop: 10 }}>
        Reports go to the admin team for review. The post stays up until a moderator reviews it.
      </p>
      <h2>What are you reporting?</h2>
      <div>
        <button className="chip" aria-pressed={target === 'post'} onClick={() => setTarget('post')}>
          This post
        </button>
        <button className="chip" aria-pressed={target === 'user'} onClick={() => setTarget('user')}>
          The author
        </button>
      </div>
      <h2>Why are you reporting {target === 'post' ? 'it' : 'them'}?</h2>
      <div>
        {REASONS.map((r) => (
          <button key={r} className="chip" aria-pressed={reason === r} onClick={() => setReason(r)}>
            {r}
          </button>
        ))}
      </div>
      {error ? (
        <span role="alert" className="field-error">
          {error}
        </span>
      ) : null}
      <textarea
        className="in"
        rows="3"
        placeholder="Extra details (optional)"
        value={details}
        onChange={(e) => setDetails(e.target.value)}
      />
      <button className="cta" disabled={sending} onClick={handleSend}>
        {sending ? 'Sending…' : 'Send report'}
      </button>
    </Sheet>
  )
}
