import type { Word, WordSource } from '../../types'

function makeWordId(source: WordSource, term: string): string {
  return `${source}:${term.toLowerCase()}`
}

export function makeBlankWord(term: string, source: WordSource): Word {
  return {
    id: makeWordId(source, term),
    term,
    source,
    status: 'new',
    nextReviewAt: null,
    encounters: [],
    srs: { stability: 0, difficulty: 0, reps: 0, lastReviewedAt: null },
  }
}

// TODO: ปรับตามคอลัมน์จริงของไฟล์ที่ดาวน์โหลดมา (ดู data/wordlists/README.md)
// สมมติไว้ก่อนว่าแต่ละบรรทัดคือหนึ่งคำ ไม่มีหัวตาราง
export function parseWordListCsv(csvText: string, source: WordSource): Word[] {
  return csvText
    .split(/\r?\n/)
    .map((line) => line.split(',')[0]?.trim())
    .filter((term): term is string => Boolean(term))
    .map((term) => makeBlankWord(term, source))
}
