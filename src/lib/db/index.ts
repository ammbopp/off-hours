import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import { DEFAULT_SETTINGS, type Word, type Episode, type Character, type Message, type ReadingProgress, type Settings } from '../../types'

interface OffHoursDB extends DBSchema {
  words: { key: string; value: Word; indexes: { nextReviewAt: string } }
  episodes: { key: string; value: Episode; indexes: { order: number } }
  characters: { key: string; value: Character }
  messages: { key: string; value: Message; indexes: { characterId: string } }
  progress: { key: string; value: ReadingProgress }
  settings: { key: 'settings'; value: Settings }
  meta: { key: string; value: unknown }
}

const DB_NAME = 'off-hours'
const DB_VERSION = 2

// bump เมื่อ public/words.generated.json เปลี่ยนรูปแบบหรือเนื้อหา
// แอปจะ fetch ไฟล์คลังคำก็ต่อเมื่อเลขนี้ไม่ตรงกับที่เก็บไว้ในเครื่อง จึงไม่ต้องโหลด ~1.4MB ทุกครั้งที่เปิดแอป
export const CORPUS_VERSION = 3

let dbPromise: Promise<IDBPDatabase<OffHoursDB>> | null = null

// เก็บข้อมูลในเครื่องด้วย IndexedDB ก่อน แล้วค่อยต่อการซิงก์กับฐานข้อมูลบนคลาวด์ทีหลัง (ดู server/sync.ts)
export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<OffHoursDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('words')) {
          const store = db.createObjectStore('words', { keyPath: 'id' })
          store.createIndex('nextReviewAt', 'nextReviewAt')
        }
        if (!db.objectStoreNames.contains('episodes')) {
          const store = db.createObjectStore('episodes', { keyPath: 'id' })
          store.createIndex('order', 'order')
        }
        if (!db.objectStoreNames.contains('characters')) {
          db.createObjectStore('characters', { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains('messages')) {
          const store = db.createObjectStore('messages', { keyPath: 'id' })
          store.createIndex('characterId', 'characterId')
        }
        if (!db.objectStoreNames.contains('progress')) {
          db.createObjectStore('progress', { keyPath: 'episodeId' })
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings')
        }
        if (!db.objectStoreNames.contains('meta')) {
          db.createObjectStore('meta')
        }
      },
    })

    // ขอโหมดเก็บถาวรเพื่อลดโอกาสที่ Safari จะล้างข้อมูลเมื่อพื้นที่เต็มหรือไม่ได้ใช้นาน
    void navigator.storage?.persist?.()
  }
  return dbPromise
}

async function getMeta<T>(key: string): Promise<T | undefined> {
  return (await (await getDB()).get('meta', key)) as T | undefined
}

async function setMeta(key: string, value: unknown): Promise<void> {
  await (await getDB()).put('meta', value, key)
}

export async function getAllWords(): Promise<Word[]> {
  return (await getDB()).getAll('words')
}

export async function putWord(word: Word): Promise<void> {
  await (await getDB()).put('words', word)
}

export async function getDueWords(before: string): Promise<Word[]> {
  const all = await getAllWords()
  return all.filter((w) => w.nextReviewAt !== null && w.nextReviewAt <= before)
}

export async function getAllEpisodes(): Promise<Episode[]> {
  const all = await (await getDB()).getAll('episodes')
  return all.sort((a, b) => a.order - b.order)
}

export async function putEpisode(episode: Episode): Promise<void> {
  await (await getDB()).put('episodes', episode)
}

export async function getAllCharacters(): Promise<Character[]> {
  return (await getDB()).getAll('characters')
}

export async function putCharacter(character: Character): Promise<void> {
  await (await getDB()).put('characters', character)
}

export async function getMessagesForCharacter(characterId: string): Promise<Message[]> {
  const all = await (await getDB()).getAllFromIndex('messages', 'characterId', characterId)
  return all.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
}

export async function putMessage(message: Message): Promise<void> {
  await (await getDB()).put('messages', message)
}

export async function getProgress(episodeId: string): Promise<ReadingProgress | undefined> {
  return (await getDB()).get('progress', episodeId)
}

export async function getAllProgress(): Promise<ReadingProgress[]> {
  return (await getDB()).getAll('progress')
}

