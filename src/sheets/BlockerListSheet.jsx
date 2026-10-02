import Sheet, { CloseButton } from '../components/Sheet'
import { BLOCKERS } from '../lib/constants'

export default function BlockerListSheet({ progress, active, onClose, onGuide }) {
  return (
    <Sheet>
      <CloseButton onClose={onClose} />
      <h1>Protect me</h1>
      <p className="s" style={{ margin: '6px 0 4px' }}>
        Pick a blocker and follow its install guide.
      </p>
      {BLOCKERS.map((b, i) => {
        const st = progress[b[0]] || []
        const n = st.filter(Boolean).length
        return (
          <div className="card" style={{ marginTop: 10 }} key={b[0]}>
            <b>{b[0]}</b>
            <p className="s">{b[1]}</p>
            <div className="bar">
              <i style={{ width: (100 * n) / b[3].length + '%' }} />
            </div>
            <p className="s" style={{ marginTop: 4 }}>
              {n} of {b[3].length} steps done{active[b[0]] ? ' · Active' : ''}
            </p>
            <button className="cta" style={{ marginTop: 10, padding: 11 }} onClick={() => onGuide(i)}>
              {n ? 'Continue guide' : 'Install guide'}
            </button>
          </div>
        )
      })}
    </Sheet>
  )
}
