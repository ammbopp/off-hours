export interface ReadingProgress {
  episodeId: string
  lastSentenceIndex: number // ประโยคล่าสุดที่อ่าน/ฟังถึง ใช้เปิดอ่านต่อจากเดิม
  finishedAt: string | null // ISO date เมื่ออ่านจบตอน
  updatedAt: string
}
