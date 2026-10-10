export type StoryGenre = 'office-drama' | 'romance' | 'mystery'

export interface Settings {
  level: string // ระดับภาษาที่ประเมินตอนตั้งค่าครั้งแรก
  toeicGoal: number | null // เป้าคะแนน TOEIC
  industry: string // สายงาน
  genre: StoryGenre // แนวเรื่องที่ชอบ
  monthlyBudgetUsd: number // เพดานค่าใช้จ่าย API ต่อเดือน
}

export const DEFAULT_SETTINGS: Settings = {
  level: '',
  toeicGoal: null,
  industry: '',
  genre: 'office-drama',
  monthlyBudgetUsd: 20,
}
