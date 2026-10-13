// สร้างตอนใหม่ด้วย Gemini — ดู server/README.md สำหรับวิธีย้ายไปตามโฮสติ้งที่เลือก
// รับ: { storyBible, episodeOrder, previousSummary, targetTerms, characters } จาก
// src/features/story/generateEpisode.ts (characters ส่งมาด้วยเพราะ storyBible เองมีแค่ตัวชี้ไปยัง
// src/features/chat/characters.ts เฉยๆ โมเดลต้องมีชื่อ/บุคลิกจริงถึงจะเขียนบทพูดให้ตรงตัวละครได้)
// คืน: Episode (ดู src/types/episode.ts) — ฝั่งไคลเอนต์เป็นคนรัน validateEpisode.ts ต่อ เพราะต้องมีคลังคำ
// เต็ม (ซึ่งอยู่ใน IndexedDB ของเครื่องผู้ใช้ ไม่ใช่ฝั่งเซิร์ฟเวอร์) มาเทียบสัดส่วนคำนอกคลัง

import { Type } from '@google/genai'
import { getGeminiClient, getGeminiModel, MissingApiKeyError } from './gemini-client'
import type { Episode, QuestQuestionType } from '../../src/types'

interface CharacterNote {
  name: string
  relation: string
  persona: string
}

interface GenerateEpisodeRequestBody {
  storyBible: { setting: string; mainConflict: string; characterNotes: string }
  episodeOrder: number
  previousSummary: string | null
  targetTerms: string[]
  characters: CharacterNote[]
  // คลังคำจริงทั้งหมด (ทุกรูปของทุกคำ NGSL+TSL+BSL) ให้โมเดลเลือกใช้ตรงๆ แทนการเดาว่าคำไหน "พื้นฐาน"
  // เอง — ลองแล้วพบว่าถ้าไม่มีรายการจริงให้เทียบ โมเดลมักเขียนคำยากเกินเกณฑ์สัดส่วนคำนอกคลัง (>5%) อยู่เรื่อยๆ
  knownVocabulary: string[]
}

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: 'ชื่อตอนภาษาไทย เช่น "ตอนที่ 4: ..."' },
    content: {
      type: Type.STRING,
      description: 'เนื้อเรื่องภาษาอังกฤษล้วน 800-1200 คำ แบ่งย่อหน้าด้วยบรรทัดว่าง',
    },
    summary: {
      type: Type.STRING,
      description: 'สรุปเหตุการณ์ในตอนนี้เป็นภาษาไทย 3-5 ประโยค ใช้เป็นบริบทตอนเขียนตอนถัดไป',
    },
    contextualTranslations: {
      type: Type.ARRAY,
      description: 'คำแปลไทยตามบริบทของคำเป้าหมายทุกคำที่ได้รับมา ต้องครบทุกคำ',
      items: {
        type: Type.OBJECT,
        properties: {
          term: { type: Type.STRING, description: 'คำเป้าหมาย ตรงตามที่ได้รับมาเป๊ะๆ' },
          th: { type: Type.STRING, description: 'คำแปลไทยสั้นๆ ตามบริบทในตอนนี้' },
          partOfSpeech: { type: Type.STRING, description: 'เช่น noun, verb, adjective' },
          exampleSentence: { type: Type.STRING, description: 'ประโยคที่ยกมาจากเนื้อตอนจริงที่มีคำนี้' },
        },
        required: ['term', 'th', 'partOfSpeech', 'exampleSentence'],
      },
    },
    questions: {
      type: Type.ARRAY,
      description: '5 ข้อ คละประเภท fill-blank / choose-reply / match ตรวจความเข้าใจเนื้อตอนและคำเป้าหมาย',
      items: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING, enum: ['fill-blank', 'choose-reply', 'match'] },
          prompt: { type: Type.STRING },
          choices: { type: Type.ARRAY, items: { type: Type.STRING } },
          answer: { type: Type.STRING, description: 'ต้องตรงกับหนึ่งใน choices เป๊ะๆ' },
          relatedTerms: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'คำเป้าหมายที่เกี่ยวข้องกับข้อนี้ (จากรายการคำเป้าหมายที่ได้รับมาเท่านั้น)',
          },
        },
        required: ['type', 'prompt', 'choices', 'answer', 'relatedTerms'],
      },
    },
  },
  required: ['title', 'content', 'summary', 'contextualTranslations', 'questions'],
}

interface GeneratedPayload {
  title: string
  content: string
  summary: string
  contextualTranslations: { term: string; th: string; partOfSpeech: string; exampleSentence: string }[]
  questions: { type: string; prompt: string; choices: string[]; answer: string; relatedTerms: string[] }[]
}

