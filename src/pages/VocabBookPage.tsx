import { useEffect, useMemo, useState } from 'react'
import { getAllWords } from '../lib/db'
import type { Word, WordStatus } from '../types'

const COLUMNS: { status: WordStatus; label: string }[] = [
  { status: 'mastered', label: 'ใช้เป็น' },
  { status: 'remembered', label: 'จำได้' },
  { status: 'seen', label: 'เคยเห็น' },
  { status: 'new', label: 'ใหม่' },
]

const STATUS_LABEL: Record<WordStatus, string> = {
  mastered: 'ใช้เป็น',
  remembered: 'จำได้',
  seen: 'เคยเห็น',
  new: 'ใหม่',
}

const MAX_SHOWN_PER_COLUMN = 60
const MAX_SEARCH_RESULTS = 80

export function VocabBookPage() {
  const [words, setWords] = useState<Word[]>([])
  const [query, setQuery] = useState('')

  useEffect(() => {
    getAllWords().then(setWords)
  }, [])

  // NGSL คือฐาน "คำที่ถือว่ารู้แล้ว" ใช้คุมระดับภาษาของเนื้อเรื่อง ไม่ใช่คำที่ตอนเลือกมาสอน
  // (ดู README หัวข้อ "ระบบคำศัพท์เบื้องหลัง") จึงแยกออกจากคำเป้าหมาย TSL/BSL/custom ในหน้านี้
  const targetable = words.filter((w) => !w.sources.includes('NGSL'))
  const baselineCount = words.length - targetable.length

  // ค้นหาแล้วรวมทุกคลัง (รวม NGSL) เพราะผู้ใช้อาจจำคำจากเนื้อเรื่องมาแล้วอยากเปิดดูซ้ำ ไม่จำกัดแค่คำเป้าหมาย
  const normalizedQuery = query.trim().toLowerCase()
  const searchResults = useMemo(() => {
    if (!normalizedQuery) return null
    return words
      .filter((w) => w.term.includes(normalizedQuery) || w.forms.some((f) => f.includes(normalizedQuery)))
      .slice(0, MAX_SEARCH_RESULTS)
  }, [words, normalizedQuery])

  return (
    <div className="page">
      <h1>สมุดคำศัพท์</h1>
      {words.length === 0 && <p>ยังไม่มีคำในคลัง — รัน npm run wordlists:import ก่อน</p>}

      {words.length > 0 && (
        <input
          className="vocab-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ค้นหาคำ..."
        />
      )}

      {searchResults ? (
        <section>
          <h3>ผลการค้นหา ({searchResults.length})</h3>
          {searchResults.length === 0 && <p className="card-label">ไม่พบคำที่ตรงกับ "{query}"</p>}
          <ul className="vocab-list">
            {searchResults.map((w) => (
              <li key={w.id}>
                <strong>{w.term}</strong>{' '}
                <span className="list-row-sub">
                  [{w.sources.join('·')}] · {STATUS_LABEL[w.status]}
                </span>
                {w.definition && <p className="vocab-definition">{w.definition}</p>}
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <>
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
                      {w.term} <span className="list-row-sub">[{w.sources.join('·')}]</span>
                    </li>
                  ))}
                </ul>
                {items.length > MAX_SHOWN_PER_COLUMN && (
                  <p className="card-label">และอีก {items.length - MAX_SHOWN_PER_COLUMN} คำ</p>
                )}
              </section>
            )
          })}
        </>
      )}
    </div>
  )
}
