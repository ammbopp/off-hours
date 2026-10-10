import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getAllEpisodes, getAllWords, putWord } from '../lib/db'
import { recordEncounter } from '../lib/srs'
import type { Episode, QuestQuestion, Word } from '../types'

export function QuestPage() {
  const { episodeId } = useParams<{ episodeId?: string }>()
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})

  // คำทั้งหมดไม่ต้องเป็น React state เพราะไม่มีจุดไหนในหน้านี้แสดงผลจากมันโดยตรง (ใช้แค่เป็นแหล่งอ่าน/เขียนใน choose())
  // เก็บเป็น ref ธรรมดาที่อัปเดต synchronous ทุกครั้งที่เขียน เพื่อป้องกันปัญหานี้: บางข้อในภารกิจเดียวกัน
  // อ้างคำเดียวกันซ้ำ (เช่น ข้อ 2 กับ 3 ของตอนที่ 1 ต่างก็เกี่ยวกับ "confidential") ถ้าตอบถูกสองข้อนั้นเร็วๆ
  // ติดกัน choose() ทั้งสองคอลจะ await putWord คาบเกี่ยวกัน ถ้าอ่านจาก useState ตรงๆ แต่ละคอลจะเห็นค่าก่อน
  // อัปเดตของกันและกัน ทำให้ encounter ของฝั่งที่เขียนทีหลังทับฝั่งแรกไป
  const wordsRef = useRef<Word[]>([])

  useEffect(() => {
    getAllEpisodes().then(setEpisodes)
    getAllWords().then((loaded) => {
      wordsRef.current = loaded
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
    }
  }

  if (!episode) {
    return (
      <div className="page">
        <p>ยังไม่มีภารกิจ — ต้องมีตอนก่อน</p>
      </div>
    )
  }

  const answeredCount = episode.quest.questions.filter((q) => answers[q.id] === q.answer).length

  return (
    <div className="page">
      <span className="eyebrow">ภารกิจท้ายตอน</span>
      <h1>{episode.title}</h1>
      <p className="card-label" style={{ marginBottom: 20 }}>
        ตอบถูกแล้ว {answeredCount} / {episode.quest.questions.length} ข้อ
      </p>
      {episode.quest.questions.map((q, i) => {
        const picked = answers[q.id]
        const isCorrect = picked === q.answer
        return (
          <div key={q.id} className="card quest-card">
            <div className="quest-number">{i + 1}</div>
            <p className="quest-prompt">{q.prompt}</p>
            <div className="quest-choices">
              {q.choices?.map((choice) => (
                <button
                  key={choice}
                  className={picked === choice ? 'button button-selected' : 'button button-outline'}
                  onClick={() => choose(q, choice)}
                >
                  {choice}
                </button>
              ))}
            </div>
            {picked && (
              <p className={isCorrect ? 'quest-feedback quest-feedback-ok' : 'quest-feedback'}>
                {isCorrect
                  ? '✓ "เยี่ยมเลย ตรงกับที่ผมคิดไว้" — Daniel พยักหน้า'
                  : '○ Daniel เอียงหัว: "ลองดูอีกทีนะ"'}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
