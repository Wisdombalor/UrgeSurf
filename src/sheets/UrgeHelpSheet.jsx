import Sheet from '../components/Sheet'
import Icon from '../components/Icon'
import { URGE_HELP_OPTIONS } from '../lib/constants'

const OPTION_ICONS = { breathe: 'wind', dist: 'play', com: 'users', call: 'phone', sup: 'shield' }

function OptionBody({ icon, title, sub }) {
  return (
    <span className="opt-in">
      <span className="row-ic">
        <Icon name={icon} size={22} />
      </span>
      <span className="opt-tx">
        <b>{title}</b>
        <span>{sub}</span>
      </span>
    </span>
  )
}

export default function UrgeHelpSheet({ contacts, onPick, onSaveOnly, onCall }) {
  return (
    <Sheet>
      <h1>You logged it. That takes effort.</h1>
      <p className="s" style={{ margin: '6px 0 18px' }}>
        Pick one thing to do right now.
      </p>
      {URGE_HELP_OPTIONS.map((o) => {
        if (o.key === 'call' && contacts?.length > 0) {
          const first = contacts[0]
          return (
            <a
              key={o.key}
              className="card opt"
              style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}
              href={'tel:' + first.p}
              onClick={() => onCall(first)}
            >
              <OptionBody icon="phone" title={o.title} sub={`${o.sub} — ${first.n} (${first.p})`} />
            </a>
          )
        }
        return (
          <button
            key={o.key}
            className="card opt"
            onClick={() => {
              if (o.key === 'call') {
                onCall(null)
                return
              }
              onPick(o.key)
            }}
          >
            <OptionBody icon={OPTION_ICONS[o.key]} title={o.title} sub={o.sub} />
          </button>
        )
      })}
      <button className="ghost" onClick={onSaveOnly}>
        Just save my log
      </button>
    </Sheet>
  )
}
