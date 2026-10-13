// คลังคำที่มา — ดู README ส่วน "ระบบคำศัพท์เบื้องหลัง"
export type WordSource = 'NGSL' | 'TSL' | 'BSL' | 'custom'

// สถานะสี่ขั้น: ใหม่ → เคยเห็น → จำได้ → ใช้เป็น
export type WordStatus = 'new' | 'seen' | 'remembered' | 'mastered'

export type EncounterMode = 'read' | 'chat' | 'quest' | 'call'

export type EncounterResult = 'looked_up' | 'answered_correctly' | 'used_correctly'

export interface WordEncounter {
  mode: EncounterMode
  episodeId?: string
  characterId?: string // สำหรับ mode 'chat'/'call' — ใช้คำนี้ในบทสนทนากับตัวละครไหน
  at: string // ISO date
  result: EncounterResult
}

export interface Word {
  id: string // = ตัวคำตัวพิมพ์เล็ก — หนึ่งคำมีรายการเดียวเสมอ แม้จะอยู่หลายคลัง (TSL กับ BSL ซ้ำกัน 575 คำ)
  term: string
  // คลังที่คำนี้อยู่ คำเดียวกันอยู่ได้หลายคลัง จึงเก็บเป็นรายการ ไม่ใช่ค่าเดียว
  sources: WordSource[]
  // รูปแปรทั้งหมดของคำนี้ (รวมตัวคำเอง) ใช้จับคู่คำที่ผันรูปในเนื้อเรื่อง เช่น "approving" → "approve"
  forms: string[]
  // คำนิยามภาษาอังกฤษแบบง่ายจากคลังต้นทาง มีเฉพาะ NGSL กับ TSL (BSL ไม่มีไฟล์คำนิยาม)
  definition?: string
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
