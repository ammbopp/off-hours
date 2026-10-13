import type { Character, LanguageTip, Message } from '../../types'

export interface ChatReplyResult {
  content: string
  languageTips?: LanguageTip[]
}

export interface GetChatReplyParams {
  character: Character
  history: Message[] // เรียงเก่า→ใหม่ รวมข้อความล่าสุดของผู้ใช้ที่เพิ่งส่งไปด้วย
  dueWordTerms: string[] // คำที่ถึงรอบทวนแล้ว ส่งให้ตัวละครลองใช้เองแบบเป็นธรรมชาติ
}

export async function getChatReply(params: GetChatReplyParams): Promise<ChatReplyResult> {
  const response = await fetch('/api/llm/chat-reply', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      characterId: params.character.id,
      systemPrompt: params.character.systemPrompt,
      history: params.history.map((m) => ({ sender: m.sender, content: m.content })),
      dueWordTerms: params.dueWordTerms,
    }),
  })

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null
    throw new Error(body?.error ?? `getChatReply ล้มเหลว (${response.status})`)
  }

  return response.json()
}
