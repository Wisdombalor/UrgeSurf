import { useState } from 'react'
import Sheet, { CloseButton } from '../components/Sheet'
import { TRIGGERS } from '../lib/constants'

export default function UrgeStrengthSheet({ level, onClose, onNext }) {
  const [lvl, setLvl] = useState(level)
  const [trig, setTrig] = useState([])

  function toggle(t) {
    setTrig((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))
  }

  function labelFor(v) {
    if (v <= 3) return 'Mild'
    if (v <= 6) return 'Moderate'
    if (v <= 8) return 'Strong'
    return 'Overwhelming'
  }

  const pct = ((lvl - 1) / 9) * 100

  return (
    <Sheet>
      <CloseButton onClose={onClose} />
      <h1>How strong is it?</h1>
      <div className="big" style={{ color: 'var(--urge)' }}>
        {lvl}
      </div>
      <p className="s" style={{ textAlign: 'center' }}>
        out of 10 · {labelFor(lvl)}
      </p>
      <div className="urge-slider-wrap">
        <div className="urge-bubble" style={{ left: `calc(${pct}% + ${(0.5 - pct / 100) * 28}px)` }}>
          {labelFor(lvl)}
        </div>
        <input
          type="range"
          className="urge-slider"
          min="1"
          max="10"
          step="1"
          value={lvl}
          aria-label="Urge intensity"
          aria-valuetext={`${lvl} out of 10, ${labelFor(lvl)}`}
          onChange={(e) => setLvl(+e.target.value)}
          style={{ '--p': pct + '%' }}
        />
        <div className="urge-scale" aria-hidden="true">
          <span>Mild</span>
          <span>Overwhelming</span>
        </div>
      </div>
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
