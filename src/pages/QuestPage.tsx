import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getAllEpisodes, getAllWords, putWord } from '../lib/db'
import { recordEncounter } from '../lib/srs'
import { ChatIcon, CheckIcon, ChevronLeftIcon, ClockIcon, MoonIcon, QuestIcon, SparkleIcon, VocabIcon } from '../components/icons'
import type { Episode, QuestQuestion, QuestQuestionType, Word } from '../types'

const TYPE_META: Record<QuestQuestionType, { label: string; Icon: typeof ChatIcon }> = {
  'fill-blank': { label: 'เติมคำในช่องว่าง', Icon: VocabIcon },
  'choose-reply': { label: 'เลือกคำตอบที่เหมาะสม', Icon: ChatIcon },
  match: { label: 'จับคู่ให้ถูกต้อง', Icon: QuestIcon },
  'listen-schedule': { label: 'ฟังแล้วเลือกเวลา', Icon: ClockIcon },
}

export function QuestPage() {
  const { episodeId } = useParams<{ episodeId?: string }>()
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [words, setWords] = useState<Word[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})

  // คำทั้งหมดอ่าน/เขียนผ่าน ref ด้วย (นอกจาก state ที่ใช้แสดงผล) เพราะไม่งั้นบางข้อในภารกิจเดียวกัน
  // อ้างคำเดียวกันซ้ำ (เช่น ข้อ 2 กับ 3 ของตอนที่ 1 ต่างก็เกี่ยวกับ "confidential") ถ้าตอบถูกสองข้อนั้นเร็วๆ
  // ติดกัน choose() ทั้งสองคอลจะ await putWord คาบเกี่ยวกัน ถ้าอ่านจาก useState ตรงๆ แต่ละคอลจะเห็นค่าก่อน
  // อัปเดตของกันและกัน ทำให้ encounter ของฝั่งที่เขียนทีหลังทับฝั่งแรกไป
  const wordsRef = useRef<Word[]>([])

  useEffect(() => {
    getAllEpisodes().then(setEpisodes)
    getAllWords().then((loaded) => {
      wordsRef.current = loaded
      setWords(loaded)
    })
  }, [])

  const episode = (episodeId ? episodes.find((e) => e.id === episodeId) : episodes[0]) ?? null

  async function choose(question: QuestQuestion, choice: string) {
    setAnswers((prev) => ({ ...prev, [question.id]: choice }))
    if (choice !== question.answer) return

    for (const wordId of question.relatedWordIds) {
      const word = wordsRef.current.find((w) => w.id === wordId)
      if (!word) continue
      const updated = recordEncounter(word, {
        mode: 'quest',
        episodeId: episode?.id,
        at: new Date().toISOString(),
        result: 'answered_correctly',
      })
      await putWord(updated)
      wordsRef.current = wordsRef.current.map((w) => (w.id === updated.id ? updated : w))
      setWords(wordsRef.current)
    }
  }

  // คำที่ "ได้เพิ่มเข้าสมุด" ให้ดูตอนทำภารกิจครบ — มาจากคำเป้าหมายของข้อที่ตอบถูกจริงเท่านั้น
  // (ไม่ใช่ทุกคำที่ภารกิจพูดถึง) ให้ตรงกับที่ recordEncounter ถูกเรียกจริงใน choose() ด้านบน
  const earnedWords = useMemo(() => {
    if (!episode) return []
    const ids = new Set<string>()
    for (const q of episode.quest.questions) {
      if (answers[q.id] !== q.answer) continue
      for (const id of q.relatedWordIds) ids.add(id)
    }
    return words.filter((w) => ids.has(w.id))
  }, [episode, answers, words])

  if (!episode) {
    return (
      <div className="page">
        <p>ยังไม่มีภารกิจ — ต้องมีตอนก่อน</p>
      </div>
    )
  }

  const totalQuestions = episode.quest.questions.length
  const answeredCount = episode.quest.questions.filter((q) => answers[q.id] === q.answer).length
  const allDone = answeredCount === totalQuestions && totalQuestions > 0

  return (
    <div className="page">
      <Link to={`/read/${episode.id}`} className="quest-back">
        <ChevronLeftIcon size={18} />
        {episode.title}
      </Link>

      <div className="quest-header">
        <span className="eyebrow quest-eyebrow">
          <MoonIcon size={13} />
          Postlude
        </span>
        <h1>ภารกิจท้ายตอน</h1>
        <span className="quest-progress-pill">
          ตอบถูกแล้ว {answeredCount} / {totalQuestions} ข้อ
        </span>
      </div>

      {episode.summary && (
        <div className="quest-recap-card">
          <div className="quest-recap-icon" aria-hidden>
            <SparkleIcon size={16} />
          </div>
          <p>{episode.summary}</p>
        </div>
      )}

      {episode.quest.questions.map((q, i) => {
        const picked = answers[q.id]
        const isCorrect = picked === q.answer
        const { label, Icon } = TYPE_META[q.type]
        const isFillBlank = q.type === 'fill-blank' && q.prompt.includes('____')

        return (
          <article key={q.id} className="quest-mission-card">
            <div className="quest-mission-header">
              <div className="quest-mission-icon" aria-hidden>
                <Icon size={18} />
              </div>
              <div className="quest-mission-title">
                <span className="eyebrow quest-mission-eyebrow">
                  ภารกิจที่ {i + 1} · {label}
                </span>
              </div>
            </div>

            {isFillBlank ? (
              <p className="quest-prompt">
                {q.prompt.split('____')[0]}
                {picked ? (
                  <span className={isCorrect ? 'quest-blank-pill quest-blank-pill-ok' : 'quest-blank-pill'}>{picked}</span>
                ) : (
                  <span className="quest-blank-placeholder"> ____ </span>
                )}
                {q.prompt.split('____')[1]}
              </p>
            ) : (
              <p className="quest-prompt">{q.prompt}</p>
            )}

            <div className={isFillBlank ? 'quest-choices' : 'quest-options'}>
              {q.choices?.map((choice) => {
                const isPicked = picked === choice
                if (isFillBlank) {
                  return (
                    <button
                      key={choice}
                      className={isPicked ? 'button button-selected' : 'button button-outline'}
                      onClick={() => choose(q, choice)}
                      disabled={Boolean(picked)}
                    >
                      {choice}
                    </button>
                  )
                }
                return (
                  <button
                    key={choice}
                    className={
                      isPicked ? (isCorrect ? 'quest-option quest-option-correct' : 'quest-option quest-option-wrong') : 'quest-option'
                    }
                    onClick={() => choose(q, choice)}
                    disabled={Boolean(picked)}
                  >
                    <span className="quest-option-dot" aria-hidden>
                      {isPicked && isCorrect && <CheckIcon size={13} />}
                    </span>
                    {choice}
                  </button>
                )
              })}
            </div>

            {picked && (
              <p className={isCorrect ? 'quest-feedback quest-feedback-ok' : 'quest-feedback'}>
                {isCorrect
                  ? '✓ "เยี่ยมเลย ตรงกับที่ผมคิดไว้" — Daniel พยักหน้า'
                  : '○ Daniel เอียงหัว: "ลองดูอีกทีนะ"'}
              </p>
            )}
          </article>
        )
      })}

      {allDone && (
        <section className="quest-postlude-card">
          <div className="quest-postlude-icon" aria-hidden>
            <MoonIcon size={22} />
          </div>
          <h3>ทำภารกิจครบแล้ว ✨</h3>
          <p className="card-label">คืนนี้พักผ่อนได้อย่างสบายใจ</p>

          {earnedWords.length > 0 && (
            <div className="quest-postlude-words">
              <SparkleIcon size={15} />
              <span>เพิ่มลงสมุดคำศัพท์: {earnedWords.map((w) => w.term).join(', ')}</span>
            </div>
          )}

          <Link to="/" className="button quest-postlude-cta">
            <MoonIcon size={16} />
            กลับไปพักผ่อน
          </Link>
        </section>
      )}
    </div>
  )
}
