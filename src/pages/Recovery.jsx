import { dsince, longest } from '../lib/helpers'
import SobrietyTimer from '../components/SobrietyTimer'
import SavingsCard from '../components/SavingsCard'
import UrgeLog from '../components/UrgeLog'

export default function Recovery({ data, onLogUrge, onResetStreak, onEditStreakDate }) {
  const d = dsince(data.since)
  const T = {}
  let drop = 0
  let dn = 0
  data.urges.forEach((u) => {
    ;(u.trig || []).forEach((t) => {
      T[t] = (T[t] || 0) + 1
    })
    if (u.alt && u.now) {
      drop += u.lvl - u.now
      dn++
    }
  })
  const ks = Object.keys(T)
    .sort((a, b) => T[b] - T[a])
    .slice(0, 4)
  const mx = ks.length ? T[ks[0]] : 1
  const per = data.periods.concat([{ days: d }])

  return (
    <div>
      <h1>My recovery</h1>
      <p className="s">Your progress is more than one number.</p>
      <SobrietyTimer data={data} />
      <button className="ghost" style={{ padding: '6px' }} onClick={onEditStreakDate}>
        Edit streak date
      </button>
      <button className="danger" onClick={onResetStreak}>
        Reset my streak
      </button>
      <SavingsCard data={data} onEdit={onEditStreakDate} />
      <div className="card" style={{ marginTop: 14 }}>
        <b>Recovery periods</b>
        <div className="tl">
          {per.map((p, i) => (
            <span key={i} style={{ display: 'contents' }}>
              <i style={{ flex: Math.max(1, p.days) }} />
              {i < per.length - 1 ? <i className="r" style={{ flex: 0.4 }} /> : null}
            </span>
          ))}
        </div>
        <p className="s" style={{ marginTop: 10 }}>
          {per.length} period{per.length > 1 ? 's' : ''}. A reset ends a period. It never erases the ones before it.
        </p>
      </div>
      <div className="row" style={{ marginTop: 12 }}>
        <div className="card stat">
          <b>{data.urges.length}</b>
          <span>urges logged</span>
        </div>
        <div className="card stat">
          <b>{longest(data)}</b>
          <span>longest period (days)</span>
        </div>
      </div>
      <h2>Common triggers</h2>
      <div className="card">
        {ks.length ? (
          ks.map((k) => (
            <div key={k} style={{ marginBottom: 12 }}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <span>{k}</span>
                <span className="s" style={{ textAlign: 'right' }}>
                  {T[k]}
                </span>
              </div>
              <div className="bar">
                <i style={{ width: Math.round((100 * T[k]) / mx) + '%' }} />
              </div>
            </div>
          ))
        ) : (
          <p className="s">Log an urge and pick what set it off. Your patterns will show here.</p>
        )}
      </div>
      {dn ? (
        <>
          <h2>What helped</h2>
          <div className="card">
            <p>On average your urges dropped by {(drop / dn).toFixed(1)} points after you chose an alternative.</p>
          </div>
        </>
      ) : null}
      <UrgeLog urges={data.urges} onLogUrge={onLogUrge} />
    </div>
  )
}
