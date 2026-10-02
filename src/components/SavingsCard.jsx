import { dsince, formatMoney, moneySaved } from '../lib/helpers'

export default function SavingsCard({ data, onEdit }) {
  const weekly = Number(data?.weeklySpend) || 0
  const currency = data?.currency || 'NGN'
  const days = dsince(data?.since)

  if (!weekly || weekly <= 0) {
    return (
      <div className="card" style={{ marginTop: 12 }}>
        <b>Money saved</b>
        <p className="s" style={{ margin: '4px 0 0' }}>
          Tell us your usual weekly gambling spend and we will show what sobriety is saving you.
        </p>
        <button className="cta" style={{ marginTop: 12, padding: '10px 14px', fontSize: 14 }} onClick={onEdit}>
          Set weekly spend
        </button>
      </div>
    )
  }

  return (
    <div className="card" style={{ marginTop: 12, borderColor: 'var(--acc)' }}>
      <span className="s">Money you have protected</span>
      <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em', marginTop: 2 }}>
        {formatMoney(moneySaved(data), currency)}
      </div>
      <p className="s" style={{ margin: '4px 0 0' }}>
        {formatMoney(weekly, currency)} / week × {days} day{days === 1 ? '' : 's'} sober
      </p>
      <button className="ghost" style={{ padding: '6px', textAlign: 'left' }} onClick={onEdit}>
        Edit spend or currency
      </button>
    </div>
  )
}
