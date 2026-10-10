export type StoryGenre = 'office-drama' | 'romance' | 'mystery'
export type FontSize = 'sm' | 'md' | 'lg'
export type ThemePreference = 'system' | 'light' | 'dark'

export interface Settings {
  level: string // ระดับภาษาที่ประเมินตอนตั้งค่าครั้งแรก
  toeicGoal: number | null // เป้าคะแนน TOEIC
  industry: string // สายงาน
  genre: StoryGenre // แนวเรื่องที่ชอบ
  monthlyBudgetUsd: number // เพดานค่าใช้จ่าย API ต่อเดือน
  fontSize: FontSize
  theme: ThemePreference
  onboardingComplete: boolean // ผ่านหน้าตั้งค่าครั้งแรก + วัดระดับคำศัพท์แล้วหรือยัง
}

export const DEFAULT_SETTINGS: Settings = {
  level: '',
  toeicGoal: null,
  industry: '',
  genre: 'office-drama',
  monthlyBudgetUsd: 20,
  fontSize: 'md',
  theme: 'system',
  onboardingComplete: false,
}
