import type { Episode, Word } from '../../types'
import { storyBible } from './storyBible'

export interface GenerateEpisodeParams {
  episodeOrder: number
  previousSummary: string | null
  targetWords: Word[]
}

// TODO: ต่อกับฟังก์ชันฝั่งเซิร์ฟเวอร์ server/llm.ts เมื่อเลือกผู้ให้บริการ AI และโฮสติ้งแล้ว
// (ดู README หัวข้อ "การสร้างเนื้อเรื่อง" ข้อ 3) ตอนนี้ยังไม่ implement จริง เป็นแค่โครงการเรียก
export async function generateEpisode(params: GenerateEpisodeParams): Promise<Episode> {
  const response = await fetch('/api/llm/generate-episode', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      storyBible,
      episodeOrder: params.episodeOrder,
      previousSummary: params.previousSummary,
      targetTerms: params.targetWords.map((w) => w.term),
    }),
  })

  if (!response.ok) {
    throw new Error(`generateEpisode ยังไม่พร้อมใช้งาน (${response.status}) — ต้องตั้งค่า server/llm.ts ก่อน`)
  }

  return response.json()
}
