import { ADMIN_TAB, TABS } from '../lib/constants'
import Icon from './Icon'

const TAB_ICONS = { home: 'home', rec: 'chart', com: 'users', sup: 'buoy', admin: 'shield' }

export default function BottomNav({ tab, onChange, showAdmin, account, onProfile, onAuth }) {
  const tabs = showAdmin ? [...TABS, ADMIN_TAB] : TABS
  const initial = (account?.name?.trim()?.[0] || '🙂').toUpperCase()
  return (
    <nav>
      {tabs.map(([key, label]) => (
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
      <div className="sidebar-foot" aria-label="Account">
        {account?.user ? (
          <button className="sidebar-user" onClick={onProfile}>
            {account.avatar ? (
              <img src={account.avatar} alt="" className="menu-avatar" />
            ) : (
              <div className="menu-avatar menu-avatar-fallback" aria-hidden="true">
                {initial}
              </div>
            )}
            <span className="menu-id-text">
              <b>{account.name || 'Your account'}</b>
              <span className="s">{account.email || 'Signed in'}</span>
            </span>
          </button>
        ) : (
          <div className="sidebar-auth">
            <button className="cta" onClick={() => onAuth('login')}>
              Log in
            </button>
            <button className="ghost" onClick={() => onAuth('signup')}>
              Sign up
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
