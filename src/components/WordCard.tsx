import type { ContextualTranslation } from '../types'
import './WordCard.css'

interface WordCardProps {
  term: string
  translation?: ContextualTranslation
  onClose: () => void
}

function speak(text: string) {
  if (!('speechSynthesis' in window)) return
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'en-US'
  window.speechSynthesis.speak(utterance)
}

// การ์ดคำที่ขึ้นเมื่อแตะคำในนิยายหรือแชท — เริ่มด้วยเสียงอ่านของเบราว์เซอร์ก่อน
// แล้วค่อยเปลี่ยนเป็นไฟล์เสียงสังเคราะห์ผ่าน API ทีหลัง (ดู README หัวข้อเทคโนโลยี)
export function WordCard({ term, translation, onClose }: WordCardProps) {
  return (
    <div className="word-card-backdrop" onClick={onClose}>
      <div className="word-card" onClick={(e) => e.stopPropagation()}>
        <div className="word-card-header">
          <strong>{term}</strong>
          <button className="word-card-speak" onClick={() => speak(term)} aria-label="ฟังเสียงคำ">
            🔊
          </button>
        </div>
        {translation ? (
          <>
            <p className="word-card-translation">
              {translation.th} <span className="word-card-pos">({translation.partOfSpeech})</span>
            </p>
            <p className="word-card-example">
              {translation.exampleSentence}{' '}
              <button className="word-card-speak" onClick={() => speak(translation.exampleSentence)} aria-label="ฟังเสียงประโยค">
                🔊
              </button>
            </p>
          </>
        ) : (
          <p className="word-card-translation word-card-unknown">
            ยังไม่มีคำแปลสำหรับคำนี้ในเดโม — คำที่เปิดดูแบบนี้จะเข้ารายการทวนของผู้ใช้
          </p>
        )}
        <button className="word-card-close" onClick={onClose}>
          ปิด
        </button>
      </div>
    </div>
  )
}
