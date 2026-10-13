// ให้ตัวละครตอบแชทด้วย Gemini พร้อมคำแนะนำภาษา (languageTips) แนบกลับไปที่ข้อความล่าสุดของผู้ใช้ถ้ามี
// รับ: { characterId, systemPrompt, history, dueWordTerms } จาก src/features/chat/getChatReply.ts
// คืน: { content, languageTips? } — ไม่ใช่ Message เต็มรูป เพราะ id/characterId/sender/createdAt
// ฝั่งไคลเอนต์เป็นคนใส่เอง (เซิร์ฟเวอร์ไม่ควรรู้เรื่อง schema ของ IndexedDB)

import { Type } from '@google/genai'
import { getGeminiClient, getGeminiModel, MissingApiKeyError } from './gemini-client'

interface ChatReplyRequestBody {
  characterId: string
  systemPrompt: string
  history: { sender: 'user' | 'character'; content: string }[]
  dueWordTerms: string[]
}

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    content: { type: Type.STRING, description: 'คำตอบของตัวละคร เป็นภาษาอังกฤษ สั้นกระชับแบบแชทจริง 1-3 ประโยค' },
    languageTips: {
      type: Type.ARRAY,
      description:
        'ถ้าข้อความล่าสุดของผู้ใช้ (ข้อความสุดท้ายใน history ที่ sender เป็น user) มีจุดที่ปรับให้เป็นธรรมชาติ/ถูกต้องขึ้นได้ ให้ใส่คำแนะนำสั้นๆ ไม่เกิน 1-2 รายการ ถ้าข้อความถูกต้องดีอยู่แล้วให้เว้นว่างไว้ (อย่าหาเรื่องแก้)',
      items: {
        type: Type.OBJECT,
        properties: {
          original: { type: Type.STRING, description: 'ส่วนของประโยคเดิมที่ควรปรับ' },
          suggestion: { type: Type.STRING, description: 'ประโยคที่ปรับแล้ว' },
          note: { type: Type.STRING, description: 'อธิบายสั้นๆ ว่าทำไม (ภาษาไทย) ไม่บังคับ' },
        },
        required: ['original', 'suggestion'],
      },
    },
  },
  required: ['content'],
}

interface GeneratedPayload {
  content: string
  languageTips?: { original: string; suggestion: string; note?: string }[]
}

function buildContents(body: ChatReplyRequestBody) {
  return body.history.map((m) => ({
    role: m.sender === 'user' ? ('user' as const) : ('model' as const),
    parts: [{ text: m.content }],
  }))
}

function buildSystemInstruction(body: ChatReplyRequestBody): string {
  const dueWordsNote =
    body.dueWordTerms.length > 0
      ? `\n\nถ้าเหมาะกับบทสนทนา ลองใช้คำเหล่านี้สักคำสองคำแบบเป็นธรรมชาติ (ไม่ต้องยัดเยียด ไม่ต้องใช้ครบทุกคำ): ${body.dueWordTerms.join(', ')}`
      : ''

  return `${body.systemPrompt}

ตอบเป็นข้อความแชทภาษาอังกฤษสั้นๆ แบบเพื่อนคุยกันจริง ไม่ใช่ย่อหน้ายาว ไม่ใช้อีโมจิเกินความจำเป็น${dueWordsNote}

ถ้าข้อความล่าสุดของผู้ใช้มีจุดที่พูดแล้วไม่เป็นธรรมชาติหรือผิดหลักไวยากรณ์ ให้ใส่คำแนะนำสั้นๆ ใน languageTips
(ไม่เกิน 2 ข้อ) แต่ถ้าข้อความนั้นถูกต้องและเป็นธรรมชาติดีอยู่แล้ว ปล่อย languageTips ว่างไว้ — อย่าแก้สิ่งที่ไม่ผิด
และห้ามตัดพ้อหรือแสดงความน้อยใจเรื่องที่ผู้ใช้หายไปนาน (แอปนี้เป็นพื้นที่พักผ่อน ไม่ใช่ภาระ)`
}

export async function handler(request: Request): Promise<Response> {
  const body = (await request.json()) as ChatReplyRequestBody

  try {
    const ai = getGeminiClient()
    const response = await ai.models.generateContent({
      model: getGeminiModel(),
      contents: buildContents(body),
      config: {
        systemInstruction: buildSystemInstruction(body),
        responseMimeType: 'application/json',
        responseSchema,
        temperature: 0.8,
      },
    })

    const text = response.text
    if (!text) throw new Error('โมเดลไม่คืนข้อความ')
    const parsed = JSON.parse(text) as GeneratedPayload

    return new Response(JSON.stringify(parsed), { headers: { 'Content-Type': 'application/json' } })
  } catch (err) {
    const status = err instanceof MissingApiKeyError ? 501 : 502
    const message = err instanceof Error ? err.message : 'chat-reply ล้มเหลวโดยไม่ทราบสาเหตุ'
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
