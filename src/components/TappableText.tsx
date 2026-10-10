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
                return (
                  <button
                    key={cIndex}
                    className={isTarget ? 'tappable-word tappable-word-target' : 'tappable-word'}
                    onClick={() => onWordTap(chunk, sentence)}
                  >
                    {chunk}
                  </button>
                )
              })}{' '}
            </span>
          ))}
        </p>
      ))}
    </>
  )
}
