// นำเข้าคลังคำ NGSL/TSL/BSL จาก data/wordlists/*.csv (ดู data/wordlists/README.md สำหรับที่มาไฟล์)
// รัน: npm run wordlists:import
// ผลลัพธ์: public/words.generated.json — รวม Word[] จากทั้งสามคลัง หน้าเว็บ fetch() มา seed เข้า IndexedDB ตอนเปิดแอปครั้งแรก
//          (ไม่ bundle เข้า JS เพราะไฟล์ใหญ่ ~1.4MB และ TS ไม่ได้เปิด resolveJsonModule)
//          data/wordlists/wordforms.generated.json — รูปแปรทั้งหมดของแต่ละคำ แยกตามคลัง ใช้โดย scripts/validate-episode.ts เท่านั้น (ไม่ส่งให้ไคลเอนต์)
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { collectAllForms, parseWordListCsv } from '../src/lib/wordlists/import'
import type { WordSource } from '../src/types'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

const SOURCES: { source: WordSource; file: string }[] = [
  { source: 'NGSL', file: 'data/wordlists/ngsl.csv' },
  { source: 'TSL', file: 'data/wordlists/tsl.csv' },
  { source: 'BSL', file: 'data/wordlists/bsl.csv' },
]

const allWords = []
const wordforms: Record<string, Record<string, string[]>> = {}

for (const { source, file } of SOURCES) {
  const csvText = readFileSync(path.join(ROOT, file), 'utf-8')
  const parsed = parseWordListCsv(csvText, source)
  allWords.push(...parsed.words)
  wordforms[source] = parsed.formsByTerm

  const knownFormsCount = collectAllForms(parsed).size
  console.log(`${source}: ${parsed.words.length} คำตั้งต้น (${knownFormsCount} รูปแปรรวม) จาก ${file}`)
}

writeFileSync(path.join(ROOT, 'public/words.generated.json'), JSON.stringify(allWords))
writeFileSync(path.join(ROOT, 'data/wordlists/wordforms.generated.json'), JSON.stringify(wordforms, null, 2))

console.log(`\nรวม ${allWords.length} คำ → public/words.generated.json`)
console.log('รูปแปรทั้งหมดแยกตามคลัง → data/wordlists/wordforms.generated.json')
