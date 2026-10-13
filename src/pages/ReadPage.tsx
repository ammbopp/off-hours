import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { TappableText } from '../components/TappableText'
import { WordCard } from '../components/WordCard'
import { ReadingSettingsSheet } from '../components/ReadingSettingsSheet'
import { PauseIcon, PlayIcon } from '../components/icons'
import { getAllEpisodes, getAllWords, getProgress, getSettings, putSettings, putWord, updateProgress } from '../lib/db'
import { recordEncounter } from '../lib/srs'
import { makeBlankWord } from '../lib/wordlists/import'
import { buildWordIndex, lookupWord } from '../features/reading/lookup'
import { estimateReadMinutes, parseText, type ParsedSentence } from '../features/reading/text'
import { useNarration, type NarrationRate } from '../features/reading/useNarration'
import { DEFAULT_SETTINGS, type ContextualTranslation, type Episode, type Settings, type Word } from '../types'

interface SelectedWord {
  term: string
  word?: Word
  translation?: ContextualTranslation
  sentence: string
}

const RATES: NarrationRate[] = [0.75, 1, 1.25]

const READING_THEME_SWATCHES: { value: Settings['readingTheme']; color: string }[] = [
  { value: 'paper', color: '#f6efe1' },
  { value: 'sepia', color: '#f1e2c0' },
  { value: 'night', color: '#000000' },
]

