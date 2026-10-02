import Sheet from '../components/Sheet'

export default function BreatheSheet({ onCalmer }) {
  return (
    <Sheet>
      <h1 style={{ textAlign: 'center', marginTop: 30 }}>Breathe in as it grows, out as it shrinks</h1>
      <div className="ball" aria-hidden="true" />
      <button className="cta" style={{ marginTop: 'auto' }} onClick={onCalmer}>
        I feel a bit calmer
      </button>
    </Sheet>
  )
}
