import { NavLink } from 'react-router-dom'
import { BookIcon, ChatIcon, HomeIcon, PhoneIcon, QuestIcon, SettingsIcon, VocabIcon } from './icons'
import './NavBar.css'

const tabs = [
  { to: '/', label: 'หน้าแรก', Icon: HomeIcon },
  { to: '/read', label: 'อ่าน', Icon: BookIcon },
  { to: '/chat', label: 'แชท', Icon: ChatIcon },
  { to: '/quest', label: 'ภารกิจ', Icon: QuestIcon },
  { to: '/vocab', label: 'คำศัพท์', Icon: VocabIcon },
  { to: '/call', label: 'โทร', Icon: PhoneIcon },
  { to: '/settings', label: 'ตั้งค่า', Icon: SettingsIcon },
]

export function NavBar() {
  return (
    <nav className="nav-bar">
      <div className="nav-bar-inner">
        {tabs.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => (isActive ? 'nav-tab nav-tab-active' : 'nav-tab')}
            end={to === '/'}
          >
            <span className="nav-tab-icon">
              <Icon size={21} />
            </span>
            <span className="nav-tab-label">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
