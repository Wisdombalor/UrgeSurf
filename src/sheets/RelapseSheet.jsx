import Sheet from '../components/Sheet'
import { dsince, longest } from '../lib/helpers'

export default function RelapseSheet({ data, onRestart, onNotNow }) {
  const c = dsince(data.since)
  return (
    <Sheet>
      <h1>Thank you for telling the truth.</h1>
      <p className="s" style={{ margin: '8px 0', lineHeight: 1.5 }}>
        It is okay. What matters is you are here today. Your {c} days, your best of {longest(data)} days and every
        urge you logged stay in your history. A new period starts today.
      </p>
      <button className="cta" style={{ marginTop: 'auto' }} onClick={onRestart}>
        Start a new period today
      </button>
      <button className="ghost" onClick={onNotNow}>
        Not now
      </button>
    </Sheet>
  )
}
