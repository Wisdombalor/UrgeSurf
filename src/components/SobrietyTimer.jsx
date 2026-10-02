import { useEffect, useState } from 'react'
import { fmt, soberElapsed } from '../lib/helpers'

function pad(n) {
  return String(n).padStart(2, '0')
}

export default function SobrietyTimer({ data, compact = false }) {
  const [, setTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const e = soberElapsed(data)

  if (!data.since) {
    return (
      <div className="card" style={{ marginTop: 14, textAlign: 'center' }}>
        <div className="big" style={{ fontSize: 64, margin: 0 }}>0</div>
        <p className="s">No sober date set yet. Set one in your profile to start the timer.</p>
      </div>
    )
  }

  if (compact) {
    return (
      <p className="s" style={{ fontVariantNumeric: 'tabular-nums' }}>
        {e.days}d : {pad(e.hours)}h : {pad(e.mins)}m : {pad(e.secs)}s sober since {fmt(data.since)}
      </p>
    )
  }

  return (
    <div className="card" style={{ marginTop: 14, textAlign: 'center' }}>
      <div className="big" style={{ fontSize: 64, margin: 0 }}>{e.days}</div>
      <p className="s">{e.days === 1 ? 'day' : 'days'} sober · since {fmt(data.since)}</p>
      <div className="timer-grid" role="timer" aria-label={`${e.days} days, ${e.hours} hours, ${e.mins} minutes sober`}>
        <div className="timer-cell"><b>{e.days}</b><span>days</span></div>
        <div className="timer-cell"><b>{pad(e.hours)}</b><span>hours</span></div>
        <div className="timer-cell"><b>{pad(e.mins)}</b><span>mins</span></div>
        <div className="timer-cell"><b>{pad(e.secs)}</b><span>secs</span></div>
      </div>
    </div>
  )
}
