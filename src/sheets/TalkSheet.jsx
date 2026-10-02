import Sheet, { CloseButton } from '../components/Sheet'
import { GAMBLING_LINES } from '../lib/constants'
import { SupportLines } from '../components/ui'
import { crisisEntry, normalizeCountry } from '../lib/helpers'

export default function TalkSheet({ data, onClose, onOpenRequest, onOpenWaiting }) {
  const c = crisisEntry(data.country)
  const g = GAMBLING_LINES[normalizeCountry(data.country)] || []
  const hasOpen = data.req && data.req.status !== 'closed'

  return (
    <Sheet>
      <CloseButton onClose={onClose} />
      <h1>Talk to someone</h1>
      <button className="cta" onClick={hasOpen ? onOpenWaiting : onOpenRequest}>
        {hasOpen ? 'See my support request' : 'Request in-house support'}
      </button>
      <p className="s" style={{ marginTop: 6 }}>
        Tell us what is going on and the team replies by email or phone. Wait times vary. Use the lines below if you
        cannot wait.
      </p>
      <h2>Gambling support ({c[0]})</h2>
      {g.length ? (
        <SupportLines rows={g} />
      ) : (
        <p className="s">{c[2] || 'No verified national gambling line for this country.'}</p>
      )}
      <h2>Mental health support</h2>
      {c[1].length > 1 ? (
        <SupportLines rows={c[1].slice(1)} />
      ) : (
        <p className="s">{c[2]}</p>
      )}
      <p className="s" style={{ marginTop: 12 }}>
        Change country in Crisis and emergency. Numbers can change, so check they work.
      </p>
    </Sheet>
  )
}
