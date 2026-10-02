import { useState } from 'react'
import Sheet, { CloseButton } from '../components/Sheet'
import { TRIGGERS } from '../lib/constants'

export default function UrgeStrengthSheet({ level, onClose, onNext }) {
  const [lvl, setLvl] = useState(level)
  const [trig, setTrig] = useState([])

  function toggle(t) {
    setTrig((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))
  }

  return (
    <Sheet>
      <CloseButton onClose={onClose} />
      <h1>How strong is it?</h1>
      <div className="big" style={{ color: 'var(--urge)' }}>
        {lvl}
      </div>
      <p className="s" style={{ textAlign: 'center' }}>
        out of 10
      </p>
      <input type="range" min="1" max="10" value={lvl} aria-label="Urge intensity" onChange={(e) => setLvl(+e.target.value)} />
      <h2>What set it off? (optional)</h2>
      <div>
        {TRIGGERS.map((t) => (
          <button key={t} className="chip" aria-pressed={trig.includes(t)} onClick={() => toggle(t)}>
            {t}
          </button>
        ))}
      </div>
      <button className="cta" style={{ marginTop: 'auto' }} onClick={() => onNext(lvl, trig)}>
        Help me through this urge
      </button>
    </Sheet>
  )
}