export function ReadPage() {
  const { episodeId } = useParams<{ episodeId?: string }>()
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [words, setWords] = useState<Word[]>([])
  const [selected, setSelected] = useState<SelectedWord | null>(null)
  const [resumeIndex, setResumeIndex] = useState<number | null>(null)
  const [finished, setFinished] = useState(false)
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [showReaderSettings, setShowReaderSettings] = useState(false)
  const [progressPercent, setProgressPercent] = useState(0)

  const furthestSentenceRef = useRef(0)
  // แพทเทิร์นเดียวกับ SettingsPage: ปุ่มปรับหน้าตาใช้ผลทันที+บันทึกทันที ต้องอ่านค่าล่าสุดผ่าน ref
  // ตอนเซฟ ไม่ใช่จาก closure ตรงๆ เพราะกดสองปุ่มติดกันเร็วๆ อาจอยู่ในแบตช์ re-render เดียวกัน
  const settingsRef = useRef(settings)
  settingsRef.current = settings
  const loadedSettingsRef = useRef(false)

  useEffect(() => {
    getAllEpisodes().then(setEpisodes)
    getAllWords().then(setWords)
    getSettings().then((s) => {
      if (s) setSettings(s)
      loadedSettingsRef.current = true
    })
  }, [])

  // readingFont/readingTheme/readingFontSize มีผลแค่ในหน้าอ่าน (ผ่าน data-attribute บน .reader-page)
  // ไม่กระทบ <html> ทั้งแอป — คนละค่ากับ fontSize ของทั้งแอปด้านบน จึงบันทึกเฉยๆ ไม่ต้องเรียก applyPreferences
  const { readingFont, readingTheme, readingFontSize } = settings
  useEffect(() => {
    if (!loadedSettingsRef.current) return
    void putSettings(settingsRef.current)
  }, [readingFont, readingTheme, readingFontSize])

  const index = episodeId ? episodes.findIndex((e) => e.id === episodeId) : 0
  const episode = episodes[index === -1 ? 0 : index] ?? null
  const nextEpisode = episode ? episodes[episodes.findIndex((e) => e.id === episode.id) + 1] : undefined

  const parsed = useMemo(() => parseText(episode?.content ?? ''), [episode?.content])
  const wordIndex = useMemo(() => buildWordIndex(words), [words])

  const targetTerms = useMemo(() => {
    if (!episode) return new Set<string>()
    const terms = words
      .filter((w) => episode.targetWordIds.includes(w.id))
      .map((w) => w.term.toLowerCase())
    return new Set(terms)
  }, [episode, words])

  const estimatedMinutes = useMemo(() => (episode ? estimateReadMinutes(episode.content) : 0), [episode])

  // ไม่แตะ finishedAt ตรงนี้ ปล่อยให้ updateProgress รักษาค่าเดิมไว้
  // (เคยมีบั๊ก: callback ที่ค้างค่า finished เก่าไว้เขียนทับ finishedAt กลับเป็น null หลังกดอ่านจบ)
  const saveProgress = useCallback(
    (sentenceIndex: number) => {
      if (!episode) return
      furthestSentenceRef.current = Math.max(furthestSentenceRef.current, sentenceIndex)
      if (parsed.sentences.length > 0) {
        setProgressPercent(Math.min(100, Math.round(((furthestSentenceRef.current + 1) / parsed.sentences.length) * 100)))
      }
      void updateProgress(episode.id, { lastSentenceIndex: furthestSentenceRef.current })
    },
    [episode, parsed.sentences.length],
  )

  const narration = useNarration(parsed.sentences, {
    onSentenceStart: (i) => saveProgress(i),
    accent: settings.narratorAccent,
    initialRate: settings.narrationRate,
  })
  const { activeIndex, playing, rate, setRate, speakFrom, stop } = narration

  // ตั้งความเร็วตามค่าที่บันทึกไว้ครั้งเดียวตอนโหลด settings เสร็จ (initialRate ของ useNarration ใช้ได้
  // แค่ตอน mount แรกเท่านั้น เพราะตอนนั้น settings ยังเป็นค่า DEFAULT_SETTINGS อยู่ โหลดจริงเสร็จทีหลัง)
  // ส่วนการสลับเร็ว/ช้าระหว่างอ่าน (cycleRate ด้านล่าง) จะบันทึกทับค่านี้เองเมื่อผู้ใช้กด
  useEffect(() => {
    if (!loadedSettingsRef.current) return
    setRate(settingsRef.current.narrationRate)
  }, [settings.narrationRate, setRate])

  function cycleRate() {
    const next = RATES[(RATES.indexOf(rate) + 1) % RATES.length]
    setRate(next)
    setSettings((prev) => ({ ...prev, narrationRate: next }))
    void putSettings({ ...settingsRef.current, narrationRate: next })
  }

  // โหลดตำแหน่งที่อ่านค้างไว้ของตอนนี้
  // มี cancelled guard เพราะกด "ตอนต่อไป" ซ้ำเร็วๆ ได้ (คลิกเดียวก็ไปตอนถัดไปทันที คอมโพเนนต์ไม่ unmount
  // แค่เปลี่ยน episode) ถ้าตอนก่อนหน้ายัง getProgress ไม่เสร็จตอนสลับไปตอนใหม่ ผลที่เสร็จช้าจะมาเขียนทับ
  // resumeIndex/finished ของตอนใหม่ที่กำลังดูอยู่ด้วยข้อมูลของตอนเก่า
  useEffect(() => {
    if (!episode) return
    let cancelled = false
    furthestSentenceRef.current = 0
    setResumeIndex(null)
    setFinished(false)
    setProgressPercent(0)

    getProgress(episode.id).then((progress) => {
      if (cancelled || !progress) return
      furthestSentenceRef.current = progress.lastSentenceIndex
      setFinished(Boolean(progress.finishedAt))
      if (progress.lastSentenceIndex > 0) setResumeIndex(progress.lastSentenceIndex)
      if (parsed.sentences.length > 0) {
        setProgressPercent(Math.min(100, Math.round(((progress.lastSentenceIndex + 1) / parsed.sentences.length) * 100)))
      }
    })

    return () => {
      cancelled = true
    }
  }, [episode, parsed.sentences.length])

  // หยุดเสียงเมื่อเปลี่ยนตอน
  useEffect(() => {
    stop()
  }, [episode?.id, stop])

  // เลื่อนตามประโยคที่เสียงกำลังอ่าน
  useEffect(() => {
    if (activeIndex === null) return
    document.getElementById(`sentence-${activeIndex}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [activeIndex])

  // จำว่าอ่านถึงประโยคไหนจากการเลื่อนจอ เพื่อเปิดอ่านต่อครั้งหน้าได้ และอัปเดตแถบความคืบหน้า
  useEffect(() => {
    if (!episode || parsed.sentences.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const sentenceIndex = Number((entry.target as HTMLElement).dataset.sentence)
          if (Number.isFinite(sentenceIndex)) {
            furthestSentenceRef.current = Math.max(furthestSentenceRef.current, sentenceIndex)
            setProgressPercent(Math.min(100, Math.round(((sentenceIndex + 1) / parsed.sentences.length) * 100)))
          }
        }
      },
      { rootMargin: '-45% 0px -45% 0px' },
    )

    for (const sentence of parsed.sentences) {
      const element = document.getElementById(`sentence-${sentence.index}`)
      if (element) observer.observe(element)
    }

    return () => {
      observer.disconnect()
      saveProgress(furthestSentenceRef.current)
    }
  }, [episode, parsed.sentences, saveProgress])

  async function handleWordTap(term: string, sentence: ParsedSentence) {
    if (!episode) return

    // หยุดเสียงบรรยายก่อนเปิดการ์ดคำ — WordCard มีปุ่มฟังเสียงของตัวเองที่เรียก speechSynthesis.cancel()
    // ตรงๆ ถ้าเสียงบรรยายกำลังเล่นอยู่ จะไปแย่งเล่นพร้อมกัน และพฤติกรรมหลัง cancel() ก็ไม่แน่นอนข้ามเบราว์เซอร์
    // (บางตัวยิง 'onend' แทน 'onerror' ทำให้ตัวอ่านของเราเข้าใจผิดว่าประโยคจบแล้วแล้วเล่นประโยคถัดไปต่อทันที
    // ซ้อนกับเสียงจากการ์ดคำ) เรียก stop() ของเราเองไว้ก่อนให้ผลลัพธ์แน่นอนไม่ว่าเบราว์เซอร์จะส่ง event แบบไหน
    if (playing) stop()

    const found = lookupWord(wordIndex, term)
    const word = found ?? makeBlankWord(term, ['custom'])

    const updated = recordEncounter(word, {
      mode: 'read',
      episodeId: episode.id,
      at: new Date().toISOString(),
      result: 'looked_up',
    })
    await putWord(updated)
    setWords((prev) => [...prev.filter((w) => w.id !== updated.id), updated])

    setSelected({
      term,
      word: updated,
      translation: episode.contextualTranslations[updated.id],
      sentence: sentence.text,
    })
  }

  async function finishEpisode() {
    if (!episode) return
    setFinished(true)
    furthestSentenceRef.current = Math.max(furthestSentenceRef.current, parsed.sentences.length - 1)
    setProgressPercent(100)
    await updateProgress(episode.id, {
      lastSentenceIndex: furthestSentenceRef.current,
      finishedAt: new Date().toISOString(),
    })
  }

  if (!episode) {
    return (
      <div className="page">
        <p>ยังไม่มีตอนให้อ่าน — รัน npm run wordlists:import และดู src/data/episodes/</p>
      </div>
    )
  }

  return (
    <div className="page reader-page-outer">
      <div className="reader-progress-track">
        <div className="reader-progress-fill" style={{ width: `${progressPercent}%` }} />
      </div>

      <div className="reader-toolbar-row">
        <div className="reader-eyebrow-block">
          <span className="eyebrow reader-eyebrow">
            <span className="reader-eyebrow-dot" />
            ตอนที่ {episode.order}
          </span>
        </div>
        <button className="reader-aa-pill" onClick={() => setShowReaderSettings(true)} aria-label="ตัวอักษรและพื้นหลัง">
          <span className="reader-aa-label">Aa</span>
          <span className="reader-aa-swatches">
            {READING_THEME_SWATCHES.map((s) => (
              <span key={s.value} className="reader-aa-swatch" style={{ background: s.color }} />
            ))}
          </span>
        </button>
      </div>

      {resumeIndex !== null && !playing && (
        <button
          className="button button-outline reader-resume"
          onClick={() => {
            document
              .getElementById(`sentence-${resumeIndex}`)
              ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            setResumeIndex(null)
          }}
        >
          อ่านต่อจากที่ค้างไว้
        </button>
      )}

      <div
        className="reader-page"
        data-reading-theme={settings.readingTheme}
        data-reading-font={settings.readingFont}
        data-reading-font-size={settings.readingFontSize}
      >
        <div className="reader-atmosphere" aria-hidden>
          <span className="reader-atmosphere-dot" />
          <span>คำเป้าหมาย {episode.targetWordIds.length} คำ</span>
          <span className="reader-atmosphere-sep">·</span>
          <span>{estimatedMinutes} นาที</span>
        </div>

        <h1>{episode.title}</h1>

        <TappableText
          paragraphs={parsed.paragraphs}
          targetTerms={targetTerms}
          activeSentenceIndex={activeIndex}
          selectedTerm={selected?.term.toLowerCase() ?? null}
          onWordTap={handleWordTap}
        />

        <div className="reader-calm-strip">
          <span>ไม่มีตัวจับเวลา ไม่มีคะแนน อ่านได้ตามจังหวะของตัวเอง</span>
        </div>

        <div className="read-footer">
          <button className="button" onClick={finishEpisode} disabled={finished}>
            {finished ? '✓ อ่านจบตอนนี้แล้ว' : 'อ่านจบตอนนี้'}
          </button>
          <Link className="button button-outline" to={`/quest/${episode.id}`}>
            ทำภารกิจท้ายตอน
          </Link>
          {nextEpisode && (
            <Link className="button button-outline" to={`/read/${nextEpisode.id}`}>
              ตอนต่อไป: {nextEpisode.title}
            </Link>
          )}
        </div>
      </div>

      {narration.supported && (
        <aside className="reader-audio-bar">
          <button className="reader-audio-play" onClick={() => (playing ? stop() : speakFrom(activeIndex ?? 0))} aria-label={playing ? 'หยุดเสียง' : 'ฟังเสียงบรรยาย'}>
            {playing ? <PauseIcon size={20} /> : <PlayIcon size={20} />}
          </button>
          <div className="reader-audio-meta">
            <div className="reader-audio-meta-row">
              <span>เสียงบรรยาย</span>
              <span className="reader-audio-position">
                {activeIndex !== null ? activeIndex + 1 : 0} / {parsed.sentences.length}
              </span>
            </div>
            <div className="reader-audio-wave" aria-hidden>
              {Array.from({ length: 16 }).map((_, i) => (
                <span
                  key={i}
                  className={playing ? 'reader-audio-bar-el reader-audio-bar-animated' : 'reader-audio-bar-el'}
                  style={{ height: `${6 + ((i * 7) % 14)}px`, animationDelay: `${i * 0.06}s` }}
                />
              ))}
            </div>
          </div>
          <button className="reader-audio-speed" onClick={cycleRate}>
            {rate}×
          </button>
        </aside>
      )}

      {selected && (
        <WordCard
          term={selected.term}
          word={selected.word}
          translation={selected.translation}
          sentence={selected.sentence}
          onClose={() => setSelected(null)}
        />
      )}

      {showReaderSettings && (
        <ReadingSettingsSheet
          readingFontSize={settings.readingFontSize}
          readingFont={settings.readingFont}
          readingTheme={settings.readingTheme}
          onReadingFontSizeChange={(readingFontSize) => setSettings((prev) => ({ ...prev, readingFontSize }))}
          onReadingFontChange={(readingFont) => setSettings((prev) => ({ ...prev, readingFont }))}
          onReadingThemeChange={(readingTheme) => setSettings((prev) => ({ ...prev, readingTheme }))}
          onClose={() => setShowReaderSettings(false)}
        />
      )}
    </div>
  )
}
