import { useEffect, useState } from 'react'
import { getAllWords } from '../lib/db'
import type { Word, WordStatus } from '../types'

const COLUMNS: { status: WordStatus; label: string }[] = [
  { status: 'mastered', label: 'ใช้เป็น' },
  { status: 'remembered', label: 'จำได้' },
  { status: 'seen', label: 'เคยเห็น' },
  { status: 'new', label: 'ใหม่' },
]

const MAX_SHOWN_PER_COLUMN = 60

export function VocabBookPage() {
  const [words, setWords] = useState<Word[]>([])

  useEffect(() => {
    getAllWords().then(setWords)
  }, [])

  // NGSL คือฐาน "คำที่ถือว่ารู้แล้ว" ใช้คุมระดับภาษาของเนื้อเรื่อง ไม่ใช่คำที่ตอนเลือกมาสอน
  // (ดู README หัวข้อ "ระบบคำศัพท์เบื้องหลัง") จึงแยกออกจากคำเป้าหมาย TSL/BSL/custom ในหน้านี้
  const targetable = words.filter((w) => w.source !== 'NGSL')
  const baselineCount = words.length - targetable.length

  return (
    <div className="page">
      <h1>สมุดคำศัพท์</h1>
      {words.length === 0 && <p>ยังไม่มีคำในคลัง — รัน npm run wordlists:import ก่อน</p>}

      {baselineCount > 0 && (
        <p className="card-label">
          คำพื้นฐาน NGSL {baselineCount.toLocaleString()} คำ ถือว่ารู้แล้ว ใช้คุมระดับภาษาของเนื้อเรื่อง ไม่แสดงในสมุดนี้
        </p>
      )}

      {COLUMNS.map((col) => {
        const items = targetable.filter((w) => w.status === col.status)
        if (items.length === 0) return null
        const shown = items.slice(0, MAX_SHOWN_PER_COLUMN)
        return (
          <section key={col.status}>
            <h3>
              {col.label} ({items.length})
            </h3>
            <ul className="vocab-list">
              {shown.map((w) => (
                <li key={w.id}>
                  {w.term} <span className="list-row-sub">[{w.source}]</span>
                </li>
              ))}
            </ul>
            {items.length > MAX_SHOWN_PER_COLUMN && (
              <p className="card-label">และอีก {items.length - MAX_SHOWN_PER_COLUMN} คำ</p>
            )}
          </section>
        )
      })}
    </div>
  )
}
