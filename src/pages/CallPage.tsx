import { characters } from '../features/chat/characters'
import { initials } from '../lib/avatar'
import { PhoneIcon } from '../components/icons'

// เว็บแอปทำให้เครื่องดังเหมือนสายจริงไม่ได้ จึงแสดงเป็น "สายที่ไม่ได้รับ" แทน (ดู README หัวข้อการโทร)
// TODO: ต่อ server/realtime-token.ts และ Screen Wake Lock ก่อนเปิดใช้จริง — ต้นทุนต่อนาทีสูงสุดในแอป
export function CallPage() {
  return (
    <div className="page">
      <h1>โทร</h1>
      {characters.map((c) => (
        <div key={c.id} className="card call-card">
          <span className="avatar" aria-hidden>
            {initials(c.name)}
          </span>
          <div className="call-card-info">
            <p className="card-label">สายที่ไม่ได้รับ</p>
            <h3>{c.name}</h3>
          </div>
          <button
            className="button call-card-button"
            onClick={() => alert('ยังไม่ต่อระบบโทรสด — ดู server/realtime-token.ts')}
            aria-label={`โทรกลับหา ${c.name}`}
          >
            <PhoneIcon size={18} />
          </button>
        </div>
      ))}
    </div>
  )
}
