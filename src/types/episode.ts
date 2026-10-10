export interface ContextualTranslation {
  th: string
  partOfSpeech: string
  exampleSentence: string
}

export type QuestQuestionType = 'fill-blank' | 'choose-reply' | 'listen-schedule' | 'match'

export interface QuestQuestion {
  id: string
  type: QuestQuestionType
  prompt: string
  choices?: string[]
  answer: string
  relatedWordIds: string[]
}

export interface Quest {
  questions: QuestQuestion[]
}

export interface Episode {
  id: string
  order: number
  title: string
  content: string // เนื้อเรื่องตอนนี้ (plain text)
  targetWordIds: string[]
  contextualTranslations: Record<string, ContextualTranslation> // key = wordId
  quest: Quest
  summary: string // ใช้เป็นบริบทตอนสร้างตอนถัดไป
  audioUrl?: string
}
