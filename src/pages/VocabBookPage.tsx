import { useEffect, useMemo, useState } from 'react'
import { getAllEpisodes, getAllWords, putWord } from '../lib/db'
import { recordEncounter } from '../lib/srs'
import { speak } from '../lib/speech'
import { ClockIcon, MoonIcon, SparkleIcon, SpeakerIcon } from '../components/icons'
import type { Episode, Word, WordStatus } from '../types'

const COLUMNS: { status: WordStatus; label: string; desc: string }[] = [
  { status: 'mastered', label: 'ใช้เป็น', desc: 'พูดหรือพิมพ์เองได้แล้ว' },
  { status: 'remembered', label: 'จำได้', desc: 'จำความหมายได้เอง' },
  { status: 'seen', label: 'เคยเห็น', desc: 'คุ้นตาจากบริบท' },
  { status: 'new', label: 'ใหม่', desc: 'เพิ่งเจอในตอน' },
]

const STATUS_LABEL: Record<WordStatus, string> = {
  mastered: 'ใช้เป็น',
  remembered: 'จำได้',
  seen: 'เคยเห็น',
  new: 'ใหม่',
}

const DUE_WORDS_SHOWN = 8
const MAX_SHOWN_PER_COLUMN = 60
const MAX_SEARCH_RESULTS = 80

