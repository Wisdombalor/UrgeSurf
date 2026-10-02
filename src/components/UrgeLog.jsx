import { formatUrgeTime } from '../lib/helpers'

export default function UrgeLog({ urges, onLogUrge }) {
  const sorted = [...(urges || [])].sort((a, b) => b.t - a.t)

  return (
    <div>
      <div className="row" style={{ alignItems: 'center', marginTop: 22 }}>
        <h2 style={{ margin: 0 }}>Urge log</h2>
        <button
          className="cta"
          style={{ marginTop: 0, padding: '10px 12px', fontSize: 14, flex: 'none', width: 'auto' }}
          onClick={onLogUrge}
        >
          Log an urge
        </button>
      </div>
      <div className="card" style={{ marginTop: 10 }}>
        {sorted.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <b>No urges logged yet</b>
            <p className="s" style={{ marginTop: 6 }}>
              When an urge hits, log it here. Your past logs will appear in this list.
            </p>
            <button className="cta" style={{ padding: 12 }} onClick={onLogUrge}>
              Log your first urge
            </button>
          </div>
        ) : (
          sorted.slice(0, 20).map((u) => (
            <div className="log-item" key={u.t + '-' + u.lvl}>
              <div className="m">{formatUrgeTime(u.t)}</div>
              <div>
                <b>Strength {u.lvl}/10</b>
                {u.now ? <span> → {u.now}/10 after</span> : <span> · saved without check-in</span>}
                {u.alt ? <span> · used an alternative</span> : null}
              </div>
              {(u.trig || []).length ? <div className="log-tags">Triggers: {u.trig.join(', ')}</div> : null}
            </div>
          ))
        )}
      </div>
      {sorted.length > 20 ? (
        <p className="s" style={{ marginTop: 8 }}>Showing the 20 most recent of {sorted.length} logged urges.</p>
      ) : null}
    </div>
  )
}
