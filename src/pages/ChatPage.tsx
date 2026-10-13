import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { TappableText } from '../components/TappableText'
import { WordCard } from '../components/WordCard'
import { ChevronRightIcon, SendIcon, SparkleIcon, SpeakerIcon } from '../components/icons'
import { getAllWords, getMessagesForCharacter, putMessage, putWord } from '../lib/db'
import { avatarClass, initials } from '../lib/avatar'
import { characters } from '../features/chat/characters'
import { getChatReply } from '../features/chat/getChatReply'
import { buildWordIndex, lookupWord, type WordIndex } from '../features/reading/lookup'
import { parseText } from '../features/reading/text'
import { recordEncounter } from '../lib/srs'
import { isTargetable } from '../lib/wordlists/import'
import { speak } from '../lib/speech'
import type { Message, Word } from '../types'

const DUE_WORDS_FOR_REPLY = 5

const WORD_PATTERN = /[A-Za-zÀ-ÖØ-öø-ÿ']+/g

// หาคำเป้าหมาย (TSL/BSL) ที่ผู้ใช้พิมพ์ใช้จริงในข้อความ — ไม่สนใจคำพื้นฐาน NGSL เหมือน pickTargetWords
function detectUsedTargetWords(content: string, index: WordIndex): Word[] {
  const found = new Map<string, Word>()
  for (const token of content.match(WORD_PATTERN) ?? []) {
    const word = lookupWord(index, token)
    if (word && isTargetable(word)) found.set(word.id, word)
  }
  return [...found.values()]
}

function formatDivider(iso: string): string {
  const d = new Date(iso)
  const sameDay = d.toDateString() === new Date().toDateString()
  const datePart = sameDay ? 'วันนี้' : d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })
  const timePart = d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
  return `${datePart} · ${timePart}`
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
}

export function ChatPage() {
  const { characterId } = useParams<{ characterId?: string }>()

  if (!characterId) return <ChatList />
  return <ChatThread characterId={characterId} />
}

function ChatList() {
  const [previews, setPreviews] = useState<Record<string, Message | undefined>>({})

  useEffect(() => {
    Promise.all(
      characters.map(async (c) => {
        const messages = await getMessagesForCharacter(c.id)
        return [c.id, messages.at(-1)] as const
      }),
    ).then((pairs) => setPreviews(Object.fromEntries(pairs)))
  }, [])

  return (
    <div className="page">
      <h1>แชท</h1>
      {characters.map((c) => {
        const preview = previews[c.id]
        return (
          <Link key={c.id} to={`/chat/${c.id}`} className="list-row">
            <span className={avatarClass(c.relation)} aria-hidden>
              {initials(c.name)}
            </span>
            <span className="list-row-text">
              <span className="list-row-title">
                <strong>{c.name}</strong>
                <span className="home-accent-badge">{c.accent}</span>
              </span>
              <span className="list-row-sub">{preview ? preview.content : c.persona}</span>
            </span>
            <ChevronRightIcon size={18} className="list-row-chevron" />
          </Link>
        )
      })}
    </div>
  )
}

