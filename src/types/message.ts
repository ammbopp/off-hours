export type MessageSender = 'user' | 'character'

export interface LanguageTip {
  original: string
  suggestion: string
  note?: string
}

export interface Message {
  id: string
  characterId: string
  sender: MessageSender
  content: string
  createdAt: string // ISO date
  languageTips?: LanguageTip[] // แนบเฉพาะข้อความของผู้ใช้
  audioUrl?: string // สำหรับข้อความเสียง
}
