import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { TappableText } from '../components/TappableText'
import { WordCard } from '../components/WordCard'
import { PauseIcon, PlayIcon } from '../components/icons'
import { getAllEpisodes, getAllWords, getProgress, putWord, updateProgress } from '../lib/db'
import { recordEncounter } from '../lib/srs'
import { makeBlankWord } from '../lib/wordlists/import'
import { buildWordIndex, lookupWord } from '../features/reading/lookup'
import { parseText, type ParsedSentence } from '../features/reading/text'
import { useNarration, type NarrationRate } from '../features/reading/useNarration'
import type { ContextualTranslation, Episode, Word } from '../types'

interface SelectedWord {
  term: string
  word?: Word
  translation?: ContextualTranslation
  sentence: string
}

const RATES: NarrationRate[] = [0.75, 1, 1.25]

export function ReadPage() {
  const { episodeId } = useParams<{ episodeId?: string }>()
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [words, setWords] = useState<Word[]>([])
  const [selected, setSelected] = useState<SelectedWord | null>(null)
  const [resumeIndex, setResumeIndex] = useState<number | null>(null)
  const [finished, setFinished] = useState(false)

  const furthestSentenceRef = useRef(0)

  useEffect(() => {
    getAllEpisodes().then(setEpisodes)
    getAllWords().then(setWords)
  }, [])

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

  // ไม่แตะ finishedAt ตรงนี้ ปล่อยให้ updateProgress รักษาค่าเดิมไว้
  // (เคยมีบั๊ก: callback ที่ค้างค่า finished เก่าไว้เขียนทับ finishedAt กลับเป็น null หลังกดอ่านจบ)
  const saveProgress = useCallback(
    (sentenceIndex: number) => {
      if (!episode) return
      furthestSentenceRef.current = Math.max(furthestSentenceRef.current, sentenceIndex)
      void updateProgress(episode.id, { lastSentenceIndex: furthestSentenceRef.current })
    },
    [episode],
  )

  const narration = useNarration(parsed.sentences, { onSentenceStart: (i) => saveProgress(i) })
  const { activeIndex, playing, rate, setRate, speakFrom, stop } = narration

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

    getProgress(episode.id).then((progress) => {
      if (cancelled || !progress) return
      furthestSentenceRef.current = progress.lastSentenceIndex
      setFinished(Boolean(progress.finishedAt))
      if (progress.lastSentenceIndex > 0) setResumeIndex(progress.lastSentenceIndex)
    })

    return () => {
      cancelled = true
    }
  }, [episode])

  // หยุดเสียงเมื่อเปลี่ยนตอน
  useEffect(() => {
    stop()
  }, [episode?.id, stop])

  // เลื่อนตามประโยคที่เสียงกำลังอ่าน
  useEffect(() => {
    if (activeIndex === null) return
    document.getElementById(`sentence-${activeIndex}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [activeIndex])

  // จำว่าอ่านถึงประโยคไหนจากการเลื่อนจอ เพื่อเปิดอ่านต่อครั้งหน้าได้
  useEffect(() => {
    if (!episode || parsed.sentences.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const sentenceIndex = Number((entry.target as HTMLElement).dataset.sentence)
          if (Number.isFinite(sentenceIndex)) {
            furthestSentenceRef.current = Math.max(furthestSentenceRef.current, sentenceIndex)
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
    <div className="page">
      <h1>{episode.title}</h1>

      <div className="reader-toolbar">
        {narration.supported ? (
          <>
            <button className="button" onClick={() => (playing ? stop() : speakFrom(activeIndex ?? 0))}>
              {playing ? <PauseIcon size={16} /> : <PlayIcon size={16} />}
              {playing ? 'หยุดเสียง' : 'ฟังเสียงบรรยาย'}
            </button>
            <div className="reader-rates">
              {RATES.map((r) => (
                <button
                  key={r}
                  className={r === rate ? 'chip chip-active' : 'chip'}
                  onClick={() => setRate(r)}
                >
                  {r}×
                </button>
              ))}
            </div>
          </>
        ) : (
          <p className="card-label">เบราว์เซอร์นี้ไม่รองรับเสียงอ่าน</p>
        )}
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

      <TappableText
        paragraphs={parsed.paragraphs}
        targetTerms={targetTerms}
        activeSentenceIndex={activeIndex}
        onWordTap={handleWordTap}
      />

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

      {selected && (
        <WordCard
          term={selected.term}
          word={selected.word}
          translation={selected.translation}
          sentence={selected.sentence}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
