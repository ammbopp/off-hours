import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { clearAllProgress, getAllWords, getSettings, putSettings } from '../lib/db'
import { applyPreferences } from '../lib/theme'
import { speak } from '../lib/speech'
import { characters } from '../features/chat/characters'
import { avatarClass, initials } from '../lib/avatar'
import { ChatIcon, ChevronRightIcon, CompassIcon, MoonIcon, ShieldIcon, SettingsIcon, SpeakerIcon, VocabIcon } from '../components/icons'
import {
  DEFAULT_SETTINGS,
  type Accent,
  type CharacterRelation,
  type FontSize,
  type NarrationRate,
  type Settings,
  type StoryGenre,
  type ThemePreference,
  type Word,
} from '../types'

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

const ACCENTS: { value: Accent; label: string }[] = [
  { value: 'US', label: 'US — อเมริกัน' },
  { value: 'UK', label: 'UK — อังกฤษ' },
  { value: 'AU', label: 'AU — ออสเตรเลีย' },
  { value: 'CA', label: 'CA — แคนาดา' },
]

const RATES: { value: NarrationRate; label: string }[] = [
  { value: 0.75, label: '0.75×' },
  { value: 1, label: '1×' },
  { value: 1.25, label: '1.25×' },
]

const RELATION_LABEL: Record<CharacterRelation, string> = {
  coworker: 'เพื่อนร่วมงาน',
  bestfriend: 'เพื่อนสนิท',
  partner: 'แฟน',
}