export function VocabBookPage() {
  const [words, setWords] = useState<Word[]>([])
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [query, setQuery] = useState('')

  useEffect(() => {
    getAllWords().then(setWords)
    getAllEpisodes().then(setEpisodes)
  }, [])

  // NGSL คือฐาน "คำที่ถือว่ารู้แล้ว" ใช้คุมระดับภาษาของเนื้อเรื่อง ไม่ใช่คำที่ตอนเลือกมาสอน
  // (ดู README หัวข้อ "ระบบคำศัพท์เบื้องหลัง") จึงแยกออกจากคำเป้าหมาย TSL/BSL/custom ในหน้านี้
  const targetable = words.filter((w) => !w.sources.includes('NGSL'))
  const baselineCount = words.length - targetable.length

  // ตัวอย่างประโยค+คำแปลตามบริบท มีเฉพาะคำที่เคยเป็นคำเป้าหมายของตอนใดตอนหนึ่ง (เก็บไว้ที่ episode ไม่ใช่ word)
  // สร้างดัชนีย้อนกลับ wordId → {ตอน, คำแปล} ไว้โชว์ "เจอคำนี้ที่ไหน" แบบมีบริบทจริง ไม่ปั้นตัวอย่างขึ้นมาเอง
  const contextByWordId = useMemo(() => {
    const map = new Map<string, { episode: Episode; th: string; example: string }>()
    for (const ep of episodes) {
      for (const [wordId, translation] of Object.entries(ep.contextualTranslations)) {
        if (!map.has(wordId)) map.set(wordId, { episode: ep, th: translation.th, example: translation.exampleSentence })
      }
    }
    return map
  }, [episodes])

  const stageCounts = COLUMNS.map((col) => ({ ...col, count: targetable.filter((w) => w.status === col.status).length }))
  const stageTotal = targetable.length

  const dueWords = useMemo(() => {
    const now = new Date().toISOString()
    return targetable
      .filter((w) => w.nextReviewAt !== null && w.nextReviewAt <= now)
      .sort((a, b) => (a.nextReviewAt ?? '').localeCompare(b.nextReviewAt ?? ''))
  }, [targetable])

  async function handleListen(word: Word) {
    speak(word.term)
    const updated = recordEncounter(word, { mode: 'read', at: new Date().toISOString(), result: 'looked_up' })
    await putWord(updated)
    setWords((prev) => prev.map((w) => (w.id === updated.id ? updated : w)))
  }

  function handleListenAllDue() {
    speak(dueWords.map((w) => w.term).join('. '))
  }

  const normalizedQuery = query.trim().toLowerCase()
  const searchResults = useMemo(() => {
    if (!normalizedQuery) return null
    return words
      .filter((w) => w.term.includes(normalizedQuery) || w.forms.some((f) => f.includes(normalizedQuery)))
      .slice(0, MAX_SEARCH_RESULTS)
  }, [words, normalizedQuery])

  function renderWordRow(w: Word) {
    const context = contextByWordId.get(w.id)
    return (
      <li key={w.id} className="vocab-word-card">
        <div className="vocab-word-top">
          <div className="vocab-word-main">
            <strong>{w.term}</strong>
            {w.definition && <span className="vocab-definition">{w.definition}</span>}
          </div>
          <button className="vocab-word-speak" onClick={() => handleListen(w)} aria-label={`ฟังเสียงคำ ${w.term}`}>
            <SpeakerIcon size={16} />
          </button>
        </div>
        <div className="vocab-word-badges">
          <span className="vocab-badge">{w.sources.join(' · ')}</span>
          <span className={`vocab-badge vocab-badge-status vocab-badge-${w.status}`}>
            <span className={`status-dot status-dot-${w.status}`} />
            {STATUS_LABEL[w.status]}
          </span>
        </div>
        {context && (
          <div className="vocab-context-quote">
            <p>"{context.example}"</p>
            <span className="vocab-context-source">
              {context.th} · จาก{context.episode.title}
            </span>
          </div>
        )}
      </li>
    )
  }

  return (
    <div className="page">
      <div className="hero">
        <div className="hero-blob" aria-hidden />
        <span className="eyebrow home-eyebrow">
          <MoonIcon size={14} />
          สมุดคำศัพท์ยามค่ำคืน
        </span>
        <h1>สมุดคำศัพท์</h1>
        <p className="home-hero-sub">คำที่เจอจากการอ่านนิยายและบทสนทนา เก็บไว้ให้ทบทวนตามจังหวะของตัวเอง ไม่มีตารางคะแนนหรือตัวจับเวลา</p>
      </div>

      {words.length === 0 && <p className="card-label">ยังไม่มีคำในคลัง — รัน npm run wordlists:import ก่อน</p>}

      {words.length > 0 && (
        <input
          className="vocab-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ค้นหาคำ..."
        />
      )}

      {!searchResults && stageTotal > 0 && (
        <div className="vocab-mastery-card">
          <div className="vocab-mastery-header">
            <span className="eyebrow vocab-mastery-eyebrow">
              <SparkleIcon size={14} />
              การซึมซับตามธรรมชาติ
            </span>
            <span className="vocab-mastery-tag">ไม่มีการเร่งรัด</span>
          </div>
          <div className="vocab-mastery-bar">
            {stageCounts
              .slice()
              .reverse()
              .map((s) => (
                <div
                  key={s.status}
                  className={`vocab-mastery-segment status-dot-${s.status}`}
                  style={{ width: `${(s.count / stageTotal) * 100}%` }}
                  title={`${s.label}: ${s.count}`}
                />
              ))}
          </div>
          <div className="vocab-mastery-legend">
            {stageCounts
              .slice()
              .reverse()
              .map((s, i) => (
                <div key={s.status} className="vocab-mastery-legend-item">
                  <span className={`status-dot status-dot-${s.status}`} />
                  <span className="vocab-mastery-legend-text">
                    <strong>
                      {i + 1}. {s.label} ({s.count})
                    </strong>
                    <span>{s.desc}</span>
                  </span>
                </div>
              ))}
          </div>
          <p className="vocab-mastery-footer">
            <ClockIcon size={14} />
            ไม่มีการทำแบบทดสอบทวนคำ คำจะโผล่มาเองในตอนถัดไปและบทสนทนา
          </p>
        </div>
      )}

      {!searchResults && dueWords.length > 0 && (
        <section className="vocab-loop-section">
          <div className="vocab-loop-header">
            <h3>คืนนี้ชวนทบทวน</h3>
            <button className="vocab-loop-listen-all" onClick={handleListenAllDue}>
              ฟังทั้งหมด
            </button>
          </div>
          <p className="card-label">{dueWords.length} คำที่ถึงเวลาทบทวนแล้ว</p>
          <ul className="vocab-list">{dueWords.slice(0, DUE_WORDS_SHOWN).map(renderWordRow)}</ul>
        </section>
      )}

      {searchResults ? (
        <section>
          <h3>
            ผลการค้นหา
            <span className="section-count">{searchResults.length}</span>
          </h3>
          {searchResults.length === 0 && <p className="card-label">ไม่พบคำที่ตรงกับ "{query}"</p>}
          <ul className="vocab-list">{searchResults.map(renderWordRow)}</ul>
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
                  <span className={`status-dot status-dot-${col.status}`} />
                  {col.label}
                  <span className="section-count">{items.length}</span>
                </h3>
                <ul className="vocab-list">{shown.map(renderWordRow)}</ul>
                {items.length > MAX_SHOWN_PER_COLUMN && (
                  <p className="card-label">และอีก {items.length - MAX_SHOWN_PER_COLUMN} คำ</p>
                )}
              </section>
            )
          })}
        </>
      )}

      {words.length > 0 && (
        <div className="vocab-tip-card">
          <SparkleIcon size={18} />
          <div>
            <strong>เก็บคำระหว่างอ่าน</strong>
            <p>แตะคำในนิยายหรือบทสนทนาเพื่อเก็บเข้าสมุดนี้ให้อัตโนมัติ ไม่ต้องพิมพ์เพิ่มเอง</p>
          </div>
        </div>
      )}
    </div>
  )
}
