import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllEpisodes, getAllProgress, getAllWords, getMessagesForCharacter, putEpisode, putWord } from '../lib/db'
import { pickTargetWords, recordEncounter } from '../lib/srs'
import { isTargetable } from '../lib/wordlists/import'
import { speak } from '../lib/speech'
import { generateEpisode } from '../features/story/generateEpisode'
import { parseText, estimateReadMinutes } from '../features/reading/text'
import { characters } from '../features/chat/characters'
import { BookIcon, ChevronRightIcon, ClockIcon, MoonIcon, SparkleIcon, SpeakerIcon, VocabIcon } from '../components/icons'
import { avatarClass, initials } from '../lib/avatar'
import type { Episode, Message, ReadingProgress, Word } from '../types'

const DUE_WORDS_SHOWN = 4

function greeting(): string {
  const hour = new Date().getHours()
  if (hour < 5) return 'ดึกแล้วนะ'
  if (hour < 11) return 'สวัสดีตอนเช้า'
  if (hour < 17) return 'สวัสดีตอนบ่าย'
  if (hour < 21) return 'สวัสดีตอนเย็น'
  return 'Off Hours แล้ว'
}

function timeLabel(): string {
  return new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
}

export function HomePage() {
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [words, setWords] = useState<Word[]>([])
  const [progress, setProgress] = useState<ReadingProgress[]>([])
  const [previews, setPreviews] = useState<Record<string, Message | undefined>>({})
  const [generating, setGenerating] = useState(false)
  const [generateError, setGenerateError] = useState<string | null>(null)
  const [justSpoken, setJustSpoken] = useState<string | null>(null)

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

  // ตอนที่จะชวนอ่านต่อ: ตอนที่อ่านค้างไว้ก่อน ไม่งั้นตอนแรกที่ยังไม่แตะเลย ไม่งั้น (อ่านครบแล้ว) ตอนล่าสุด
  const featured = useMemo(() => {
    const inProgress = episodes.find((ep) => {
      const p = progress.find((pr) => pr.episodeId === ep.id)
      return p && !p.finishedAt
    })
    if (inProgress) return { episode: inProgress, state: 'continue' as const }

    const notStarted = episodes.find((ep) => !progress.some((pr) => pr.episodeId === ep.id))
    if (notStarted) return { episode: notStarted, state: 'start' as const }

    const last = episodes.at(-1)
    return last ? { episode: last, state: 'reread' as const } : null
  }, [episodes, progress])

  const featuredTeaser = useMemo(() => {
    if (!featured) return ''
    return parseText(featured.episode.content).sentences[0]?.text ?? ''
  }, [featured])

  const featuredWords = useMemo(() => {
    if (!featured) return []
    return words.filter((w) => featured.episode.targetWordIds.includes(w.id))
  }, [featured, words])

  // คำที่ถึงรอบทวนแล้ว เอาเฉพาะคำเป้าหมาย (TSL/BSL) เหมือน pickTargetWords ไม่รวมคำพื้นฐาน NGSL
  const dueWords = useMemo(() => {
    const now = new Date().toISOString()
    return words
      .filter((w) => isTargetable(w) && w.nextReviewAt !== null && w.nextReviewAt <= now)
      .sort((a, b) => (a.nextReviewAt ?? '').localeCompare(b.nextReviewAt ?? ''))
      .slice(0, DUE_WORDS_SHOWN)
  }, [words])

  async function handleListenWord(word: Word) {
    speak(word.term)
    setJustSpoken(word.id)
    setTimeout(() => setJustSpoken((id) => (id === word.id ? null : id)), 600)
    const updated = recordEncounter(word, { mode: 'read', at: new Date().toISOString(), result: 'looked_up' })
    await putWord(updated)
    setWords((prev) => prev.map((w) => (w.id === updated.id ? updated : w)))
  }

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
        knownWords: words,
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
      <div className="home-greeting-card">
        <div className="hero-blob" aria-hidden />
        <span className="eyebrow home-eyebrow">
          <MoonIcon size={14} />
          {greeting()} · {timeLabel()}
        </span>
        <h1>Off Hours</h1>
        <p className="home-hero-sub">
          {featured
            ? 'เรื่องราวของคืนนี้เตรียมไว้ให้แล้ว พักจากงานแล้วมาอ่านต่อกันเถอะ'
            : 'ยังไม่มีตอนให้อ่าน — รัน npm run wordlists:import และดู src/data/episodes/'}
        </p>

        {featured && (
          <div className="home-meta-pills">
            <span className="home-meta-pill">
              <BookIcon size={14} />
              ตอนที่ {featured.episode.order} จาก {episodes.length}
            </span>
            <span className="home-meta-pill">
              <ClockIcon size={14} />
              อ่านช้าๆ {estimateReadMinutes(featured.episode.content)} นาที
            </span>
            <span className="home-meta-pill">
              <VocabIcon size={14} />
              คำเป้าหมาย {featured.episode.targetWordIds.length} คำ
            </span>
          </div>
        )}
      </div>

      {featured && episodes.length > 1 && (
        <div className="home-section-link-row">
          <a href="#episodes" className="home-section-link">
            ดูทุกตอน
            <ChevronRightIcon size={14} />
          </a>
        </div>
      )}

      {featured && (
        <div className="home-feature-card">
          <div className="home-feature-atmosphere" aria-hidden>
            {'speechSynthesis' in window && (
              <span className="home-feature-badge">
                <SpeakerIcon size={14} />
                มีเสียงบรรยาย
              </span>
            )}
          </div>
          <div className="home-feature-body">
            <span className="eyebrow home-feature-eyebrow">
              {featured.state === 'continue' && 'ตอนนี้กำลังอ่าน'}
              {featured.state === 'start' && 'พร้อมเริ่มตอนใหม่'}
              {featured.state === 'reread' && 'อ่านครบทุกตอนแล้ว'}
            </span>
            <h3 className="home-feature-title">{featured.episode.title}</h3>

            {featuredTeaser && <blockquote className="home-feature-quote">"{featuredTeaser}"</blockquote>}

            {featuredWords.length > 0 && (
              <div className="home-feature-words">
                {featuredWords.slice(0, 5).map((w) => (
                  <span key={w.id} className="home-feature-word-chip">
                    {w.term}
                  </span>
                ))}
              </div>
            )}

            <Link className="button home-feature-cta" to={`/read/${featured.episode.id}`}>
              {featured.state === 'continue' && 'อ่านต่อ'}
              {featured.state === 'start' && 'เริ่มอ่าน'}
              {featured.state === 'reread' && 'อ่านซ้ำตอนนี้'}
            </Link>
          </div>
        </div>
      )}

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
                <span className="list-row-title">
                  <strong>{c.name}</strong>
                  <span className="home-accent-badge">{c.accent}</span>
                </span>
                <span className="list-row-sub">{preview ? preview.content : 'ยังไม่มีข้อความ'}</span>
              </span>
              <ChevronRightIcon size={18} className="list-row-chevron" />
            </Link>
          )
        })}
      </section>

      {dueWords.length > 0 && (
        <section className="home-recall-card">
          <div className="home-recall-header">
            <div className="home-recall-header-main">
              <div className="home-recall-icon" aria-hidden>
                <SparkleIcon size={16} />
              </div>
              <div>
                <h4>ชวนทบทวนเบาๆ</h4>
                <p className="card-label">{dueWords.length} คำที่ถึงเวลาทบทวนแล้ว</p>
              </div>
            </div>
            <button className="home-recall-listen-all" onClick={() => speak(dueWords.map((w) => w.term).join('. '))}>
              ฟังทั้งหมด
            </button>
          </div>
          <div className="home-recall-grid">
            {dueWords.map((w) => (
              <div key={w.id} className="home-recall-word">
                <span className="home-recall-word-text">
                  <strong>{w.term}</strong>
                  {w.definition && <span className="home-recall-word-def">{w.definition}</span>}
                </span>
                <button
                  className={justSpoken === w.id ? 'home-recall-speak home-recall-speak-active' : 'home-recall-speak'}
                  onClick={() => handleListenWord(w)}
                  aria-label={`ฟังเสียงคำ ${w.term}`}
                >
                  <SpeakerIcon size={14} />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="home-calm-banner">
        <MoonIcon size={20} />
        <div>
          <strong>ไม่มีการเร่งรัด</strong>
          <p>อ่านได้ตามจังหวะของตัวเอง แตะคำไหนก็หยุดเสียงบรรยายให้ทันทีโดยไม่เสียตำแหน่งที่อ่านอยู่</p>
        </div>
      </div>

      <section id="episodes">
        <h3>
          ตอนทั้งหมด
          {episodes.length > 0 && <span className="section-count">{episodes.length}</span>}
        </h3>
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
