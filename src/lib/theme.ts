import type { FontSize, ThemePreference } from '../types'

// เขียนลง <html> โดยตรง (ไม่ผ่าน React) เพื่อให้ใช้ได้ตั้งแต่ก่อนหน้าแอปโหลดเสร็จ และกระทบทุกหน้าโดยไม่ต้องส่งผ่าน props
export function applyPreferences(prefs: { theme: ThemePreference; fontSize: FontSize }): void {
  const root = document.documentElement

  if (prefs.theme === 'system') root.removeAttribute('data-theme')
  else root.setAttribute('data-theme', prefs.theme)

  root.setAttribute('data-font-size', prefs.fontSize)
}
