export type CharacterRelation = 'coworker' | 'bestfriend' | 'partner'

export type Accent = 'US' | 'UK' | 'AU' | 'CA'

export interface Character {
  id: string
  name: string
  relation: CharacterRelation
  persona: string // บุคลิก
  systemPrompt: string // คำสั่งประจำตัวสำหรับโมเดลภาษา
  accent: Accent
  voiceId?: string // รหัสเสียงของผู้ให้บริการ TTS เมื่อต่อจริง
}
