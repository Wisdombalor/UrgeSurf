import { countryName } from '../lib/helpers'
import { HelpCard } from '../components/ui'
import Icon from '../components/Icon'

export default function Support({ data, onOpenBlockers, onOpenTalk, onOpenTrusted, onOpenCrisis, onContactAdmin }) {
  const rows = [
    ['Protect Me', 'Gambling blockers and self-exclusion', 'shield', onOpenBlockers],
    ['Talk to someone', 'Helplines and in-house support', 'chat', onOpenTalk],
    [
      'My trusted people',
      data.contacts.length ? data.contacts.length + ' added' : 'Add someone you can call',
      'users',
      onOpenTrusted,
    ],
    ['Crisis and emergency', 'Numbers for ' + countryName(data.country), 'alert', onOpenCrisis],
    ['Improve this app', 'Contact the admin with ideas or bugs', 'bulb', onContactAdmin],
  ]
  return (
    <div>
      <h1>Support</h1>
      <p className="s">Tools and people, all in one place.</p>
      <div className="duo">
        <div className="card list" style={{ marginTop: 14 }}>
          {rows.map(([title, sub, icon, fn]) => (
            <button key={title} onClick={fn}>
              <span className="row-ic">
                <Icon name={icon} size={20} />
              </span>
              <span style={{ flex: 1 }}>
                {title}
                <small>{sub}</small>
              </span>
              <span style={{ color: 'var(--mut)' }}>
                <Icon name="chevR" size={20} />
              </span>
            </button>
          ))}
        </div>
        <div>
          <p className="s" style={{ marginTop: 14 }}>
            This app supports recovery. It is not a medical or emergency service.
          </p>
          <HelpCard country={data.country} onOpenCrisis={onOpenCrisis} />
        </div>
      </div>
    </div>
  )
}
