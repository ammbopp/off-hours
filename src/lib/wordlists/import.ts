import type { Word, WordSource } from '../../types'

// id คือตัวคำตัวพิมพ์เล็ก ไม่ผูกกับคลัง เพราะคำเดียวกันอยู่ได้หลายคลัง (TSL กับ BSL ซ้ำกัน 575 คำ)
// ถ้าผูก id กับคลัง สถานะการเรียนรู้ของคำเดียวกันจะถูกแยกเป็นสองรายการ
export function makeWordId(term: string): string {
  return term.toLowerCase()
}

export function makeBlankWord(term: string, sources: WordSource[], forms?: string[]): Word {
  return {
    id: makeWordId(term),
    term: term.toLowerCase(),
    sources,
    forms: forms ?? [term.toLowerCase()],
    status: 'new',
    nextReviewAt: null,
    encounters: [],
    srs: { stability: 0, difficulty: 0, reps: 0, lastReviewedAt: null },
  }
}

// คำนี้เป็นคำที่ "ต้องสอน" หรือไม่ — NGSL คือฐานที่ถือว่ารู้แล้ว ใช้คุมระดับภาษาเท่านั้น
export function isTargetable(word: Word): boolean {
  return word.sources.includes('TSL') || word.sources.includes('BSL')
}

export interface ParsedWordList {
  words: Word[] // หนึ่งรายการต่อหนึ่งคำตั้งต้น (lemma/headword) ของคลังนี้
  formsByTerm: Record<string, string[]> // headword (ตัวพิมพ์เล็ก) → รูปแปรทั้งหมดบนบรรทัดเดียวกัน (รวม headword เอง)
}

// รูปแบบไฟล์จริงจาก NGSL Project (ไฟล์ "lemmatized for teaching" — ดู data/wordlists/README.md):
// บรรทัดขึ้นต้นด้วย ## คือคอมเมนต์ ไม่มีหัวตาราง แต่ละบรรทัดข้อมูลคือ "คำตั้งต้น,รูปแปร1,รูปแปร2,..."
// เช่น "do,does,don,doesn,did,didn,doing,done,doin" — ตั้งใจแยกรูปย่อของคำปฏิเสธ/กริยาช่วยไว้ด้วย
// (เทียบ src/features/story/validateEpisode.ts ที่แยกคำที่เครื่องหมายอะพอสโทรฟี เพื่อให้ "don't" จับคู่กับ "don" + "t" ได้)
export function parseWordListCsv(csvText: string, source: WordSource): ParsedWordList {
  const words: Word[] = []
  const formsByTerm: Record<string, string[]> = {}

  for (const rawLine of csvText.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('##')) continue

    const forms = line
      .split(',')
      .map((f) => f.trim().toLowerCase())
      .filter(Boolean)
    const headword = forms[0]
    if (!headword) continue

    words.push(makeBlankWord(headword, [source], forms))
    formsByTerm[headword] = forms
  }

  return { words, formsByTerm }
}

// รวมรูปแปรทั้งหมดของทุกคำในคลังเป็นชุดเดียว ใช้เป็นฐาน "คำที่รู้แล้ว" (knownVocabulary) ของ validateEpisode
export function collectAllForms(parsed: ParsedWordList): Set<string> {
  const all = new Set<string>()
  for (const forms of Object.values(parsed.formsByTerm)) {
    for (const f of forms) all.add(f)
  }
  return all
}
