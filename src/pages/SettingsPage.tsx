import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getSettings, putSettings } from '../lib/db'
import { applyPreferences } from '../lib/theme'
import { ChevronRightIcon, VocabIcon } from '../components/icons'
import { DEFAULT_SETTINGS, type FontSize, type Settings, type StoryGenre, type ThemePreference } from '../types'

const GENRES: { value: StoryGenre; label: string }[] = [
  { value: 'office-drama', label: 'ดราม่าที่ทำงาน' },
  { value: 'romance', label: 'โรแมนติก' },
  { value: 'mystery', label: 'สืบสวน' },
]

const FONT_SIZES: { value: FontSize; label: string }[] = [
  { value: 'sm', label: 'เล็ก' },
  { value: 'md', label: 'กลาง' },
  { value: 'lg', label: 'ใหญ่' },
]

const THEMES: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'ตามระบบ' },
  { value: 'light', label: 'สว่าง' },
  { value: 'dark', label: 'มืด' },
]

export function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [saved, setSaved] = useState(false)
  const loadedRef = useRef(false)
  const settingsRef = useRef(settings)
  settingsRef.current = settings

  useEffect(() => {
    getSettings().then((s) => {
      if (s) setSettings(s)
      loadedRef.current = true
    })
  }, [])

  async function save() {
    await putSettings(settings)
    setSaved(true)
    window.setTimeout(() => setSaved(false), 1500)
  }

  // หน้าตาแอป (ขนาดตัวอักษร/โหมดสี) ใช้ผลทันทีและบันทึกทันที ไม่ต้องรอกดปุ่มบันทึก ต่างจากฟิลด์โปรไฟล์ด้านล่าง
  // ใช้ effect แยกจาก onClick (แทนการคำนวณ next = {...settings, ...} ในตัว handler ตรงๆ) เพราะถ้าผู้ใช้
  // กดสองปุ่มติดกันเร็วๆ React อาจรวมเป็น batch เดียว ทำให้ handler ตัวที่สองยังอ่าน settings ค่าเก่า
  // แล้วเขียนทับค่าที่ตัวแรกเพิ่งตั้งไว้ — settingsRef ใช้อ่านค่าล่าสุดตอนบันทึกโดยไม่ทำให้ effect นี้
  // ยิงซ้ำทุกครั้งที่ฟิลด์อื่น (เช่น ระดับภาษา) เปลี่ยน เพราะ deps มีแค่ theme/fontSize
  const { theme, fontSize } = settings
  useEffect(() => {
    if (!loadedRef.current) return
    applyPreferences({ theme, fontSize })
    void putSettings(settingsRef.current)
  }, [theme, fontSize])

  return (
    <div className="page">
      <h1>ตั้งค่า</h1>

      <section className="card">
        <h3>หน้าตาแอป</h3>
        <label className="field">
          ขนาดตัวอักษร
          <div className="segmented">
            {FONT_SIZES.map((f) => (
              <button
                key={f.value}
                className={settings.fontSize === f.value ? 'button button-selected' : 'button button-outline'}
                onClick={() => setSettings((prev) => ({ ...prev, fontSize: f.value }))}
              >
                {f.label}
              </button>
            ))}
          </div>
        </label>
        <label className="field" style={{ marginBottom: 0 }}>
          โหมดสี
          <div className="segmented">
            {THEMES.map((t) => (
              <button
                key={t.value}
                className={settings.theme === t.value ? 'button button-selected' : 'button button-outline'}
                onClick={() => setSettings((prev) => ({ ...prev, theme: t.value }))}
              >
                {t.label}
              </button>
            ))}
          </div>
        </label>
      </section>

      <section className="card">
        <h3>โปรไฟล์</h3>
        <label className="field">
          ระดับภาษา
          <input
            value={settings.level}
            onChange={(e) => setSettings({ ...settings, level: e.target.value })}
            placeholder="เช่น กลาง, B1, เทียบ TOEIC 600"
          />
        </label>

        <label className="field">
          เป้าคะแนน TOEIC
          <input
            type="number"
            value={settings.toeicGoal ?? ''}
            onChange={(e) => setSettings({ ...settings, toeicGoal: e.target.value ? Number(e.target.value) : null })}
          />
        </label>

        <label className="field">
          สายงาน
          <input
            value={settings.industry}
            onChange={(e) => setSettings({ ...settings, industry: e.target.value })}
            placeholder="เช่น ที่ปรึกษาธุรกิจ, การตลาด"
          />
        </label>

        <label className="field">
          แนวเรื่องที่ชอบ
          <select
            value={settings.genre}
            onChange={(e) => setSettings({ ...settings, genre: e.target.value as StoryGenre })}
          >
            {GENRES.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field" style={{ marginBottom: 0 }}>
          งบ API ต่อเดือน (USD)
          <input
            type="number"
            value={settings.monthlyBudgetUsd}
            onChange={(e) => setSettings({ ...settings, monthlyBudgetUsd: Number(e.target.value) })}
          />
        </label>
      </section>

      <button className="button" onClick={save} style={{ width: '100%' }}>
        บันทึก
      </button>
      {saved && <p className="card-label" style={{ textAlign: 'center', marginTop: 8 }}>บันทึกแล้ว</p>}

      <h3 style={{ marginTop: 28 }}>คำศัพท์</h3>
      <Link to="/onboarding" className="list-row">
        <span className="avatar avatar-sm" aria-hidden>
          <VocabIcon size={16} />
        </span>
        <span className="list-row-text">
          <strong>ประเมินคำศัพท์อีกครั้ง</strong>
          <span className="list-row-sub">เลือกคำที่รู้แล้วจากตัวอย่างใหม่ เพื่อข้ามคำเหล่านั้นจากรอบทวน</span>
        </span>
        <ChevronRightIcon size={18} className="list-row-chevron" />
      </Link>
    </div>
  )
}