export function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [words, setWords] = useState<Word[]>([])
  const [saved, setSaved] = useState(false)
  const [resetDone, setResetDone] = useState(false)
  const loadedRef = useRef(false)
  const settingsRef = useRef(settings)
  settingsRef.current = settings

  useEffect(() => {
    getSettings().then((s) => {
      if (s) setSettings(s)
      loadedRef.current = true
    })
    getAllWords().then(setWords)
  }, [])

  async function save() {
    await putSettings(settings)
    setSaved(true)
    window.setTimeout(() => setSaved(false), 1500)
  }

  // หน้าตาแอป/เสียงบรรยาย ใช้ผลทันทีและบันทึกทันที ไม่ต้องรอกดปุ่มบันทึก ต่างจากฟิลด์โปรไฟล์ด้านล่าง
  // ใช้ effect แยกจาก onClick (แทนการคำนวณ next = {...settings, ...} ในตัว handler ตรงๆ) เพราะถ้าผู้ใช้
  // กดสองปุ่มติดกันเร็วๆ React อาจรวมเป็น batch เดียว ทำให้ handler ตัวที่สองยังอ่าน settings ค่าเก่า
  // แล้วเขียนทับค่าที่ตัวแรกเพิ่งตั้งไว้ — settingsRef ใช้อ่านค่าล่าสุดตอนบันทึกโดยไม่ทำให้ effect นี้
  // ยิงซ้ำทุกครั้งที่ฟิลด์อื่น (เช่น ระดับภาษา) เปลี่ยน เพราะ deps มีแค่ theme/fontSize/narratorAccent/narrationRate
  const { theme, fontSize, narratorAccent, narrationRate } = settings
  useEffect(() => {
    if (!loadedRef.current) return
    applyPreferences({ theme, fontSize })
    void putSettings(settingsRef.current)
  }, [theme, fontSize, narratorAccent, narrationRate])

  const corpusCounts = {
    NGSL: words.filter((w) => w.sources.includes('NGSL')).length,
    TSL: words.filter((w) => w.sources.includes('TSL')).length,
    BSL: words.filter((w) => w.sources.includes('BSL')).length,
  }

  function handleExportCsv() {
    const header = 'term,status,sources,definition\n'
    const rows = words
      .map((w) =>
        [w.term, w.status, w.sources.join('|'), w.definition ?? '']
          .map((v) => `"${v.replace(/"/g, '""')}"`)
          .join(','),
      )
      .join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'off-hours-vocab.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleResetProgress() {
    if (!window.confirm('ล้างตำแหน่งที่อ่านค้างไว้ทั้งหมด? คำศัพท์ที่เรียนรู้ไว้แล้วจะไม่หายไป')) return
    await clearAllProgress()
    setResetDone(true)
    window.setTimeout(() => setResetDone(false), 2000)
  }

  return (
    <div className="page">
      <h1>ตั้งค่า</h1>

      <div className="home-calm-banner">
        <MoonIcon size={20} />
        <div>
          <strong>ไม่มีสตรีค ไม่มีความรู้สึกผิด</strong>
          <p>ภาษาซึมซับเข้าไปเองระหว่างพักผ่อนตอนกลางคืน ไม่มีตารางที่ต้องตามให้ทัน</p>
        </div>
      </div>

      <div className="settings-section-header">
        <SettingsIcon size={16} />
        <h3>หน้าตาแอป</h3>
      </div>
      <section className="card">
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

      <div className="settings-section-header">
        <CompassIcon size={16} />
        <h3>เป้าหมายการเรียนรู้</h3>
      </div>
      <section className="card">
        <label className="field">
          ระดับภาษา
          <input
            value={settings.level}
            onChange={(e) => setSettings({ ...settings, level: e.target.value })}
            placeholder="เช่น กลาง, B1, เทียบ TOEIC 600"
          />
        </label>
        <label className="field" style={{ marginBottom: 0 }}>
          เป้าคะแนน TOEIC
          <input
            type="number"
            value={settings.toeicGoal ?? ''}
            onChange={(e) => setSettings({ ...settings, toeicGoal: e.target.value ? Number(e.target.value) : null })}
          />
        </label>
      </section>

      <div className="settings-section-header">
        <ChatIcon size={16} />
        <h3>เรื่องราวและตัวละคร</h3>
      </div>
      <section className="card">
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

        <p className="card-label" style={{ marginTop: 16, marginBottom: 8 }}>
          ตัวละครในเรื่อง
        </p>
        {characters.map((c) => (
          <div key={c.id} className="list-row">
            <span className={`${avatarClass(c.relation)} avatar-sm`} aria-hidden>
              {initials(c.name)}
            </span>
            <span className="list-row-text">
              <span className="list-row-title">
                <strong>{c.name}</strong>
                <span className="home-accent-badge">{c.accent}</span>
              </span>
              <span className="list-row-sub">
                {RELATION_LABEL[c.relation]} · {c.persona}
              </span>
            </span>
          </div>
        ))}

        <div className="home-calm-banner" style={{ marginTop: 14, marginBottom: 0 }}>
          <MoonIcon size={20} />
          <div>
            <strong>Gentle Sanctuary Boundary</strong>
            <p>ตัวละครจะไม่ตัดพ้อหรือทวงถามเมื่อคุณหายไปนาน ที่นี่เป็นพื้นที่พักผ่อนจริงๆ</p>
          </div>
        </div>
      </section>

      <div className="settings-section-header">
        <VocabIcon size={16} />
        <h3>คลังคำศัพท์</h3>
      </div>
      <section className="card">
        <div className="corpus-rows">
          <div className="corpus-row">
            <span className="corpus-row-label">
              <span className="status-dot status-dot-new" />
              NGSL — คำพื้นฐาน
            </span>
            <span className="card-label" style={{ margin: 0 }}>
              {corpusCounts.NGSL.toLocaleString()} คำ
            </span>
          </div>
          <div className="corpus-row">
            <span className="corpus-row-label">
              <span className="status-dot status-dot-remembered" />
              TSL — TOEIC และที่ทำงาน
            </span>
            <span className="card-label" style={{ margin: 0 }}>
              {corpusCounts.TSL.toLocaleString()} คำ
            </span>
          </div>
          <div className="corpus-row">
            <span className="corpus-row-label">
              <span className="status-dot status-dot-mastered" />
              BSL — ธุรกิจเฉพาะทาง
            </span>
            <span className="card-label" style={{ margin: 0 }}>
              {corpusCounts.BSL.toLocaleString()} คำ
            </span>
          </div>
        </div>
        <p className="card-label" style={{ marginTop: 10, marginBottom: 0 }}>
          แตะคำเป้าหมายในนิยายจะขึ้นคำแปลไทยตามบริบททันที ไม่ใช่แปลตรงตัวแบบเครื่อง
        </p>

        <Link to="/onboarding" className="list-row" style={{ marginTop: 10 }}>
          <span className="avatar avatar-sm" aria-hidden>
            <VocabIcon size={16} />
          </span>
          <span className="list-row-text">
            <strong>ประเมินคำศัพท์อีกครั้ง</strong>
            <span className="list-row-sub">เลือกคำที่รู้แล้วจากตัวอย่างใหม่ เพื่อข้ามคำเหล่านั้นจากรอบทวน</span>
          </span>
          <ChevronRightIcon size={18} className="list-row-chevron" />
        </Link>
      </section>

      <div className="settings-section-header">
        <SpeakerIcon size={16} />
        <h3>เสียงบรรยาย</h3>
      </div>
      <section className="card">
        <label className="field">
          สำเนียงผู้บรรยาย
          <div className="accent-grid">
            {ACCENTS.map((a) => (
              <div
                key={a.value}
                className={settings.narratorAccent === a.value ? 'accent-option accent-option-selected' : 'accent-option'}
              >
                <button className="accent-option-label" onClick={() => setSettings((prev) => ({ ...prev, narratorAccent: a.value }))}>
                  {a.label}
                </button>
                <button className="accent-option-play" onClick={() => speak('Good evening. This is how your story sounds.', a.value)} aria-label={`ฟังตัวอย่างสำเนียง ${a.label}`}>
                  <SpeakerIcon size={14} />
                </button>
              </div>
            ))}
          </div>
        </label>
        <label className="field" style={{ marginBottom: 0 }}>
          ความเร็วเสียงบรรยาย
          <div className="segmented">
            {RATES.map((r) => (
              <button
                key={r.value}
                className={settings.narrationRate === r.value ? 'button button-selected' : 'button button-outline'}
                onClick={() => setSettings((prev) => ({ ...prev, narrationRate: r.value }))}
              >
                {r.label}
              </button>
            ))}
          </div>
        </label>
      </section>

      <div className="settings-section-header">
        <ShieldIcon size={16} />
        <h3>การใช้งานและความเป็นส่วนตัว</h3>
      </div>
      <section className="card">
        <label className="field" style={{ marginBottom: 8 }}>
          งบ API ต่อเดือน (USD)
          <input
            type="number"
            value={settings.monthlyBudgetUsd}
            onChange={(e) => setSettings({ ...settings, monthlyBudgetUsd: Number(e.target.value) })}
          />
        </label>
        <p className="card-label" style={{ marginBottom: 16 }}>
          ใช้เป็นเพดานป้องกันค่าใช้จ่าย AI เกินคาดเมื่อต่อผู้ให้บริการสร้างตอน/เสียงจริงแล้ว
        </p>

        <div className="settings-action-row">
          <button className="settings-action-link" onClick={handleExportCsv} disabled={words.length === 0}>
            ส่งออกคำศัพท์เป็น CSV
          </button>
          <button className="settings-action-link settings-action-danger" onClick={handleResetProgress}>
            ล้างความคืบหน้าการอ่าน
          </button>
        </div>
        {resetDone && <p className="card-label" style={{ marginTop: 8, marginBottom: 0 }}>ล้างแล้ว — เริ่มอ่านใหม่ได้จากหน้าแรก</p>}
      </section>

      <button className="button" onClick={save} style={{ width: '100%' }}>
        บันทึก
      </button>
      {saved && <p className="card-label" style={{ textAlign: 'center', marginTop: 8 }}>บันทึกแล้ว</p>}
    </div>
  )
}
