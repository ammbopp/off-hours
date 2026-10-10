import { characters } from '../features/chat/characters'

// เว็บแอปทำให้เครื่องดังเหมือนสายจริงไม่ได้ จึงแสดงเป็น "สายที่ไม่ได้รับ" แทน (ดู README หัวข้อการโทร)
// TODO: ต่อ server/realtime-token.ts และ Screen Wake Lock ก่อนเปิดใช้จริง — ต้นทุนต่อนาทีสูงสุดในแอป
export function CallPage() {
  return (
    <div className="page">
      <h1>โทร</h1>
      {characters.map((c) => (
        <div key={c.id} className="card">
          <p className="card-label">สายที่ไม่ได้รับ</p>
          <h3>{c.name}</h3>
          <button className="button" onClick={() => alert('ยังไม่ต่อระบบโทรสด — ดู server/realtime-token.ts')}>
            โทรกลับ
          </button>
        </div>
      ))}
    </div>
  )
}
