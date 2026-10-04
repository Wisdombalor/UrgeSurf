import Sheet, { CloseButton } from '../components/Sheet'
import { HelpCard } from '../components/ui'
import { mailtoLink } from '../lib/helpers'

export default function SupportWaitingSheet({ req, country, onClose, onClear, onOpenCrisis }) {
  if (!req) return null
  const tm = new Date(req.t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const sent = req.status === 'sent'

  return (
    <Sheet>
      <CloseButton onClose={onClose} />
      <h1>Support request</h1>
      <div className="card anim-in" style={{ marginTop: 12 }}>
        {sent ? (
          <>
            <b>Request sent ✓</b>
            <p className="s" style={{ marginTop: 6 }}>
              Sent to the UrgeSurf support team at {tm}. They will reply by {req.how}
              {req.how === 'email' ? ` at ${req.contact}` : ''}.
            </p>
            {req.how === 'email' ? (
              <p className="s" style={{ marginTop: 6 }}>
                We also emailed you a receipt at {req.contact}. Can&apos;t find it? Check spam or promotions — it comes
                from FormSubmit on our behalf.
              </p>
            ) : (
              <p className="s" style={{ marginTop: 6 }}>
                Tip: next time choose email if you want an automatic receipt in your inbox.
              </p>
            )}
            <p className="s" style={{ marginTop: 6 }}>
              We cannot promise how fast we would reply, so use the lines below if you need someone now.
            </p>
          </>
        ) : (
          <>
            <b>Not delivered yet</b>
            <p className="s" style={{ margin: '6px 0 10px' }}>
              {req.sendError || 'We could not send this automatically.'} The admin never got this request — nothing was
              emailed. Tap below to send it from your email app instead, then check that your inbox address is correct.
            </p>
            <a className="cta" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', margin: 0 }} href={mailtoLink(req)}>
              Send by email
            </a>
            <p className="s" style={{ marginTop: 8 }}>
              Still nothing in the admin inbox? The FormSubmit token may need activating, or the message landed in spam.
              See the README troubleshooting checklist.
            </p>
          </>
        )}
      </div>
      <HelpCard country={country} onOpenCrisis={onOpenCrisis} />
      <button className="ghost" onClick={onClear}>
        Clear request
      </button>
    </Sheet>
  )
}
