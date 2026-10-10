import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllEpisodes, getAllWords, getMessagesForCharacter } from '../lib/db'
import { characters } from '../features/chat/characters'
import type { Episode, Message, Word } from '../types'

export function HomePage() {
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [words, setWords] = useState<Word[]>([])
  const [previews, setPreviews] = useState<Record<string, Message | undefined>>({})

  useEffect(() => {
    getAllEpisodes().then(setEpisodes)
    getAllWords().then(setWords)
    Promise.all(
      characters.map(async (c) => {
        const messages = await getMessagesForCharacter(c.id)
        return [c.id, messages.at(-1)] as const
      }),
    ).then((pairs) => setPreviews(Object.fromEntries(pairs)))
  }, [])

  const masteredCount = words.filter((w) => w.status === 'mastered').length

  return (
    <div className="page">
      <h1>Off Hours</h1>

      <section>
        <h3>ตอนทั้งหมด</h3>
        {episodes.length === 0 && <p>ยังไม่มีตอน — ต่อ features/story/generateEpisode เพื่อสร้างตอนแรก</p>}
        {episodes.map((ep) => (
          <Link key={ep.id} to={`/read/${ep.id}`} className="list-row">
            <strong>{ep.title}</strong>
            <span className="list-row-sub">คำเป้าหมาย {ep.targetWordIds.length} คำ</span>
          </Link>
        ))}
      </section>

      <section>
        <h3>ข้อความใหม่</h3>
        {characters.map((c) => {
          const preview = previews[c.id]
          return (
            <Link key={c.id} to={`/chat/${c.id}`} className="list-row">
              <strong>{c.name}</strong>
              <span className="list-row-sub">{preview ? preview.content : 'ยังไม่มีข้อความ'}</span>
            </Link>
          )
        })}
      </section>

      <section className="stats-row">
        <div>
          <span className="stats-number">{episodes.length}</span>
          <span className="stats-label">ตอนที่มี</span>
        </div>
        <div>
          <span className="stats-number">{words.length}</span>
          <span className="stats-label">คำในคลัง</span>
        </div>
        <div>
          <span className="stats-number">{masteredCount}</span>
          <span className="stats-label">คำที่ใช้เป็น</span>
        </div>
      </section>
    </div>
  )
}
