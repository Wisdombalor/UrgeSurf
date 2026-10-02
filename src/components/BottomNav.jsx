import { TABS } from '../lib/constants'
import Icon from './Icon'

const TAB_ICONS = { home: 'home', rec: 'chart', com: 'users', sup: 'buoy' }

export default function BottomNav({ tab, onChange }) {
  return (
    <nav>
      {TABS.map(([key, label]) => (
        <button
          key={key}
          data-t={key}
          className="tab"
          aria-current={tab === key ? 'page' : undefined}
          onClick={() => onChange(key)}
        >
          <span className="tab-ic">
            <Icon name={TAB_ICONS[key]} size={24} />
          </span>
          <span className="tab-label">{label}</span>
        </button>
      ))}
    </nav>
  )
}
