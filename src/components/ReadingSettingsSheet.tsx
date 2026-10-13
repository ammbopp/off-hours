import { CheckIcon } from './icons'
import type { FontSize, ReadingFont, ReadingTheme } from '../types'
import './WordCard.css'

interface ReadingSettingsSheetProps {
  readingFontSize: FontSize
  readingFont: ReadingFont
  readingTheme: ReadingTheme
  onReadingFontSizeChange: (value: FontSize) => void
  onReadingFontChange: (value: ReadingFont) => void
  onReadingThemeChange: (value: ReadingTheme) => void
  onClose: () => void
}

const FONT_SIZES: { value: FontSize; label: string }[] = [
  { value: 'sm', label: 'เล็ก' },
  { value: 'md', label: 'กลาง' },
  { value: 'lg', label: 'ใหญ่' },
]

const READING_THEMES: { value: ReadingTheme; label: string; swatch: string }[] = [
  { value: 'paper', label: 'กระดาษ', swatch: '#f6efe1' },
  { value: 'white', label: 'ขาว', swatch: '#ffffff' },
  { value: 'sepia', label: 'เซเปีย', swatch: '#f1e2c0' },
  { value: 'gray', label: 'เทา', swatch: '#d9d9d9' },
  { value: 'night', label: 'กลางคืน', swatch: '#000000' },
]

// แผงปรับความสบายตาของหน้าอ่าน — ขนาดตัวอักษร รูปแบบตัวอักษร และสีพื้นหลัง แยกจากธีมสีของทั้งแอป
// เหมือนปุ่ม "Aa" ในแอปอ่านหนังสือทั่วไป เพื่อให้ผู้ใช้ปรับได้ทันทีระหว่างอ่านโดยไม่ต้องออกไปหน้าตั้งค่า
export function ReadingSettingsSheet({
  readingFontSize,
  readingFont,
  readingTheme,
  onReadingFontSizeChange,
  onReadingFontChange,
  onReadingThemeChange,
  onClose,
}: ReadingSettingsSheetProps) {
  return (
    <div className="word-card-backdrop" onClick={onClose}>
      <div className="word-card reading-settings-sheet" onClick={(e) => e.stopPropagation()}>
        <span className="word-card-handle" aria-hidden />
        <div className="word-card-header">
          <strong>ตัวอักษรและพื้นหลัง</strong>
        </div>

        <label className="field">
          ขนาดตัวอักษร
          <div className="segmented">
            {FONT_SIZES.map((f) => (
              <button
                key={f.value}
                className={readingFontSize === f.value ? 'button button-selected' : 'button button-outline'}
                onClick={() => onReadingFontSizeChange(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </label>

        <label className="field">
          รูปแบบตัวอักษร
          <div className="segmented">
            <button
              className={readingFont === 'sans' ? 'button button-selected reading-font-sample' : 'button button-outline reading-font-sample'}
              style={{ fontFamily: 'var(--font-sans)' }}
              onClick={() => onReadingFontChange('sans')}
            >
              Aa มาตรฐาน
            </button>
            <button
              className={readingFont === 'serif' ? 'button button-selected reading-font-sample' : 'button button-outline reading-font-sample'}
              style={{ fontFamily: 'var(--font-reading)' }}
              onClick={() => onReadingFontChange('serif')}
            >
              Aa มีเชิง
            </button>
          </div>
        </label>

        <label className="field" style={{ marginBottom: 0 }}>
          สีพื้นหลัง
          <div className="reading-theme-swatches">
            {READING_THEMES.map((t) => (
              <button
                key={t.value}
                className={readingTheme === t.value ? 'reading-swatch reading-swatch-active' : 'reading-swatch'}
                style={{ background: t.swatch }}
                onClick={() => onReadingThemeChange(t.value)}
                aria-label={t.label}
                title={t.label}
              >
                {readingTheme === t.value && <CheckIcon size={16} />}
              </button>
            ))}
          </div>
        </label>

        <button className="word-card-close" onClick={onClose}>
          เสร็จแล้ว
        </button>
      </div>
    </div>
  )
}
