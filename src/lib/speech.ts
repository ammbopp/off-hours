import type { Accent } from '../types'

// สำเนียงเสียงพูดมีแค่ 4 แบบตาม Character.accent/Settings.narratorAccent — ใช้ map เดียวกันทั้งแอป
// กันไม่ให้ค่า BCP-47 ของแต่ละสำเนียงกระจายเขียนซ้ำหลายจุด
export const ACCENT_LANG: Record<Accent, string> = {
  US: 'en-US',
  UK: 'en-GB',
  AU: 'en-AU',
  CA: 'en-CA',
}

// อ่านออกเสียงข้อความภาษาอังกฤษสั้นๆ ด้วยเสียงสังเคราะห์ของเบราว์เซอร์ — ใช้ร่วมกันทั้งการ์ดคำศัพท์
// และการ์ดทบทวนคำที่หน้าแรก แทนที่จะประกาศ SpeechSynthesisUtterance แยกกันในแต่ละจุด
export function speak(text: string, accent: Accent = 'US'): void {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = ACCENT_LANG[accent]
  window.speechSynthesis.speak(utterance)
}
