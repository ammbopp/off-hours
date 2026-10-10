import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllWords, getSettings, putSettings, putWord } from '../lib/db'
import { applyPreferences } from '../lib/theme'
import { isTargetable } from '../lib/wordlists/import'
import { DEFAULT_SETTINGS, type Settings, type StoryGenre, type Word } from '../types'

const GENRES: { value: StoryGenre; label: string }[] = [
  { value: 'office-drama', label: 'ดราม่าที่ทำงาน' },
  { value: 'romance', label: 'โรแมนติก' },
  { value: 'mystery', label: 'สืบสวน' },
]

const CALIBRATION_SAMPLE_SIZE = 24

function pickCalibrationSample(words: Word[]): Word[] {
  const pool = words.filter(isTargetable)
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, CALIBRATION_SAMPLE_SIZE)
}

interface OnboardingPageProps {
  // เรียกหลังบันทึกเสร็จ — หน้าแรกที่เปิดแอปครั้งแรกใช้สลับไปแสดงแอปจริง (ไม่ผ่าน router เพราะยังไม่ได้ขึ้น Routes)
  // ถ้าเข้าหน้านี้เองทีหลัง (ทำแบบประเมินใหม่จากหน้าตั้งค่า) จะไม่ส่ง prop นี้มา แล้วใช้ navigate กลับแทน
  onComplete?: () => void
}

