import type { Episode, Word } from '../../types'
import { storyBible } from './storyBible'
import { characters } from '../chat/characters'
import { validateEpisode } from './validateEpisode'

export interface GenerateEpisodeParams {
  episodeOrder: number
  previousSummary: string | null
  targetWords: Word[]
  // คำทั้งหมดในคลังที่นำเข้าไว้ (NGSL+TSL+BSL) — ใช้สองทาง: (1) ส่งเฉพาะรูปตั้งต้น (term) ให้โมเดล
  // อ้างอิงตอนเขียน ไม่ส่งทุกรูปแปรเพราะทำให้พรอมต์ใหญ่เกินจำเป็น (เคยลองส่งทุกรูปแปร ~14,500 คำ
  // แล้วทำให้ช้าลงมากและดูเหมือนเพิ่มโอกาสโดน rate limit) (2) ตรวจผลลัพธ์ด้วยทุกรูปแปรจริงหลังได้ตอนมา
  knownWords: Word[]
}

export async function generateEpisode(params: GenerateEpisodeParams): Promise<Episode> {
  const vocabularyHint = [...new Set(params.knownWords.map((w) => w.term))]

  const response = await fetch('/api/llm/generate-episode', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      storyBible,
      episodeOrder: params.episodeOrder,
      previousSummary: params.previousSummary,
      targetTerms: params.targetWords.map((w) => w.term),
      characters: characters.map((c) => ({ name: c.name, relation: c.relation, persona: c.persona })),
      knownVocabulary: vocabularyHint,
    }),
  })

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null
    throw new Error(body?.error ?? `generateEpisode ล้มเหลว (${response.status})`)
  }

  const episode = (await response.json()) as Episode

  // ตรวจทันทีด้วยกฎเดียวกับที่ใช้ตรวจตอนที่เขียนด้วยมือ (npm run episodes:validate) — ไม่บันทึกตอนที่ไม่ผ่าน
  // ใช้ "ทุกรูปแปร" ตรงนี้ (ต่างจากรายการที่ส่งให้โมเดล) เพราะต้องตรวจคำที่โมเดลผันรูปเองในเนื้อตอนจริงด้วย
  const knownVocabulary = new Set(params.knownWords.flatMap((w) => w.forms))
  const result = validateEpisode({
    content: episode.content,
    targetTerms: params.targetWords.map((w) => w.term),
    knownVocabulary,
  })
  if (!result.valid) {
    throw new Error(`ตอนที่สร้างมาไม่ผ่านตัวตรวจ: ${result.issues.map((i) => i.message).join('; ')} — ลองกดสร้างใหม่อีกครั้ง`)
  }

  return episode
}
