import type { Word } from '../../types'

export interface WordIndex {
  byTerm: Map<string, Word> // คำตั้งต้น
  byForm: Map<string, Word> // รูปแปร เช่น "approving" → approve
}

// สร้างดัชนีครั้งเดียวตอนเปิดหน้าอ่าน เพื่อให้แตะคำที่ผันรูปแล้วยังหาคำนิยามเจอ
export function buildWordIndex(words: Word[]): WordIndex {
  const byTerm = new Map<string, Word>()
  const byForm = new Map<string, Word>()

  for (const word of words) {
    const term = word.term.toLowerCase()
    if (!byTerm.has(term)) byTerm.set(term, word)

    for (const form of word.forms) {
      if (!byForm.has(form)) byForm.set(form, word)
    }
  }

  return { byTerm, byForm }
}

// คลังคำเก็บรูปแปรไว้เฉพาะรูปที่พบบ่อย จึงยังมีคำผันที่หาไม่เจอ (เช่น hums, exhales, nodding)
// กฎตัดท้ายคำง่ายๆ ชุดนี้ใช้เป็นทางเลือกสุดท้ายเท่านั้น หลังจากหาจากคำตั้งต้นและรูปแปรจริงไม่เจอแล้ว
const SUFFIX_RULES: [RegExp, string][] = [
  [/ies$/, 'y'],
  [/ied$/, 'y'],
  [/ves$/, 'f'],
  [/es$/, ''],
  [/s$/, ''],
  [/ed$/, ''],
  [/ed$/, 'e'],
  [/ing$/, ''],
  [/ing$/, 'e'],
  [/er$/, ''],
  [/est$/, ''],
  [/ly$/, ''],
]

function* stemCandidates(term: string): Generator<string> {
  for (const [pattern, replacement] of SUFFIX_RULES) {
    if (!pattern.test(term)) continue
    const base = term.replace(pattern, replacement)
    if (base.length < 2) continue
    yield base
    // พยัญชนะซ้อนท้ายคำ เช่น running → runn → run
    if (/([b-df-hj-np-tv-z])\1$/.test(base)) yield base.slice(0, -1)
  }
}

// คำตั้งต้นมาก่อนรูปแปรเสมอ เช่น "leaves" ควรเป็น leave/leaf ตามที่เป็นคำตั้งต้นจริง ไม่ใช่รูปแปรของคำอื่น
export function lookupWord(index: WordIndex, term: string): Word | undefined {
  const key = term.toLowerCase()
  const exact = index.byTerm.get(key) ?? index.byForm.get(key)
  if (exact) return exact

  for (const candidate of stemCandidates(key)) {
    const match = index.byTerm.get(candidate) ?? index.byForm.get(candidate)
    if (match) return match
  }

  return undefined
}
