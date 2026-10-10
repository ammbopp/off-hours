// นำเข้าคลังคำ NGSL/TSL/BSL + คำนิยามภาษาอังกฤษ จาก data/wordlists/ (ดู data/wordlists/README.md สำหรับที่มาไฟล์)
// รัน: npm run wordlists:import
// ผลลัพธ์: public/words.generated.json — รวม Word[] จากทั้งสามคลัง พร้อมรูปแปรและคำนิยาม
//          หน้าเว็บ fetch() มา seed เข้า IndexedDB ตอนเปิดแอปครั้งแรก (ไม่ bundle เข้า JS เพราะไฟล์ใหญ่)
//          data/wordlists/wordforms.generated.json — รูปแปรแยกตามคลัง ใช้โดย scripts/validate-episode.ts เท่านั้น
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { collectAllForms, parseWordListCsv } from '../src/lib/wordlists/import'
import type { Word, WordSource } from '../src/types'
import { readXlsxRows } from './lib/xlsx'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

const SOURCES: { source: WordSource; file: string }[] = [
  { source: 'NGSL', file: 'data/wordlists/ngsl.csv' },
  { source: 'TSL', file: 'data/wordlists/tsl.csv' },
  { source: 'BSL', file: 'data/wordlists/bsl.csv' },
]

// มีเฉพาะ NGSL กับ TSL — โครงการ NGSL ไม่ได้เผยแพร่ไฟล์คำนิยามของ BSL
const DEFINITION_FILES = ['data/wordlists/ngsl-definitions.xlsx', 'data/wordlists/tsl-definitions.xlsx']

function loadDefinitions(): Map<string, string> {
  const definitions = new Map<string, string>()

  for (const file of DEFINITION_FILES) {
    const rows = readXlsxRows(path.join(ROOT, file))
    let added = 0

    for (const [term, definition] of rows.slice(1)) {
      if (!term || !definition) continue
      const key = term.trim().toLowerCase()
      if (definitions.has(key)) continue // คำซ้ำข้ามคลัง ใช้คำนิยามแรกที่เจอ (NGSL มาก่อน)
      definitions.set(key, definition.trim())
      added += 1
    }

    console.log(`คำนิยาม: +${added} คำ จาก ${file}`)
  }

  return definitions
}

const definitions = loadDefinitions()
const byTerm = new Map<string, Word>()
const wordforms: Record<string, Record<string, string[]>> = {}

for (const { source, file } of SOURCES) {
  const csvText = readFileSync(path.join(ROOT, file), 'utf-8')
  const parsed = parseWordListCsv(csvText, source)
  wordforms[source] = parsed.formsByTerm

  let withDefinition = 0
  let merged = 0

  for (const word of parsed.words) {
    const definition = definitions.get(word.term)
    if (definition) withDefinition += 1

    // คำเดียวกันที่อยู่หลายคลัง (TSL ∩ BSL) ต้องเป็นรายการเดียว ไม่งั้นสถานะการเรียนรู้จะถูกแยกกัน
    const existing = byTerm.get(word.term)
    if (existing) {
      existing.sources = [...new Set([...existing.sources, ...word.sources])]
      existing.forms = [...new Set([...existing.forms, ...word.forms])]
      existing.definition ??= definition
      merged += 1
      continue
    }

    if (definition) word.definition = definition
    byTerm.set(word.term, word)
  }

  const knownFormsCount = collectAllForms(parsed).size
  console.log(
    `${source}: ${parsed.words.length} คำตั้งต้น (${knownFormsCount} รูปแปรรวม, มีคำนิยาม ${withDefinition} คำ, ซ้ำกับคลังก่อนหน้า ${merged} คำ) จาก ${file}`,
  )
}

const allWords: Word[] = [...byTerm.values()]

writeFileSync(path.join(ROOT, 'public/words.generated.json'), JSON.stringify(allWords))
writeFileSync(path.join(ROOT, 'data/wordlists/wordforms.generated.json'), JSON.stringify(wordforms, null, 2))

const definedCount = allWords.filter((w) => w.definition).length
console.log(`\nรวม ${allWords.length} คำ (มีคำนิยาม ${definedCount} คำ) → public/words.generated.json`)
console.log('รูปแปรทั้งหมดแยกตามคลัง → data/wordlists/wordforms.generated.json')
