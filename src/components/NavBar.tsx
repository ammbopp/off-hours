import { NavLink } from 'react-router-dom'
import './NavBar.css'

const tabs = [
  { to: '/', label: 'หน้าแรก', icon: '🏠' },
  { to: '/read', label: 'อ่าน', icon: '📖' },
  { to: '/chat', label: 'แชท', icon: '💬' },
  { to: '/quest', label: 'ภารกิจ', icon: '📝' },
  { to: '/vocab', label: 'คำศัพท์', icon: '🗂️' },
  { to: '/call', label: 'โทร', icon: '📞' },
  { to: '/settings', label: 'ตั้งค่า', icon: '⚙️' },
]

export function NavBar() {
  return (
    <nav className="nav-bar">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) => (isActive ? 'nav-tab nav-tab-active' : 'nav-tab')}
          end={tab.to === '/'}
        >
          <span className="nav-tab-icon">{tab.icon}</span>
          <span className="nav-tab-label">{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
