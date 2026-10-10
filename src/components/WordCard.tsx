import { SpeakerIcon } from './icons'
import type { ContextualTranslation, Word } from '../types'
import './WordCard.css'

interface WordCardProps {
  term: string // คำตามที่ปรากฏในเนื้อเรื่อง (อาจเป็นรูปผัน)
  word?: Word // คำตั้งต้นที่หาเจอในคลัง
  translation?: ContextualTranslation // คำแปลไทยตามบริบท มีเฉพาะคำเป้าหมายของตอนนั้น
  sentence?: string // ประโยคที่คำนี้อยู่ สำหรับปุ่มฟังทั้งประโยค
  onClose: () => void
}

function speak(text: string) {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'en-US'
  window.speechSynthesis.speak(utterance)
}

// การ์ดคำที่ขึ้นเมื่อแตะคำในนิยายหรือแชท — เริ่มด้วยเสียงอ่านของเบราว์เซอร์ก่อน
// แล้วค่อยเปลี่ยนเป็นไฟล์เสียงสังเคราะห์ผ่าน API ทีหลัง (ดู README หัวข้อเทคโนโลยี)
export function WordCard({ term, word, translation, sentence, onClose }: WordCardProps) {
  const headword = word?.term
  const showsHeadword = headword && headword.toLowerCase() !== term.toLowerCase()
  const sourceLabel = word?.sources.filter((s) => s !== 'custom').join('·')

  return (
    <div className="word-card-backdrop" onClick={onClose}>
      <div className="word-card" onClick={(e) => e.stopPropagation()}>
        <span className="word-card-handle" aria-hidden />
        <div className="word-card-header">
          <strong>{term}</strong>
          <div className="word-card-actions">
            {sourceLabel && <span className="word-card-badge">{sourceLabel}</span>}
            <button className="word-card-speak" onClick={() => speak(term)} aria-label="ฟังเสียงคำ">
              <SpeakerIcon size={18} />
            </button>
          </div>
        </div>

        {showsHeadword && <p className="word-card-headword">คำตั้งต้น: {headword}</p>}

        {translation && (
          <>
            <p className="word-card-translation">
              {translation.th} <span className="word-card-pos">({translation.partOfSpeech})</span>
            </p>
            <p className="word-card-example">{translation.exampleSentence}</p>
          </>
        )}

        {word?.definition && <p className="word-card-definition">{word.definition}</p>}

        {!translation && !word?.definition && (
          <p className="word-card-translation word-card-unknown">
            {word
              ? 'คลังต้นทางไม่มีคำนิยามของคำนี้ — คำนี้ถูกเพิ่มเข้ารายการทวนแล้ว'
              : 'ไม่พบคำนี้ในคลัง (อาจเป็นชื่อเฉพาะ) — เพิ่มเข้ารายการทวนไว้ให้แล้ว'}
          </p>
        )}

        {sentence && (
          <button className="word-card-sentence" onClick={() => speak(sentence)}>
            <SpeakerIcon size={16} /> ฟังทั้งประโยค
          </button>
        )}

        <button className="word-card-close" onClick={onClose}>
          ปิด
        </button>
      </div>
    </div>
  )
}
