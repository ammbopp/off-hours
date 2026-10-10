// โครงฟังก์ชันสร้างตอนใหม่ — ดู server/README.md สำหรับวิธีย้ายไปตามโฮสติ้งที่เลือก
// รับ: { storyBible, episodeOrder, previousSummary, targetTerms } จาก src/features/story/generateEpisode.ts
// ควรคืน: Episode (ดู src/types/episode.ts) หลังผ่าน src/features/story/validateEpisode.ts แล้ว

interface GenerateEpisodeRequestBody {
  storyBible: { setting: string; mainConflict: string; characterNotes: string }
  episodeOrder: number
  previousSummary: string | null
  targetTerms: string[]
}

export async function handler(request: Request): Promise<Response> {
  const body = (await request.json()) as GenerateEpisodeRequestBody
  void body // TODO: ส่งต่อให้โมเดลภาษา (เก็บคีย์ API ใน environment variable เช่น AI_API_KEY)

  return new Response(
    JSON.stringify({ error: 'generate-episode ยังไม่ได้ต่อผู้ให้บริการ AI จริง' }),
    { status: 501, headers: { 'Content-Type': 'application/json' } },
  )
}
