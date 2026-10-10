import { useEffect, useState } from 'react'
import { getSettings, putSettings } from '../lib/db'
import { DEFAULT_SETTINGS, type Settings, type StoryGenre } from '../types'

const GENRES: { value: StoryGenre; label: string }[] = [
  { value: 'office-drama', label: 'ดราม่าที่ทำงาน' },
  { value: 'romance', label: 'โรแมนติก' },
  { value: 'mystery', label: 'สืบสวน' },
]

export function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    getSettings().then((s) => s && setSettings(s))
  }, [])

  async function save() {
    await putSettings(settings)
    setSaved(true)
    window.setTimeout(() => setSaved(false), 1500)
  }

  return (
    <div className="page">
      <h1>ตั้งค่า</h1>

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

      <label className="field">
        งบ API ต่อเดือน (USD)
        <input
          type="number"
          value={settings.monthlyBudgetUsd}
          onChange={(e) => setSettings({ ...settings, monthlyBudgetUsd: Number(e.target.value) })}
        />
      </label>

      <button className="button" onClick={save}>
        บันทึก
      </button>
      {saved && <p className="card-label">บันทึกแล้ว</p>}
    </div>
  )
}
