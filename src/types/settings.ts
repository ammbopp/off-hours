import type { Accent } from './character'

export type StoryGenre = 'office-drama' | 'romance' | 'mystery'
export type FontSize = 'sm' | 'md' | 'lg'
export type ThemePreference = 'system' | 'light' | 'dark'
export type ReadingFont = 'sans' | 'serif'
// โทนพื้นหลังเฉพาะหน้าอ่าน (ต่างจาก theme ของทั้งแอป) ตามแบบแอปอ่านหนังสือทั่วไป (Kindle/Apple Books)
// ที่แยกโทนสีสบายตาสำหรับอ่านยาวๆ ออกจากธีมสีของ UI โดยรวม
export type ReadingTheme = 'paper' | 'white' | 'sepia' | 'gray' | 'night'
export type NarrationRate = 0.75 | 1 | 1.25

export interface Settings {
  level: string // ระดับภาษาที่ประเมินตอนตั้งค่าครั้งแรก
  toeicGoal: number | null // เป้าคะแนน TOEIC
  industry: string // สายงาน
  genre: StoryGenre // แนวเรื่องที่ชอบ
  monthlyBudgetUsd: number // เพดานค่าใช้จ่าย API ต่อเดือน
  fontSize: FontSize
  theme: ThemePreference
  readingFont: ReadingFont
  readingTheme: ReadingTheme
  readingFontSize: FontSize // ขนาดตัวอักษรเฉพาะหน้าอ่าน แยกจาก fontSize ของทั้งแอป ไม่กระทบหน้าอื่น
  narratorAccent: Accent // สำเนียงเสียงบรรยายในหน้าอ่าน (คนละอย่างกับ accent ของแต่ละตัวละครในแชท)
  narrationRate: NarrationRate // ความเร็วเสียงบรรยายเริ่มต้น จำค่าที่ปรับล่าสุดในหน้าอ่านไว้
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
  readingFont: 'serif',
  readingTheme: 'paper',
  readingFontSize: 'md',
  narratorAccent: 'US',
  narrationRate: 1,
  onboardingComplete: false,
}
