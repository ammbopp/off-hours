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
import { putMessage, seedIfEmpty } from './lib/db'
import { characters } from './features/chat/characters'
import { sampleEpisode, sampleMessages, sampleWords } from './data/sample'

function App() {
  // รอใส่ข้อมูลตัวอย่าง/เปิด DB ให้เสร็จก่อนเรนเดอร์หน้าที่ต้องอ่านข้อมูล
  // กัน race condition ที่หน้าแรกโหลดข้อมูลก่อนการ seed จะเขียนเสร็จ
  const [ready, setReady] = useState(false)

  useEffect(() => {
    seedIfEmpty({ words: sampleWords, characters, episodes: [sampleEpisode] })
      .then(async (didSeed) => {
        if (!didSeed) return
        for (const message of sampleMessages) {
          await putMessage(message)
        }
      })
      .finally(() => setReady(true))
  }, [])

  if (!ready) {
    return <div className="app-shell app-loading">กำลังโหลด...</div>
  }

  return (
    <div className="app-shell">
      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/read" element={<ReadPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/chat/:characterId" element={<ChatPage />} />
          <Route path="/quest" element={<QuestPage />} />
          <Route path="/vocab" element={<VocabBookPage />} />
          <Route path="/call" element={<CallPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
      <NavBar />
    </div>
  )
}

export default App
