import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllEpisodes, getAllProgress, getAllWords, getMessagesForCharacter, putEpisode } from '../lib/db'
import { pickTargetWords } from '../lib/srs'
import { generateEpisode } from '../features/story/generateEpisode'
import { characters } from '../features/chat/characters'
import { BookIcon, ChevronRightIcon, SparkleIcon } from '../components/icons'
import { avatarClass, initials } from '../lib/avatar'
import type { Episode, Message, ReadingProgress, Word } from '../types'

function greeting(): string {
  const hour = new Date().getHours()
  if (hour < 5) return 'ดึกแล้วนะ'
  if (hour < 11) return 'สวัสดีตอนเช้า'
  if (hour < 17) return 'สวัสดีตอนบ่าย'
  if (hour < 21) return 'สวัสดีตอนเย็น'
  return 'Off Hours แล้ว'
}

export function HomePage() {
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [words, setWords] = useState<Word[]>([])
  const [progress, setProgress] = useState<ReadingProgress[]>([])
  const [previews, setPreviews] = useState<Record<string, Message | undefined>>({})
  const [generating, setGenerating] = useState(false)
  const [generateError, setGenerateError] = useState<string | null>(null)

  useEffect(() => {
    getAllEpisodes().then(setEpisodes)
    getAllWords().then(setWords)
    getAllProgress().then(setProgress)
    Promise.all(
      characters.map(async (c) => {
        const messages = await getMessagesForCharacter(c.id)
        return [c.id, messages.at(-1)] as const
      }),
    ).then((pairs) => setPreviews(Object.fromEntries(pairs)))
  }, [])

  const masteredCount = words.filter((w) => w.status === 'mastered').length

  // TODO: ตอนนี้ยังเรียกไม่สำเร็จจนกว่าจะต่อผู้ให้บริการ AI จริง (ดู server/llm/generate-episode.ts)
  // ปุ่มนี้ต่อ pipeline ไว้ครบแล้ว (เลือกคำเป้าหมาย → เรียกสร้างตอน → บันทึก) รอแค่ปลายทางเท่านั้น
  async function handleGenerateNext() {
    setGenerating(true)
    setGenerateError(null)
    try {
      const targetWords = pickTargetWords(words, 10)
      const lastEpisode = episodes.at(-1)
      const newEpisode = await generateEpisode({
        episodeOrder: (lastEpisode?.order ?? 0) + 1,
        previousSummary: lastEpisode?.summary ?? null,
        targetWords,
      })
      await putEpisode(newEpisode)
      setEpisodes((prev) => [...prev, newEpisode])
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : 'สร้างตอนใหม่ไม่สำเร็จ')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="page">
      <div className="hero">
        <div className="hero-blob" aria-hidden />
        <span className="eyebrow">{greeting()}</span>
        <h1>Off Hours</h1>
      </div>

      <section>
        <h3>ตอนทั้งหมด</h3>
        {episodes.length === 0 && <p className="card-label">ยังไม่มีตอน — ต่อ features/story/generateEpisode เพื่อสร้างตอนแรก</p>}
        {episodes.map((ep) => {
          const episodeProgress = progress.find((p) => p.episodeId === ep.id)
          const finished = Boolean(episodeProgress?.finishedAt)
          const status = finished ? 'อ่านจบแล้ว' : episodeProgress ? 'กำลังอ่าน' : 'ยังไม่ได้อ่าน'
          return (
            <Link key={ep.id} to={`/read/${ep.id}`} className="list-row">
              <span className="avatar avatar-sm" aria-hidden>
                <BookIcon size={17} />
              </span>
              <span className="list-row-text">
                <strong>{ep.title}</strong>
                <span className="list-row-sub">
                  <span className={`status-dot status-dot-${finished ? 'mastered' : episodeProgress ? 'remembered' : 'new'}`} />
                  {status} · คำเป้าหมาย {ep.targetWordIds.length} คำ
                </span>
              </span>
              <ChevronRightIcon size={18} className="list-row-chevron" />
            </Link>
          )
        })}

        <button
          className="button button-outline generate-next"
          onClick={handleGenerateNext}
          disabled={generating || words.length === 0}
        >
          <SparkleIcon size={17} />
          {generating ? 'กำลังสร้างตอนใหม่...' : 'สร้างตอนต่อไป'}
        </button>
        {generateError && <p className="generate-error">{generateError}</p>}
      </section>

      <section>
        <h3>ข้อความใหม่</h3>
        {characters.map((c) => {
          const preview = previews[c.id]
          return (
            <Link key={c.id} to={`/chat/${c.id}`} className="list-row">
              <span className={`${avatarClass(c.relation)} avatar-sm`} aria-hidden>
                {initials(c.name)}
              </span>
              <span className="list-row-text">
                <strong>{c.name}</strong>
                <span className="list-row-sub">{preview ? preview.content : 'ยังไม่มีข้อความ'}</span>
              </span>
              <ChevronRightIcon size={18} className="list-row-chevron" />
            </Link>
          )
        })}
      </section>

      <section className="stats-row">
        <div className="stat-card">
          <span className="stats-number">{episodes.length}</span>
          <span className="stats-label">ตอนที่มี</span>
        </div>
        <div className="stat-card">
          <span className="stats-number">{words.length.toLocaleString()}</span>
          <span className="stats-label">คำในคลัง</span>
        </div>
        <div className="stat-card">
          <span className="stats-number">{masteredCount}</span>
          <span className="stats-label">คำที่ใช้เป็น</span>
        </div>
      </section>
    </div>
  )
}
