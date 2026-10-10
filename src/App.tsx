import { useEffect, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import { NavBar } from './components/NavBar'
import { HomePage } from './pages/HomePage'
import { ReadPage } from './pages/ReadPage'
import { ChatPage } from './pages/ChatPage'
import { QuestPage } from './pages/QuestPage'
import { VocabBookPage } from './pages/VocabBookPage'
import { CallPage } from './pages/CallPage'
import { SettingsPage } from './pages/SettingsPage'
import { OnboardingPage } from './pages/OnboardingPage'
import { getSettings, seedMessagesOnce, syncContent, syncCorpus } from './lib/db'
import { applyPreferences } from './lib/theme'
import { characters } from './features/chat/characters'
import { sampleMessages } from './data/sample'
import { episodes } from './data/episodes'
import { DEFAULT_SETTINGS, type Word } from './types'

function App() {
  // รอใส่ข้อมูลตัวอย่าง/เปิด DB ให้เสร็จก่อนเรนเดอร์หน้าที่ต้องอ่านข้อมูล
  // กัน race condition ที่หน้าแรกโหลดข้อมูลก่อนการ seed จะเขียนเสร็จ
  const [ready, setReady] = useState(false)
  const [onboardingComplete, setOnboardingComplete] = useState(false)

  useEffect(() => {
    async function bootstrap() {
      // คลังคำจริง (NGSL/TSL/BSL 5,228 คำ พร้อมคำนิยาม) อยู่ในไฟล์สถิตแทนการ bundle เข้า JS
      // syncCorpus จะ fetch ก็ต่อเมื่อเวอร์ชันคลังคำในเครื่องตามหลัง จึงไม่โหลดซ้ำทุกครั้งที่เปิดแอป
      await syncCorpus(async () => {
        const response = await fetch('/words.generated.json')
        return (await response.json()) as Word[]
      })
      await syncContent({ episodes, characters })
      await seedMessagesOnce(sampleMessages)

      const settings = await getSettings()
      applyPreferences(settings ?? DEFAULT_SETTINGS)
      setOnboardingComplete(settings?.onboardingComplete ?? false)
    }

    bootstrap().finally(() => setReady(true))
  }, [])

  if (!ready) {
    return <div className="app-shell app-loading">กำลังโหลด...</div>
  }

  // ตั้งค่าครั้งเดียวตอนเปิดแอปครั้งแรก ไม่มี NavBar เพราะยังไม่ใช่ตัวแอปจริง
  if (!onboardingComplete) {
    return <OnboardingPage onComplete={() => setOnboardingComplete(true)} />
  }

  return (
    <div className="app-shell">
      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/read" element={<ReadPage />} />
          <Route path="/read/:episodeId" element={<ReadPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/chat/:characterId" element={<ChatPage />} />
          <Route path="/quest" element={<QuestPage />} />
          <Route path="/quest/:episodeId" element={<QuestPage />} />
          <Route path="/vocab" element={<VocabBookPage />} />
          <Route path="/call" element={<CallPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
        </Routes>
      </main>
      <NavBar />
    </div>
  )
}

export default App
