import { GoogleGenAI } from '@google/genai'

// สร้างทีเดียวแล้วใช้ซ้ำข้าม request เดียวกับ Models wrapper ของ SDK เอง — ตัวแปรระดับโมดูลตรงนี้
// ใช้ได้ปลอดภัยเพราะไม่มี state เฉพาะ request ติดอยู่ (ไม่ใช่ connection ที่ต้องปิด)
let client: GoogleGenAI | null = null

export class MissingApiKeyError extends Error {
  constructor() {
    super('ยังไม่ได้ตั้งค่า GEMINI_API_KEY — ดู .env.example')
    this.name = 'MissingApiKeyError'
  }
}

export function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new MissingApiKeyError()

  if (!client) client = new GoogleGenAI({ apiKey })
  return client
}

export function getGeminiModel(): string {
  return process.env.GEMINI_MODEL || 'gemini-3.8-flash'
}
