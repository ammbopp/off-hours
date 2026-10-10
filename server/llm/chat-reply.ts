// โครงฟังก์ชันให้ตัวละครตอบแชท — ควรสตรีมคำตอบกลับ และแนบ languageTips (ดู src/types/message.ts)
// รับ: { characterId, systemPrompt, history, dueWords } ส่งคำที่ถึงรอบทวนไปด้วยเพื่อให้ตัวละครใช้คำเหล่านั้นเอง

interface ChatReplyRequestBody {
  characterId: string
  systemPrompt: string
  history: { sender: 'user' | 'character'; content: string }[]
  dueWordTerms: string[]
}

export async function handler(request: Request): Promise<Response> {
  const body = (await request.json()) as ChatReplyRequestBody
  void body // TODO: ส่งต่อให้โมเดลภาษาแบบสตรีม

  return new Response(
    JSON.stringify({ error: 'chat-reply ยังไม่ได้ต่อผู้ให้บริการ AI จริง' }),
    { status: 501, headers: { 'Content-Type': 'application/json' } },
  )
}
