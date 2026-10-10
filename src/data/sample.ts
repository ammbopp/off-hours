// ข้อมูลตัวอย่างสำหรับ dev/demo เท่านั้น — ของจริงมาจาก features/story/generateEpisode
// เมื่อต่อโมเดลภาษาแล้ว ฟังก์ชัน seedIfEmpty (src/lib/db) จะใส่ชุดนี้ให้ครั้งแรกที่เปิดแอป
import { makeBlankWord } from '../lib/wordlists/import'
import { characters } from '../features/chat/characters'
import type { Episode, Message, Word } from '../types'

export const sampleWords: Word[] = [
  makeBlankWord('deadline', 'TSL'),
  makeBlankWord('postpone', 'NGSL'),
  makeBlankWord('budget', 'BSL'),
  makeBlankWord('suspicious', 'NGSL'),
]

const [deadline, postpone, budget, suspicious] = sampleWords

export const sampleEpisode: Episode = {
  id: 'ep-001',
  order: 1,
  title: 'ตอนที่ 1: วันแรกที่ Northfield',
  content: `Your first week at Northfield Partners already feels like a test. The Q3 report is due Friday, and everyone keeps repeating the same word: deadline.

This morning, Daniel stops by your desk. "We might need to postpone the client call," he says, not quite looking at you. "The budget numbers don't match what Finance sent us."

You open the shared file. Three different budget sheets, three different totals. The deadline is only four days away, and nobody wants to explain why the numbers changed.

"Can we postpone the whole review instead?" you ask. Daniel shakes his head. "Not without telling our manager why. And right now, something about this feels suspicious."

You nod, but your mind is already racing. Why would anyone touch the budget sheet without telling the team?

Your phone buzzes. A message from Chloe: "lunch tmrw?? need to tell you something 👀"

You lock your phone and look back at the budget sheet. Something is off, and the deadline is the least of your problems.`,
  targetWordIds: [deadline.id, postpone.id, budget.id, suspicious.id],
  contextualTranslations: {
    [deadline.id]: { th: 'เส้นตายส่งงาน', partOfSpeech: 'noun', exampleSentence: 'The deadline is only four days away.' },
    [postpone.id]: { th: 'เลื่อนออกไป', partOfSpeech: 'verb', exampleSentence: 'We might need to postpone the client call.' },
    [budget.id]: { th: 'งบประมาณ', partOfSpeech: 'noun', exampleSentence: "The budget numbers don't match what Finance sent us." },
    [suspicious.id]: { th: 'น่าสงสัย', partOfSpeech: 'adjective', exampleSentence: 'Something about this feels suspicious.' },
  },
  quest: {
    questions: [
      {
        id: 'q1',
        type: 'fill-blank',
        prompt: 'We might need to ____ the client call.',
        choices: ['postpone', 'budget', 'deadline', 'suspicious'],
        answer: 'postpone',
        relatedWordIds: [postpone.id],
      },
      {
        id: 'q2',
        type: 'choose-reply',
        prompt: "Daniel: \"Can you send me the budget file before the deadline?\" — เลือกคำตอบที่เหมาะสมที่สุด",
        choices: [
          "Sure, I'll send it by tomorrow morning.",
          "I don't really care about that.",
          'Maybe, maybe not.',
        ],
        answer: "Sure, I'll send it by tomorrow morning.",
        relatedWordIds: [budget.id, deadline.id],
      },
      {
        id: 'q3',
        type: 'fill-blank',
        prompt: 'Something about this feels ____.',
        choices: ['suspicious', 'postpone', 'budget', 'deadline'],
        answer: 'suspicious',
        relatedWordIds: [suspicious.id],
      },
    ],
  },
  summary:
    'วันแรกของผู้ใช้ที่ Northfield Partners: งบตัวเลขในรายงาน Q3 ไม่ตรงกันสามชุด เดดไลน์เหลือ 4 วัน Daniel ขอให้เงียบไว้ก่อนเพราะดูน่าสงสัย ส่วน Chloe ทักมาขอนัดกินข้าวพรุ่งนี้เพื่อบอกอะไรบางอย่าง',
}

const coworkerId = characters.find((c) => c.relation === 'coworker')!.id
const bestfriendId = characters.find((c) => c.relation === 'bestfriend')!.id

export const sampleMessages: Message[] = [
  {
    id: 'msg-001',
    characterId: coworkerId,
    sender: 'character',
    content: "Hey — still thinking about that budget sheet from today. You see anything weird on your end?",
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
