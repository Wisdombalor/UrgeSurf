import Sheet from '../components/Sheet'

export default function AfterRelapseSheet({ onOpenBlockers, onOpenTrusted, onOpenCrisis, onGoRecovery }) {
  return (
    <Sheet>
      <h1>What would help right now?</h1>
      <button className="card opt" style={{ marginTop: 14 }} onClick={onOpenBlockers}>
        <b>Turn on a blocker</b>
        <span>Step-by-step install guides</span>
      </button>
      <button className="card opt" onClick={onOpenTrusted}>
        <b>Reach out to someone</b>
        <span>Your trusted people</span>
      </button>
      <button className="card opt" onClick={onOpenCrisis}>
        <b>Crisis numbers</b>
        <span>If you feel unsafe</span>
      </button>
      <button className="cta" style={{ marginTop: 'auto' }} onClick={onGoRecovery}>
        Go to my recovery
      </button>
    </Sheet>
  )
}
