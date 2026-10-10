export interface ParsedSentence {
  index: number // ลำดับประโยคทั้งตอน ใช้ไฮไลต์ตอนฟังเสียงบรรยายและจำว่าอ่านค้างไว้ตรงไหน
  text: string
}

export interface ParsedParagraph {
  sentences: ParsedSentence[]
}

export interface ParsedText {
  paragraphs: ParsedParagraph[]
  sentences: ParsedSentence[] // ประโยคทั้งหมดเรียงต่อกัน สำหรับเล่นเสียงทีละประโยค
}

// ตัดประโยคที่ . ! ? (รวมอัญประกาศปิดที่ตามมา) เมื่อตามด้วยช่องว่างแล้วขึ้นต้นประโยคใหม่หรือจบย่อหน้า
// ไม่รองรับคำย่อที่มีจุด (เช่น Mr.) ซึ่งเนื้อเรื่องของเราเลี่ยงอยู่แล้ว
const SENTENCE_END = /[.!?]+["'”’)\]]*(?=\s+(?:[A-Z"'“‘]|$))|[.!?]+["'”’)\]]*$/g

function splitSentences(paragraph: string): string[] {
  const parts: string[] = []
  let start = 0
  let match: RegExpExecArray | null

  SENTENCE_END.lastIndex = 0
  while ((match = SENTENCE_END.exec(paragraph)) !== null) {
    const end = match.index + match[0].length
    const sentence = paragraph.slice(start, end).trim()
    if (sentence) parts.push(sentence)
    start = end
  }

  const rest = paragraph.slice(start).trim()
  if (rest) parts.push(rest)

  return parts
}

export function parseText(content: string): ParsedText {
  const sentences: ParsedSentence[] = []
  const paragraphs: ParsedParagraph[] = content
    .split(/\n\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => ({
      sentences: splitSentences(paragraph).map((text) => {
        const sentence: ParsedSentence = { index: sentences.length, text }
        sentences.push(sentence)
        return sentence
      }),
    }))

  return { paragraphs, sentences }
}
