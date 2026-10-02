import { useState } from 'react'
import Sheet from '../components/Sheet'

export default function CheckinSheet({ startLevel, onSave, onRelapse }) {
  const initial = Math.max(1, startLevel - 4)
  const [now, setNow] = useState(initial)

  return (
    <Sheet>
      <h1>How strong is the urge now?</h1>
      <div className="big">{now}</div>
      <p className="s" style={{ textAlign: 'center' }}>
        was {startLevel} when you started
      </p>
      <input
        type="range"
        min="1"
        max="10"
        value={now}
        aria-label="Urge intensity now"
        onChange={(e) => setNow(+e.target.value)}
      />
      <button className="cta" style={{ marginTop: 'auto' }} onClick={() => onSave(now)}>
        Save to my recovery
      </button>
      <button className="ghost" onClick={onRelapse}>
        I gambled
      </button>
    </Sheet>
  )
}