function buildPrompt(body: GenerateEpisodeRequestBody): string {
  const characterLines = body.characters
    .map((c) => `- ${c.name} (${c.relation}): ${c.persona}`)
    .join('\n')

  return `คุณคือนักเขียนนิยายออฟฟิศสำหรับแอปฝึกภาษาอังกฤษ เขียนตอนถัดไปของเรื่องต่อเนื่อง

ฉาก: ${body.storyBible.setting}
ความขัดแย้งหลักของเรื่อง: ${body.storyBible.mainConflict}
ตัวละคร:
${characterLines}

${body.previousSummary ? `สรุปตอนก่อนหน้า: ${body.previousSummary}` : 'นี่คือตอนแรกของเรื่อง'}

เขียนตอนที่ ${body.episodeOrder} ความยาว 800-1200 คำ เป็นภาษาอังกฤษล้วน (เนื้อเรื่อง ไม่ใช่บทพูดในแชท)

รายการคำศัพท์ที่อนุญาตให้ใช้ (ทุกรูปของคำ รวมคำเป้าหมายไว้แล้ว) — อย่างน้อย 95% ของคำทั้งหมดในเนื้อเรื่องต้อง
เป็นคำจากรายการนี้เป๊ะๆ ตามรูปที่สะกดไว้: ${body.knownVocabulary.join(' ')}

กฎสำคัญ:
1. ต้องใช้คำเหล่านี้ทุกคำอย่างน้อยคนละ 1 ครั้งในเนื้อเรื่อง ตามรูปที่ให้มาเป๊ะๆ: ${body.targetTerms.join(', ')}
2. เลือกใช้คำจากรายการคำศัพท์ที่อนุญาตด้านบนเป็นหลักเท่านั้น หลีกเลี่ยงคำยากหรือศัพท์เฉพาะทางที่ไม่อยู่ในรายการ
   แม้จะทำให้ประโยคดูเรียบง่ายกว่าปกติก็ตาม — นี่คือกฎที่สำคัญที่สุด สำคัญกว่าความไพเราะของภาษา
3. รักษาบุคลิกตัวละครให้ตรงตามที่กำหนดไว้ทุกตอน
4. จบตอนด้วยจุดที่ชวนติดตามต่อ (cliffhanger เบาๆ) ไม่ใช่จบแบบปิดเรื่อง

แล้วสร้างคำแปลไทยตามบริบท (contextualTranslations) และคำถามท้ายตอน (questions) ตามสคีมาที่กำหนด`
}

export async function handler(request: Request): Promise<Response> {
  const body = (await request.json()) as GenerateEpisodeRequestBody

  try {
    const ai = getGeminiClient()
    const response = await ai.models.generateContent({
      model: getGeminiModel(),
      contents: buildPrompt(body),
      config: {
        responseMimeType: 'application/json',
        responseSchema,
        // ลดจาก 0.9 เพราะทดสอบแล้วพบว่าอุณหภูมิสูงทำให้โมเดลหลุดไปใช้คำนอกรายการคำศัพท์ที่อนุญาตบ่อย
        // จนสัดส่วนคำนอกคลังเกิน 5% อยู่เรื่อยๆ (ดู validateEpisode.ts) แม้จะสั่งในพรอมต์แล้วก็ตาม
        temperature: 0.6,
      },
    })

    const text = response.text
    if (!text) throw new Error('โมเดลไม่คืนข้อความ')
    const parsed = JSON.parse(text) as GeneratedPayload

    const episode: Episode = {
      id: `ep-${String(body.episodeOrder).padStart(3, '0')}`,
      order: body.episodeOrder,
      title: parsed.title,
      content: parsed.content,
      targetWordIds: body.targetTerms.map((t) => t.toLowerCase()),
      contextualTranslations: Object.fromEntries(
        parsed.contextualTranslations.map((t) => [
          t.term.toLowerCase(),
          { th: t.th, partOfSpeech: t.partOfSpeech, exampleSentence: t.exampleSentence },
        ]),
      ),
      quest: {
        questions: parsed.questions.map((q, i) => ({
          id: `ep${body.episodeOrder}-q${i + 1}`,
          type: q.type as QuestQuestionType,
          prompt: q.prompt,
          choices: q.choices,
          answer: q.answer,
          relatedWordIds: q.relatedTerms.map((t) => t.toLowerCase()),
        })),
      },
      summary: parsed.summary,
    }

    return new Response(JSON.stringify(episode), { headers: { 'Content-Type': 'application/json' } })
  } catch (err) {
    const status = err instanceof MissingApiKeyError ? 501 : 502
    const message = err instanceof Error ? err.message : 'generate-episode ล้มเหลวโดยไม่ทราบสาเหตุ'
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