// วัดระดับครั้งแรก (~3 นาที): ตั้งค่าโปรไฟล์สั้นๆ แล้วให้เลือกคำที่รู้แล้วจากตัวอย่าง
// คำที่เลือกจะถูกข้ามจากรอบทวน (status: mastered) ตามที่แผนกำหนด — ไม่ใช่ "encounter" ในโหมดใดโหมดหนึ่ง จึงไม่บันทึกลง encounters
export function OnboardingPage({ onComplete }: OnboardingPageProps) {
  const navigate = useNavigate()
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [sample, setSample] = useState<Word[] | null>(null)
  const [saving, setSaving] = useState(false)
  // known เป็น ref ธรรมดา ไม่ใช่ React state: การอัปเดต state (setXxx) ถูก React "แบตช์" รวมกันก่อนค่อย
  // re-render จริง ถ้าผู้ใช้แตะคำสุดท้ายแล้วแตะปุ่ม "เริ่มใช้แอป" ในแบตช์เดียวกัน finish() ที่ผูกไว้ตอน
  // render ก่อนหน้าจะยังอ่าน known เป็นค่าว่างอยู่ (เพราะยังไม่ re-render) แม้จะอ่านผ่าน ref เฉยๆ ก็ไม่ช่วย
  // ถ้า ref นั้นถูกซิงก์จาก state ตอน render เหมือนกัน — ต้องมัดเดต ref ตรงๆ ในตัว handler เท่านั้น
  // จึงสะท้อนค่าล่าสุดได้ทันทีโดยไม่ต้องรอ re-render เลย ส่วน knownVersion ใช้แค่สั่งให้ re-render
  // เพื่ออัปเดตการไฮไลต์ชิปที่เลือกแล้วเท่านั้น ไม่ได้เป็นที่เก็บข้อมูลจริง
  const knownRef = useRef<Set<string>>(new Set())
  const [knownVersion, setKnownVersion] = useState(0)
  const settingsRef = useRef(settings)
  settingsRef.current = settings

  useEffect(() => {
    getSettings().then((s) => s && setSettings(s))
    getAllWords().then((words) => setSample(pickCalibrationSample(words)))
  }, [])

  const knownCount = knownRef.current.size
  const progressLabel = useMemo(
    () => (sample ? `เลือกแล้ว ${knownCount} จาก ${sample.length} คำ` : ''),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- knownCount มาจาก ref อ่านตรงๆ ไม่ใช่ dependency ที่ React ติดตามได้ ใช้ knownVersion แทนเพื่อสั่ง re-run
    [sample, knownVersion],
  )

  // ใช้ effect แยกจาก onClick แทนการคำนวณ next = {...settings, ...} ในตัว handler
  // เพราะถ้าผู้ใช้กดสองปุ่มติดกันเร็วๆ (เช่น เลือกโหมดมืดแล้วแตะขนาดตัวอักษรต่อทันที) React จะรวมสอง
  // event เป็น batch เดียว ทำให้ handler ตัวที่สองยังอ่าน settings ค่าเก่าอยู่ และ applyPreferences
  // ของมันจะเขียนทับค่าที่ handler ตัวแรกเพิ่งตั้งไว้ — การแยก effect ให้ React รวมอัปเดตก่อนค่อยอ่านแก้ปัญหานี้
  const { theme, fontSize } = settings
  useEffect(() => {
    applyPreferences({ theme, fontSize })
  }, [theme, fontSize])

  function toggleKnown(id: string) {
    // แก้ไข ref ตรงๆ ทันที (ไม่ผ่าน setState) แล้วค่อยสั่ง re-render — ดูเหตุผลที่ประกาศ knownRef ด้านบน
    const set = knownRef.current
    if (set.has(id)) set.delete(id)
    else set.add(id)
    setKnownVersion((v) => v + 1)
  }

  async function finish() {
    setSaving(true)
    if (sample) {
      for (const word of sample) {
        if (!knownRef.current.has(word.id)) continue
        await putWord({ ...word, status: 'mastered' })
      }
    }
    await putSettings({ ...settingsRef.current, onboardingComplete: true })
    setSaving(false)
    if (onComplete) onComplete()
    else navigate('/')
  }

  return (
    <div className="page onboarding">
      <h1>ยินดีต้อนรับสู่ Off Hours</h1>
      <p className="card-label">ตั้งค่าครั้งเดียว ใช้เวลาไม่ถึง 3 นาที แล้วจะไม่ถามอีก</p>

      <section className="card">
        <h3>ตัวคุณ</h3>
        <label className="field">
          ระดับภาษา
          <input
            value={settings.level}
            onChange={(e) => setSettings({ ...settings, level: e.target.value })}
            placeholder="เช่น กลาง, B1, เทียบ TOEIC 600"
          />
        </label>
        <label className="field">
          เป้าคะแนน TOEIC (ถ้ามี)
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
          <select value={settings.genre} onChange={(e) => setSettings({ ...settings, genre: e.target.value as StoryGenre })}>
            {GENRES.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="card">
        <h3>หน้าตาแอป</h3>
        <label className="field">
          ขนาดตัวอักษร
          <div className="quest-choices">
            {(['sm', 'md', 'lg'] as const).map((size) => (
              <button
                key={size}
                className={settings.fontSize === size ? 'button button-selected' : 'button button-outline'}
                onClick={() => setSettings((prev) => ({ ...prev, fontSize: size }))}
              >
                {size === 'sm' ? 'เล็ก' : size === 'md' ? 'กลาง' : 'ใหญ่'}
              </button>
            ))}
          </div>
        </label>
        <label className="field">
          โหมดสี
          <div className="quest-choices">
            {(['system', 'light', 'dark'] as const).map((themeOption) => (
              <button
                key={themeOption}
                className={settings.theme === themeOption ? 'button button-selected' : 'button button-outline'}
                onClick={() => setSettings((prev) => ({ ...prev, theme: themeOption }))}
              >
                {themeOption === 'system' ? 'ตามระบบ' : themeOption === 'light' ? 'สว่าง' : 'มืด'}
              </button>
            ))}
          </div>
        </label>
      </section>

      <section className="card">
        <h3>คำไหนที่คุณรู้อยู่แล้ว?</h3>
        <p className="card-label">แตะคำที่รู้ความหมายทันทีโดยไม่ต้องคิด คำที่เลือกจะไม่ถูกเอามาสอนซ้ำ — {progressLabel}</p>
        {sample ? (
          <div className="calibration-grid">
            {sample.map((word) => (
              <button
                key={word.id}
                className={knownRef.current.has(word.id) ? 'chip chip-active' : 'chip'}
                onClick={() => toggleKnown(word.id)}
              >
                {word.term}
              </button>
            ))}
          </div>
        ) : (
          <p className="card-label">กำลังสุ่มคำตัวอย่าง...</p>
        )}
      </section>

      <button className="button onboarding-submit" onClick={finish} disabled={saving || !sample}>
        {saving ? 'กำลังบันทึก...' : 'เริ่มใช้แอป'}
      </button>
    </div>
  )
}
