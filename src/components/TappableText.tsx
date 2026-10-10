import type { ParsedParagraph, ParsedSentence } from '../features/reading/text'
import './TappableText.css'

interface TappableTextProps {
  paragraphs: ParsedParagraph[]
  targetTerms?: Set<string> // ตัวพิมพ์เล็กทั้งหมด ใช้ขีดเส้นใต้คำเป้าหมาย
  activeSentenceIndex?: number | null // ประโยคที่เสียงบรรยายกำลังอ่าน
  onWordTap: (term: string, sentence: ParsedSentence) => void
}

// รวมอักษรละตินมีเครื่องหมายกำกับ เพื่อให้คำอย่าง café เป็นคำเดียว ไม่ถูกตัดเป็น "caf" + "é"
const WORD_PATTERN = /([A-Za-zÀ-ÖØ-öø-ÿ']+)/g

// แยกข้อความเป็นคำที่แตะได้ ใช้ทั้งในหน้าอ่านนิยายและหน้าแชท
// แต่ละประโยคห่อด้วย <span data-sentence> เพื่อไฮไลต์ตอนฟังเสียงและเลื่อนกลับไปจุดที่อ่านค้างไว้
export function TappableText({ paragraphs, targetTerms, activeSentenceIndex, onWordTap }: TappableTextProps) {
  return (
    <>
      {paragraphs.map((paragraph, pIndex) => (
        <p key={pIndex} className="tappable-paragraph">
          {paragraph.sentences.map((sentence) => (
            <span
              key={sentence.index}
              id={`sentence-${sentence.index}`}
              data-sentence={sentence.index}
              className={sentence.index === activeSentenceIndex ? 'sentence sentence-active' : 'sentence'}
            >
              {sentence.text.split(WORD_PATTERN).map((chunk, cIndex) => {
                if (!/^[A-Za-zÀ-ÖØ-öø-ÿ']+$/.test(chunk)) {
                  return <span key={cIndex}>{chunk}</span>
                }
                const isTarget = targetTerms?.has(chunk.toLowerCase())
                // span ไม่ใช่ button โดยตั้งใจ: <button> ใน Chrome/Safari ยังคงพฤติกรรม "กล่อง atomic"
                // ที่ยอมให้ตัดขึ้นบรรทัดใหม่ได้ที่ขอบของมันแม้ตั้ง display:inline + appearance:none แล้วก็ตาม
                // (ปัญหานี้ทำให้เครื่องหมายวรรคตอนท้ายคำ เช่น "Friday." หลุดไปขึ้นบรรทัดใหม่เอง)
                // span + role="button" ให้ผลลัพธ์แบบ inline จริงๆ โดยยังกด Enter/Space ได้เหมือน button
                return (
                  <span
                    key={cIndex}
                    role="button"
                    tabIndex={0}
                    className={isTarget ? 'tappable-word tappable-word-target' : 'tappable-word'}
                    onClick={() => onWordTap(chunk, sentence)}
                    onKeyDown={(e) => {
                      if (e.key !== 'Enter' && e.key !== ' ') return
                      e.preventDefault()
                      onWordTap(chunk, sentence)
                    }}
                  >
                    {chunk}
                  </span>
                )
              })}{' '}
            </span>
          ))}
        </p>
      ))}
    </>
  )
}
