import './TappableText.css'

interface TappableTextProps {
  text: string
  targetTerms?: Set<string> // ตัวพิมพ์เล็กทั้งหมด ใช้ขีดเส้นใต้คำเป้าหมาย
  onWordTap: (term: string) => void
}

const WORD_PATTERN = /([a-zA-Z']+)/g

// แยกข้อความเป็นคำที่แตะได้ ใช้ทั้งในหน้าอ่านนิยายและหน้าแชท
// TODO: แยกพฤติกรรม "แตะ" (คำเป้าหมาย/คำที่รู้) กับ "แตะค้าง" (คำอื่นที่อยากดูคำแปล) ตามแผน
export function TappableText({ text, targetTerms, onWordTap }: TappableTextProps) {
  return (
    <>
      {text.split(/\n\n+/).map((paragraph, pIndex) => (
        <p key={pIndex} className="tappable-paragraph">
          {paragraph.split(WORD_PATTERN).map((chunk, cIndex) => {
            if (!/^[a-zA-Z']+$/.test(chunk)) {
              return <span key={cIndex}>{chunk}</span>
            }
            const isTarget = targetTerms?.has(chunk.toLowerCase())
            return (
              <button
                key={cIndex}
                className={isTarget ? 'tappable-word tappable-word-target' : 'tappable-word'}
                onClick={() => onWordTap(chunk)}
              >
                {chunk}
              </button>
            )
          })}
        </p>
      ))}
    </>
  )
}
