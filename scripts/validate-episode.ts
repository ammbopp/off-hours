// ตรวจตอนที่เขียนไว้ใน src/data/episodes/*.ts ก่อนใช้งานจริง (ดู README หัวข้อ "การสร้างเนื้อเรื่อง")
// รัน: npm run episodes:validate                 → ตรวจทุกตอนใน src/data/episodes
//      npm run episodes:validate episode-01.ts    → ตรวจไฟล์เดียว
import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateEpisode } from '../src/features/story/validateEpisode'
import type { Episode, WordSource } from '../src/types'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const EPISODES_DIR = path.join(ROOT, 'src/data/episodes')

// ชื่อเฉพาะในเรื่อง (ตัวละคร/บริษัท/คำย่อ) ไม่ใช่คำศัพท์ที่ต้องฝึก — นับเป็น "รู้แล้ว" เสมอ
// แก้รายการนี้พร้อมกับ src/features/story/storyBible.ts และ src/features/chat/characters.ts
const PROPER_NOUNS = [
  'northfield',
  'partners',
  'daniel',
  'reyes',
  'chloe',
  'bennett',
  'liam',
  'oconnor',
  'o',
  'connor',
  'q3',
]

type Wordforms = Record<WordSource, Record<string, string[]>>

function loadWordforms(): Wordforms {
  const raw = readFileSync(path.join(ROOT, 'data/wordlists/wordforms.generated.json'), 'utf-8')
  return JSON.parse(raw)
}

// ฐาน "คำที่รู้แล้ว" = รูปแปรทั้งหมดของ NGSL (ควบคุมระดับภาษาของเนื้อเรื่อง)
// รวมกับรูปแปรของคำเป้าหมายตอนนี้เอง (เพราะกำลังสอนคำนั้นตรงๆ ไม่ควรนับเป็น "คำนอกคลัง")
function buildKnownVocabulary(episode: Episode, wordforms: Wordforms): Set<string> {
  const known = new Set<string>(PROPER_NOUNS)
  for (const forms of Object.values(wordforms.NGSL)) {
    for (const f of forms) known.add(f)
  }
  for (const wordId of episode.targetWordIds) {
    const [source, term] = wordId.split(':') as [WordSource, string]
    const forms = wordforms[source]?.[term] ?? [term]
    for (const f of forms) known.add(f)
  }
  return known
}

function countWords(content: string): number {
  return (content.match(/[a-zA-Z']+/g) ?? []).length
}

async function main() {
  const requested = process.argv.slice(2)
  const files =
    requested.length > 0
      ? requested.map((f) => (f.endsWith('.ts') ? f : `${f}.ts`))
      : readdirSync(EPISODES_DIR).filter((f) => /^episode-.+\.ts$/.test(f))

  const wordforms = loadWordforms()
  let allValid = true

  for (const file of files.sort()) {
    const mod = await import(path.join(EPISODES_DIR, file))
    const episode = mod.episode as Episode
    const targetTerms = episode.targetWordIds.map((id) => id.split(':')[1])
    const knownVocabulary = buildKnownVocabulary(episode, wordforms)
    const result = validateEpisode({ content: episode.content, targetTerms, knownVocabulary })
    const wordCount = countWords(episode.content)

    console.log(`\n=== ${file}: ${episode.title} ===`)
    console.log(`คำทั้งหมด: ${wordCount} คำ | คำเป้าหมาย: ${targetTerms.length} คำ (${targetTerms.join(', ')})`)
    if (wordCount < 800 || wordCount > 1200) {
      console.log(`⚠️  ความยาวนอกช่วง 800–1,200 คำที่แผนกำหนด`)
    }

    if (result.valid) {
      console.log('✅ ผ่านตัวตรวจ')
    } else {
      allValid = false
      console.log('❌ ไม่ผ่านตัวตรวจ:')
      for (const issue of result.issues) {
        console.log(`   - ${issue.message}`)
      }
    }
  }

  if (!allValid) process.exitCode = 1
}

main()
