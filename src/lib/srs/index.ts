import type { Word, WordEncounter, WordStatus } from '../../types'
import { isTargetable } from '../wordlists/import'

// รอบทวนแบบย่อ (fixed-interval) ไว้ใช้ก่อน — ตามแผนให้เปลี่ยนเป็นอัลกอริทึม FSRS จริง
// (เช่นไลบรารี ts-fsrs) เมื่อมีข้อมูลการทวนมากพอให้ปรับพารามิเตอร์ ดู README หัวข้อ "ระบบคำศัพท์เบื้องหลัง"
const INTERVALS_BY_REPS_DAYS = [1, 3, 7, 14, 30]

function nextStatus(current: WordStatus, encounter: WordEncounter): WordStatus {
  if (encounter.result === 'looked_up') return current === 'new' ? 'seen' : current
  if (encounter.result === 'answered_correctly') return current === 'mastered' ? current : 'remembered'
  if (encounter.result === 'used_correctly') return 'mastered'
  return current
}

// เรียกทุกครั้งที่คำถูกเจอในนิยาย แชท ภารกิจ หรือสาย แล้วบันทึกคำที่คืนมาด้วย putWord
export function recordEncounter(word: Word, encounter: WordEncounter): Word {
  const reps = word.srs.reps + 1
  const intervalDays = INTERVALS_BY_REPS_DAYS[Math.min(reps - 1, INTERVALS_BY_REPS_DAYS.length - 1)]
  const nextReviewAt = new Date(Date.now() + intervalDays * 24 * 60 * 60 * 1000).toISOString()

  return {
    ...word,
    status: nextStatus(word.status, encounter),
    nextReviewAt,
    encounters: [...word.encounters, encounter],
    srs: {
      ...word.srs,
      reps,
      lastReviewedAt: encounter.at,
    },
  }
}

// เลือกคำเป้าหมาย 8–12 คำสำหรับตอนถัดไป: คำที่ถึงรอบทวนก่อน แล้วเติมด้วยคำใหม่
// เฉพาะ TSL/BSL เท่านั้น เพราะ NGSL เป็นฐาน "คำที่ถือว่ารู้แล้ว" ไว้คุมระดับภาษา ไม่ใช่คำที่ต้องสอน (ดู README)
export function pickTargetWords(allWords: Word[], count = 10): Word[] {
  const targetable = allWords.filter(isTargetable)
  const now = new Date().toISOString()
  const due = targetable
    .filter((w) => w.nextReviewAt !== null && w.nextReviewAt <= now)
    .sort((a, b) => (a.nextReviewAt ?? '').localeCompare(b.nextReviewAt ?? ''))
  const fresh = targetable.filter((w) => w.status === 'new')

  return [...due, ...fresh].slice(0, count)
}