function ChatThread({ characterId }: { characterId: string }) {
  const character = characters.find((c) => c.id === characterId)
  const [messages, setMessages] = useState<Message[]>([])
  const [words, setWords] = useState<Word[]>([])
  const [draft, setDraft] = useState('')
  const [selected, setSelected] = useState<{ term: string; word?: Word; sentence: string } | null>(null)
  const [usedWordsByMessage, setUsedWordsByMessage] = useState<Record<string, string[]>>({})
  const [sending, setSending] = useState(false)

  // ติดตาม characterId ปัจจุบันด้วย ref เพราะ ChatThread ไม่ unmount เมื่อสลับคู่สนทนาโดยตรง
  // (React ใช้ instance เดิมซ้ำ แค่เปลี่ยน prop) — ถ้าไม่เช็กตรงนี้ คำตอบจำลองที่ค้างอยู่ใน setTimeout
  // ของคู่สนทนาเก่าจะหลุดไปโผล่ในหน้าต่างแชทของคู่สนทนาใหม่ที่เพิ่งสลับไปดู
  const characterIdRef = useRef(characterId)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  // สลับคู่สนทนาแล้วควรกระโดดไปท้ายสุดทันที (ไม่ใช่ smooth) ส่วนข้อความใหม่ระหว่างคุยอยู่ค่อยเลื่อนนุ่มๆ
  const didInitialScrollRef = useRef(false)

  useEffect(() => {
    characterIdRef.current = characterId
    didInitialScrollRef.current = false
    getMessagesForCharacter(characterId).then(setMessages)
    getAllWords().then(setWords)
  }, [characterId])

  // ช่องพิมพ์ลอยติดอยู่เหนือแถบนำทางเสมอ (ดู .chat-input-tray) จึงต้องเลื่อนไปข้อความล่าสุดเองตอนเปิดแชท
  // หรือมีข้อความใหม่ ไม่งั้นข้อความที่เพิ่งส่ง/ตอบกลับจะโผล่พ้นจอด้านล่างโดยผู้ใช้ไม่เห็น
  useEffect(() => {
    if (messages.length === 0) return
    messagesEndRef.current?.scrollIntoView({
      behavior: didInitialScrollRef.current ? 'smooth' : 'auto',
      block: 'end',
    })
    didInitialScrollRef.current = true
  }, [messages.length])

  const wordIndex = useMemo(() => buildWordIndex(words), [words])

  if (!character) {
    return (
      <div className="page">
        <p>ไม่พบตัวละครนี้</p>
      </div>
    )
  }

  async function sendMessage() {
    // TS ไม่ narrow ตัวแปรนอก scope ที่ถูก capture ข้าม closure แม้จะเช็ก !character ไปแล้วด้านนอก
    // เช็กซ้ำตรงนี้สั้นๆ เพื่อให้ character ด้านล่างเป็น Character ชัวร์ (ไม่ใช่ Character | undefined)
    if (!character) return
    const content = draft.trim()
    if (!content || sending) return
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      characterId,
      sender: 'user',
      content,
      createdAt: new Date().toISOString(),
    }
    await putMessage(userMessage)
    setMessages((prev) => [...prev, userMessage])
    setDraft('')

    // พิมพ์คำเป้าหมายใช้เองในแชทถือว่า "ใช้เป็น" ตามนิยามสี่ขั้นของแอป (ดู types/word.ts) — บันทึกทันที
    // ไม่ต้องรอกดเปิดการ์ดคำ เพราะการพิมพ์ใช้เองคือสัญญาณที่แน่นกว่าการแตะดูความหมายเฉยๆ
    const usedWords = detectUsedTargetWords(content, wordIndex)
    if (usedWords.length > 0) {
      const updated = await Promise.all(
        usedWords.map(async (w) => {
          const next = recordEncounter(w, { mode: 'chat', characterId, at: new Date().toISOString(), result: 'used_correctly' })
          await putWord(next)
          return next
        }),
      )
      setWords((prev) => prev.map((w) => updated.find((u) => u.id === w.id) ?? w))
      setUsedWordsByMessage((prev) => ({ ...prev, [userMessage.id]: updated.map((w) => w.term) }))
    }

    setSending(true)
    try {
      const now = new Date().toISOString()
      const dueWordTerms = words
        .filter((w) => isTargetable(w) && w.nextReviewAt !== null && w.nextReviewAt <= now)
        .map((w) => w.term)
        .slice(0, DUE_WORDS_FOR_REPLY)

      const reply = await getChatReply({
        character,
        history: [...messages, userMessage],
        dueWordTerms,
      })

      // languageTips เป็นคำแนะนำเกี่ยวกับข้อความของ "ผู้ใช้" (ดู types/message.ts) จึงแปะกลับไปที่
      // ข้อความที่เพิ่งส่ง ไม่ใช่ข้อความตอบกลับของตัวละคร
      if (reply.languageTips && reply.languageTips.length > 0) {
        const taggedUserMessage: Message = { ...userMessage, languageTips: reply.languageTips }
        await putMessage(taggedUserMessage)
        if (characterIdRef.current === characterId) {
          setMessages((prev) => prev.map((m) => (m.id === userMessage.id ? taggedUserMessage : m)))
        }
      }

      const characterReply: Message = {
        id: `msg-${Date.now() + 1}`,
        characterId,
        sender: 'character',
        content: reply.content,
        createdAt: new Date().toISOString(),
      }
      await putMessage(characterReply)
      // ยังบันทึกลง DB ให้คู่สนทนาเดิมตามปกติ แต่ไม่อัปเดตข้อความที่ "กำลังแสดงอยู่" ถ้าผู้ใช้สลับไปคุยกับคนอื่นแล้ว
      if (characterIdRef.current === characterId) {
        setMessages((prev) => [...prev, characterReply])
      }
    } catch (err) {
      const errorReply: Message = {
        id: `msg-${Date.now() + 1}`,
        characterId,
        sender: 'character',
        content: `(ตอบไม่ได้ตอนนี้ — ${err instanceof Error ? err.message : 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ'})`,
        createdAt: new Date().toISOString(),
      }
      await putMessage(errorReply)
      if (characterIdRef.current === characterId) {
        setMessages((prev) => [...prev, errorReply])
      }
    } finally {
      setSending(false)
    }
  }

  let lastDividerDate = ''

  return (
    <div className="page chat-thread">
      <div className="chat-context-card">
        <span className={avatarClass(character.relation)} aria-hidden>
          {initials(character.name)}
        </span>
        <div className="chat-context-text">
          <span className="chat-context-title">
            <strong>{character.name}</strong>
            <span className="home-accent-badge">{character.accent}</span>
          </span>
          <span className="list-row-sub">{character.persona}</span>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((m) => {
          const day = new Date(m.createdAt).toDateString()
          const showDivider = day !== lastDividerDate
          lastDividerDate = day
          const usedWords = usedWordsByMessage[m.id]

          return (
            <div key={m.id}>
              {showDivider && (
                <div className="chat-divider">
                  <span>{formatDivider(m.createdAt)}</span>
                </div>
              )}
              <div className={m.sender === 'user' ? 'chat-row chat-row-user' : 'chat-row'}>
                {m.sender !== 'user' && (
                  <span className={`${avatarClass(character.relation)} avatar-sm`} aria-hidden>
                    {initials(character.name)}
                  </span>
                )}
                <div className="chat-bubble-stack">
                  <div className={m.sender === 'user' ? 'chat-bubble chat-bubble-user' : 'chat-bubble'}>
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
                    <div className="chat-bubble-meta">
                      {m.sender !== 'user' && (
                        <button
                          className="chat-listen-btn"
                          onClick={() => speak(m.content, character.accent)}
                          aria-label="ฟังข้อความนี้"
                        >
                          <SpeakerIcon size={13} />
                        </button>
                      )}
                      <span>{formatTime(m.createdAt)}</span>
                    </div>
                  </div>
                  {usedWords && usedWords.length > 0 && (
                    <span className="chat-used-pill">
                      <SparkleIcon size={13} />
                      ใช้คำเป้าหมาย: {usedWords.join(', ')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} className="chat-scroll-anchor" />
      </div>

      <div className="chat-input-tray">
        <div className="chat-input-row">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder={sending ? `${character.name} กำลังพิมพ์...` : 'พิมพ์ข้อความ...'}
            disabled={sending}
          />
          <button className="button" onClick={sendMessage} aria-label="ส่ง" disabled={sending}>
            <SendIcon size={18} />
          </button>
        </div>
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
