import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { TappableText } from '../components/TappableText'
import { WordCard } from '../components/WordCard'
import { getAllWords, getMessagesForCharacter, putMessage } from '../lib/db'
import { characters } from '../features/chat/characters'
import { buildWordIndex, lookupWord } from '../features/reading/lookup'
import { parseText } from '../features/reading/text'
import type { Message, Word } from '../types'

export function ChatPage() {
  const { characterId } = useParams<{ characterId?: string }>()

  if (!characterId) return <ChatList />
  return <ChatThread characterId={characterId} />
}

function ChatList() {
  return (
    <div className="page">
      <h1>แชท</h1>
      {characters.map((c) => (
        <Link key={c.id} to={`/chat/${c.id}`} className="list-row">
          <strong>{c.name}</strong>
          <span className="list-row-sub">{c.persona}</span>
        </Link>
      ))}
    </div>
  )
}

function ChatThread({ characterId }: { characterId: string }) {
  const character = characters.find((c) => c.id === characterId)
  const [messages, setMessages] = useState<Message[]>([])
  const [words, setWords] = useState<Word[]>([])
  const [draft, setDraft] = useState('')
  const [selected, setSelected] = useState<{ term: string; word?: Word; sentence: string } | null>(null)

  useEffect(() => {
    getMessagesForCharacter(characterId).then(setMessages)
    getAllWords().then(setWords)
  }, [characterId])

  const wordIndex = useMemo(() => buildWordIndex(words), [words])

  async function sendMessage() {
    if (!draft.trim()) return
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      characterId,
      sender: 'user',
      content: draft.trim(),
      createdAt: new Date().toISOString(),
    }
    await putMessage(userMessage)
    setMessages((prev) => [...prev, userMessage])
    setDraft('')

    // TODO: ต่อ server/llm.ts เพื่อให้ตัวละครตอบจริงและแนบคำแนะนำภาษา (languageTips)
    window.setTimeout(async () => {
      const placeholderReply: Message = {
        id: `msg-${Date.now() + 1}`,
        characterId,
        sender: 'character',
        content: '(ตัวอย่าง) ยังไม่ได้ต่อผู้ช่วยสนทนาจริง ข้อความนี้เป็นคำตอบจำลอง',
        createdAt: new Date().toISOString(),
      }
      await putMessage(placeholderReply)
      setMessages((prev) => [...prev, placeholderReply])
    }, 600)
  }

  if (!character) {
    return (
      <div className="page">
        <p>ไม่พบตัวละครนี้</p>
      </div>
    )
  }

  return (
    <div className="page chat-thread">
      <h1>{character.name}</h1>
      <div className="chat-messages">
        {messages.map((m) => (
          <div key={m.id} className={m.sender === 'user' ? 'chat-bubble chat-bubble-user' : 'chat-bubble'}>
            <TappableText
              paragraphs={parseText(m.content).paragraphs}
              onWordTap={(term, sentence) =>
                setSelected({ term, word: lookupWord(wordIndex, term), sentence: sentence.text })
              }
            />
            {m.languageTips?.map((tip, i) => (
              <p key={i} className="chat-tip">
                💡 {tip.original} → <strong>{tip.suggestion}</strong>
                {tip.note ? ` (${tip.note})` : ''}
              </p>
            ))}
          </div>
        ))}
      </div>
      <div className="chat-input-row">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="พิมพ์ข้อความ..."
        />
        <button className="button" onClick={sendMessage}>
          ส่ง
        </button>
      </div>
      {selected && (
        <WordCard
          term={selected.term}
          word={selected.word}
          sentence={selected.sentence}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
