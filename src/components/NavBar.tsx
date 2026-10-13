import { NavLink } from 'react-router-dom'
import { ChatIcon, HomeIcon, PhoneIcon, SettingsIcon, VocabIcon } from './icons'
import './NavBar.css'

// 5 แท็บตามระบบนำทางของดีไซน์อ้างอิง (Story/Chat/Calls/Library/Settings) — ตัด "อ่าน" และ "ภารกิจ"
// ออกจากแท็บถาวร เพราะมีทางเข้าอยู่แล้วจากหน้าแรก (รายการตอน) และท้ายตอนอ่าน (ปุ่ม "ทำภารกิจท้ายตอน")
// ตามลำดับ ไม่จำเป็นต้องมีที่นั่งถาวรในแถบนำทางล่าง
const tabs = [
  { to: '/', label: 'หน้าแรก', Icon: HomeIcon },
  { to: '/chat', label: 'แชท', Icon: ChatIcon },
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
