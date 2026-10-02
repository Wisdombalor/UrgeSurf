import Sheet, { BackButton } from '../components/Sheet'
import { BLOCKERS } from '../lib/constants'

export default function BlockerGuideSheet({ index, progress, onBack, onToggle }) {
  const b = BLOCKERS[index]
  const st = progress[b[0]] || []
  const n = st.filter(Boolean).length
  const N = b[3].length

  return (
    <Sheet>
      <BackButton onBack={onBack} label="Back" />
      <h1>{b[0]} setup</h1>
      <p className="s" style={{ margin: '4px 0 6px' }}>
        {n} of {N} steps done. Tap a step when you finish it.
      </p>
      <div className="bar" style={{ marginBottom: 12 }}>
        <i style={{ width: (100 * n) / N + '%' }} />
      </div>
      {b[3].map((t, k) => (
        <button
          key={k}
          className="card opt"
          style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}
          onClick={() => onToggle(b[0], k, N)}
        >
          <span
            className="chip"
            style={{
              margin: 0,
              background: st[k] ? 'var(--acc)' : 'transparent',
              color: st[k] ? '#06201b' : 'var(--tx)',
            }}
          >
            {st[k] ? '✓' : k + 1}
          </span>
          <span style={{ display: 'block' }}>
            <b>{t[0]}</b>
            <span style={{ display: 'block' }}>{t[1]}</span>
          </span>
        </button>
      ))}
      <a className="cta" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }} href={b[2]} target="_blank" rel="noopener">
        Open {b[0]} website
      </a>
      <div className="card" style={{ marginTop: 12 }}>
        <b>Tips</b>
        <p className="s" style={{ marginTop: 4 }}>
          Install it on every device you bet on. Ask a trusted person to hold the password. Ask your bank if it can
          block gambling payments.
        </p>
      </div>
    </Sheet>
  )
}
