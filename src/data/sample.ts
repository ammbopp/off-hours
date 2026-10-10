// แชทตัวอย่างสำหรับ dev/demo — ของจริงมาจาก server/llm/chat-reply.ts เมื่อต่อผู้ให้บริการ AI แล้ว
// ตอนทั้ง 3 ตอนอยู่ที่ src/data/episodes/ และคลังคำจริงมาจาก public/words.generated.json (ดู App.tsx)
import { characters } from '../features/chat/characters'
import type { Message } from '../types'

const coworkerId = characters.find((c) => c.relation === 'coworker')!.id
const bestfriendId = characters.find((c) => c.relation === 'bestfriend')!.id

export const sampleMessages: Message[] = [
  {
    id: 'msg-001',
    characterId: coworkerId,
    sender: 'character',
    content: "Hey — still thinking about that audit file from today. You see anything weird on your end?",
    createdAt: '2026-10-11T09:05:00.000Z',
  },
  {
    id: 'msg-002',
    characterId: coworkerId,
    sender: 'user',
    content: 'I think the numbers was changed by someone else.',
    createdAt: '2026-10-11T09:07:00.000Z',
    languageTips: [
      {
        original: 'the numbers was changed',
        suggestion: 'the numbers were changed',
        note: 'numbers เป็นพหูพจน์ ต้องใช้ were',
      },
    ],
  },
  {
    id: 'msg-003',
    characterId: coworkerId,
    sender: 'character',
    content: "Yeah, the numbers were changed sometime after Monday. I just don't know by who.",
    createdAt: '2026-10-11T09:08:00.000Z',
  },
  {
    id: 'msg-004',
    characterId: bestfriendId,
    sender: 'character',
    content: 'lunch tmrw?? need to tell you something 👀',
    createdAt: '2026-10-11T12:30:00.000Z',
  },
]
