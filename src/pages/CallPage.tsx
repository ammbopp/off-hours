import { useState } from 'react'
import { Link } from 'react-router-dom'
import { characters } from '../features/chat/characters'
import { avatarClass, initials } from '../lib/avatar'
import { MoonIcon, PhoneIcon } from '../components/icons'
import type { CharacterRelation } from '../types'

const RELATION_LABEL: Record<CharacterRelation, string> = {
  coworker: 'เพื่อนร่วมงาน',
  bestfriend: 'เพื่อนสนิท',
  partner: 'แฟน',
}

// คุยสดด้วยเสียงต้องต่อระบบเสียงเรียลไทม์ (server/realtime-token.ts) ก่อน — ต้นทุนต่อนาทีสูงสุดในแอป
// จึงยังไม่เปิดใช้งานจริง หน้านี้บอกตรงๆ ว่ายังทำไม่ได้แทนที่จะปั้น UI คุยสดปลอมๆ ขึ้นมา
export function CallPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <div className="page">
      <div className="hero">
        <div className="hero-blob" aria-hidden />
        <span className="eyebrow home-eyebrow">
          <MoonIcon size={14} />
          คุยสดด้วยเสียง
        </span>
        <h1>โทร</h1>
        <p className="home-hero-sub">ฟีเจอร์นี้ยังอยู่ระหว่างพัฒนา — ระหว่างนี้ทักแชทหรืออ่านตอนต่อไปก่อนได้</p>
      </div>

      {characters.map((c) => {
        const expanded = expandedId === c.id
        return (
          <div key={c.id} className="call-character-card">
            <div className="call-avatar-glow" aria-hidden>
              <span className={`${avatarClass(c.relation)} call-avatar`}>{initials(c.name)}</span>
            </div>
            <h3>{c.name}</h3>
            <p className="card-label">
              {RELATION_LABEL[c.relation]} · สำเนียง {c.accent}
            </p>
            <button
              className="button button-outline call-status-btn"
              onClick={() => setExpandedId(expanded ? null : c.id)}
              aria-expanded={expanded}
            >
              <PhoneIcon size={16} />
              ยังโทรไม่ได้ตอนนี้
            </button>
            {expanded && (
              <div className="call-status-note">
                <p>คุยสดด้วยเสียงต้องต่อระบบเสียงเรียลไทม์ก่อนถึงจะใช้งานได้จริง กำลังพัฒนาอยู่</p>
                <Link to={`/chat/${c.id}`} className="call-status-link">
                  ทักแชทกับ {c.name} แทนไปก่อน →
                </Link>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
