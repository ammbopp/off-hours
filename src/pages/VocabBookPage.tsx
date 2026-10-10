import { useEffect, useState } from 'react'
import { getAllWords } from '../lib/db'
import type { Word, WordStatus } from '../types'

const COLUMNS: { status: WordStatus; label: string }[] = [
  { status: 'new', label: 'ใหม่' },
  { status: 'seen', label: 'เคยเห็น' },
  { status: 'remembered', label: 'จำได้' },
  { status: 'mastered', label: 'ใช้เป็น' },
]

export function VocabBookPage() {
  const [words, setWords] = useState<Word[]>([])

  useEffect(() => {
    getAllWords().then(setWords)
  }, [])

  return (
    <div className="page">
      <h1>สมุดคำศัพท์</h1>
      {words.length === 0 && <p>ยังไม่มีคำในคลัง — นำเข้า NGSL/TSL/BSL ด้วย src/lib/wordlists/import.ts</p>}
      {COLUMNS.map((col) => {
        const items = words.filter((w) => w.status === col.status)
        if (items.length === 0) return null
        return (
          <section key={col.status}>
            <h3>
              {col.label} ({items.length})
            </h3>
            <ul className="vocab-list">
              {items.map((w) => (
                <li key={w.id}>
                  {w.term} <span className="list-row-sub">[{w.source}]</span>
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
