import Sheet, { CloseButton } from '../components/Sheet'
import { CallButton, CountrySelect } from '../components/ui'
import { crisisEntry } from '../lib/helpers'

export default function CrisisSheet({ country, onCountry, onClose }) {
  const c = crisisEntry(country)
  return (
    <Sheet>
      <CloseButton onClose={onClose} />
      <h1>Crisis and emergency</h1>
      <p className="s" style={{ margin: '6px 0 12px' }}>
        If you are in danger right now, call emergency first.
      </p>
      <CountrySelect value={country} onChange={onCountry} />
      {c[1].map((r) => (
        <div className="card" style={{ marginTop: 10 }} key={r[0]}>
          <b>{r[0]}</b>
          <CallButton number={r[1]} display={r[2]} />
        </div>
      ))}
      {c[2] ? <p className="s" style={{ marginTop: 12 }}>{c[2]}</p> : null}
      <p className="s" style={{ marginTop: 12 }}>
        Numbers can change. Check they still work where you are.
      </p>
    </Sheet>
  )
}
