import { CheckIcon, SpeakerIcon } from './icons'
import { speak } from '../lib/speech'
import type { ContextualTranslation, Word } from '../types'
import './WordCard.css'

interface WordCardProps {
  term: string // คำตามที่ปรากฏในเนื้อเรื่อง (อาจเป็นรูปผัน)
  word?: Word // คำตั้งต้นที่หาเจอในคลัง
  translation?: ContextualTranslation // คำแปลไทยตามบริบท มีเฉพาะคำเป้าหมายของตอนนั้น
  sentence?: string // ประโยคที่คำนี้อยู่ สำหรับปุ่มฟังทั้งประโยค
  onClose: () => void
}

// การ์ด "สปอตไลต์" ที่ขึ้นเมื่อแตะคำในนิยายหรือแชท — ตั้งใจให้มืดเสมอสลับกับพื้นหลังหน้า (inverse-surface)
// เหมือนแสงไฟส่องคำเดียวตอนอ่านก่อนนอน เริ่มด้วยเสียงอ่านของเบราว์เซอร์ก่อน แล้วค่อยเปลี่ยนเป็นไฟล์เสียง
// สังเคราะห์ผ่าน API ทีหลัง (ดู README หัวข้อเทคโนโลยี) — ไม่มีคำอ่านสัทอักษร (IPA) เพราะคลังต้นทางไม่มีข้อมูลนี้
// ให้จริง ใส่ไปจะเป็นการเดาที่อาจผิด จึงตัดออกแทนที่จะมั่ว
export function WordCard({ term, word, translation, sentence, onClose }: WordCardProps) {
  const headword = word?.term
  const showsHeadword = headword && headword.toLowerCase() !== term.toLowerCase()
  const sourceLabel = word?.sources.filter((s) => s !== 'custom').join(' · ')
  const wasAutoSaved = Boolean(word)

  return (
    <div className="word-card-backdrop" onClick={onClose}>
      <div className="word-card" onClick={(e) => e.stopPropagation()}>
        <span className="word-card-handle" aria-hidden />
        <div className="word-card-header">
          <div className="word-card-title">
            <strong>{term}</strong>
            {showsHeadword && <span className="word-card-headword">คำตั้งต้น: {headword}</span>}
          </div>
          <button className="word-card-speak" onClick={() => speak(term)} aria-label="ฟังเสียงคำ">
            <SpeakerIcon size={18} />
          </button>
        </div>

        {translation && (
          <p className="word-card-translation">
            <span className="word-card-pos">{translation.partOfSpeech}</span>
            {translation.th}
          </p>
        )}

        {word?.definition && <p className="word-card-definition">{word.definition}</p>}

        {!translation && !word?.definition && (
          <p className="word-card-translation word-card-unknown">
            {word
              ? 'คลังต้นทางไม่มีคำนิยามของคำนี้ — คำนี้ถูกเพิ่มเข้ารายการทวนแล้ว'
              : 'ไม่พบคำนี้ในคลัง (อาจเป็นชื่อเฉพาะ) — เพิ่มเข้ารายการทวนไว้ให้แล้ว'}
          </p>
        )}

        {translation?.exampleSentence && <p className="word-card-example">"{translation.exampleSentence}"</p>}

        <div className="word-card-footer">
          <span className="word-card-badge">{sourceLabel || 'เพิ่มใหม่'}</span>
          {wasAutoSaved && (
            <span className="word-card-saved">
              <CheckIcon size={14} />
              บันทึกลงสมุดคำศัพท์แล้ว
            </span>
          )}
        </div>

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
