// คลังคำที่มา — ดู README ส่วน "ระบบคำศัพท์เบื้องหลัง"
export type WordSource = 'NGSL' | 'TSL' | 'BSL' | 'custom'

// สถานะสี่ขั้น: ใหม่ → เคยเห็น → จำได้ → ใช้เป็น
export type WordStatus = 'new' | 'seen' | 'remembered' | 'mastered'

export type EncounterMode = 'read' | 'chat' | 'quest' | 'call'

export type EncounterResult = 'looked_up' | 'answered_correctly' | 'used_correctly'

export interface WordEncounter {
  mode: EncounterMode
  episodeId?: string
  at: string // ISO date
  result: EncounterResult
}

export interface Word {
  id: string
  term: string
  source: WordSource
  status: WordStatus
  nextReviewAt: string | null // ISO date, null = ยังไม่เข้าตารางทวน
  encounters: WordEncounter[]
  // ค่าสำหรับตัวคำนวณรอบทวน (placeholder จนกว่าจะต่อ FSRS จริง — ดู lib/srs)
  srs: {
    stability: number
    difficulty: number
    reps: number
    lastReviewedAt: string | null
  }
}
