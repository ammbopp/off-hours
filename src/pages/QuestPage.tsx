import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getAllEpisodes, getAllWords, putWord } from '../lib/db'
import { recordEncounter } from '../lib/srs'
import type { Episode, QuestQuestion, Word } from '../types'

export function QuestPage() {
  const { episodeId } = useParams<{ episodeId?: string }>()
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [words, setWords] = useState<Word[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})

  useEffect(() => {
    getAllEpisodes().then(setEpisodes)
    getAllWords().then(setWords)
  }, [])

  const episode = (episodeId ? episodes.find((e) => e.id === episodeId) : episodes[0]) ?? null

  async function choose(question: QuestQuestion, choice: string) {
    setAnswers((prev) => ({ ...prev, [question.id]: choice }))
    if (choice !== question.answer) return

    for (const wordId of question.relatedWordIds) {
      const word = words.find((w) => w.id === wordId)
      if (!word) continue
      const updated = recordEncounter(word, {
        mode: 'quest',
        episodeId: episode?.id,
        at: new Date().toISOString(),
        result: 'answered_correctly',
      })
      await putWord(updated)
      setWords((prev) => prev.map((w) => (w.id === updated.id ? updated : w)))
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