// อัปเดตแบบรวมกับของเดิมเสมอ ไม่เขียนทับทั้งก้อน เพราะมีสองจุดที่เขียนความคืบหน้าพร้อมกันได้
// (การเลื่อนจอ/เสียงบรรยาย เขียน lastSentenceIndex ส่วนปุ่ม "อ่านจบตอนนี้" เขียน finishedAt)
// และ lastSentenceIndex เดินหน้าอย่างเดียว กันไม่ให้ค่าถอยหลังเมื่อผู้ใช้เลื่อนกลับขึ้นไป
//
// get กับ put ต้องอยู่ใน transaction เดียวกัน (ไม่ใช่เรียก db.get แล้วค่อย db.put แยกกัน) เพราะถ้าแยกกัน
// สอง transaction อัตโนมัติตรงกลางมีช่องให้ updateProgress อีกคอลที่ทำงานคาบเกี่ยวกันแทรกเข้ามาได้
// (เช่น IntersectionObserver เซฟตำแหน่งตอนเลื่อนจอ ชนกับตอนกดปุ่ม "อ่านจบตอนนี้" พอดี) ทำให้ get ของทั้งคู่
// เห็นค่าเดิมก่อนอีกฝั่งจะเขียน แล้ว put ทีหลังทับค่าที่อีกฝั่งเพิ่งเขียนไปจนข้อมูลหาย (เช่น finishedAt หลุด)
// รวมเป็น transaction เดียวทำให้ IndexedDB serialize การอ่าน+เขียนของแต่ละคอลให้อะตอมมิกจริง
export async function updateProgress(
  episodeId: string,
  patch: { lastSentenceIndex?: number; finishedAt?: string },
): Promise<void> {
  const db = await getDB()
  const tx = db.transaction('progress', 'readwrite')
  const store = tx.objectStore('progress')
  const existing = await store.get(episodeId)

  await store.put({
    episodeId,
    lastSentenceIndex: Math.max(existing?.lastSentenceIndex ?? 0, patch.lastSentenceIndex ?? 0),
    finishedAt: patch.finishedAt ?? existing?.finishedAt ?? null,
    updatedAt: new Date().toISOString(),
  })
  await tx.done
}

// รวมกับ DEFAULT_SETTINGS เสมอ (ไม่คืนค่าที่บันทึกไว้ตรงๆ) เพราะทุกครั้งที่เพิ่มฟิลด์ใหม่ใน Settings
// (เช่น readingFont/readingTheme) เครื่องที่เคยบันทึก settings ไว้ก่อนหน้านี้จะไม่มีฟิลด์ใหม่ในค่าที่อ่านได้
// ถ้าคืนค่าตรงๆ หน้าที่อ่านไปใช้จะเจอ undefined แทนค่าเริ่มต้น การรวมตรงนี้ที่เดียวกันลืมแก้จุดอื่นไม่ได้
export async function getSettings(): Promise<Settings | undefined> {
  const stored = await (await getDB()).get('settings', 'settings')
  return stored ? { ...DEFAULT_SETTINGS, ...stored } : undefined
}

export async function putSettings(settings: Settings): Promise<void> {
  // store นี้ไม่มี keyPath จึงต้องส่ง key แยก
  await (await getDB()).put('settings', settings, 'settings')
}

// นำเข้าคลังคำเฉพาะเมื่อเวอร์ชันในเครื่องตามหลัง แล้ว "รวม" กับของเดิมแทนการเขียนทับ
// เพื่อไม่ให้สถานะการเรียนรู้ของแต่ละคำ (status, encounters, srs) หายไปเมื่ออัปเดตคลังคำ
export async function syncCorpus(loadWords: () => Promise<Word[]>): Promise<number> {
  const storedVersion = await getMeta<number>('corpusVersion')
  if (storedVersion === CORPUS_VERSION) return 0

  const incoming = await loadWords()
  const db = await getDB()
  const existing = new Map((await db.getAll('words')).map((w) => [w.id, w]))

  const tx = db.transaction('words', 'readwrite')
  const store = tx.objectStore('words')
  for (const word of incoming) {
    const previous = existing.get(word.id)
    void store.put(
      previous
        ? { ...word, status: previous.status, nextReviewAt: previous.nextReviewAt, encounters: previous.encounters, srs: previous.srs }
        : word,
    )
  }
  await tx.done

  await setMeta('corpusVersion', CORPUS_VERSION)
  return incoming.length
}

// ตอนและตัวละครเป็นเนื้อหาคงที่ เขียนทับได้ทุกครั้งที่เปิดแอป เพื่อให้แก้ไขตอนแล้วเห็นผลทันที
export async function syncContent(content: { episodes: Episode[]; characters: Character[] }): Promise<void> {
  const db = await getDB()
  const tx = db.transaction(['episodes', 'characters'], 'readwrite')
  for (const episode of content.episodes) void tx.objectStore('episodes').put(episode)
  for (const character of content.characters) void tx.objectStore('characters').put(character)
  await tx.done
}

// แชทตัวอย่างใส่ครั้งเดียว ไม่เขียนทับ เพราะเป็นบทสนทนาที่ผู้ใช้คุยต่อได้
export async function seedMessagesOnce(messages: Message[]): Promise<void> {
  if (await getMeta<boolean>('seededMessages')) return
  for (const message of messages) {
    await putMessage(message)
  }
  await setMeta('seededMessages', true)
}
