import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { Word, Episode, Character, Message, Settings } from '../../types'

interface OffHoursDB extends DBSchema {
  words: { key: string; value: Word; indexes: { nextReviewAt: string } }
  episodes: { key: string; value: Episode; indexes: { order: number } }
  characters: { key: string; value: Character }
  messages: { key: string; value: Message; indexes: { characterId: string } }
  settings: { key: 'settings'; value: Settings }
}

const DB_NAME = 'off-hours'
const DB_VERSION = 1

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
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings')
        }
      },
    })

    // ขอโหมดเก็บถาวรเพื่อลดโอกาสที่ Safari จะล้างข้อมูลเมื่อพื้นที่เต็มหรือไม่ได้ใช้นาน
    void navigator.storage?.persist?.()
  }
  return dbPromise
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

export async function getSettings(): Promise<Settings | undefined> {
  return (await getDB()).get('settings', 'settings')
}

export async function putSettings(settings: Settings): Promise<void> {
  await (await getDB()).put('settings', settings, 'settings')
}

// ใส่ข้อมูลตัวอย่าง (ตัวละคร/คำ/ตอน) ครั้งแรกที่เปิดแอป ถ้ายังไม่มีข้อมูลในเครื่อง
export async function seedIfEmpty(seed: {
  words: Word[]
  characters: Character[]
  episodes: Episode[]
}): Promise<boolean> {
  const db = await getDB()
  const existing = await db.count('episodes')
  if (existing > 0) return false

  const tx = db.transaction(['words', 'characters', 'episodes'], 'readwrite')
  await Promise.all([
    ...seed.words.map((w) => tx.objectStore('words').put(w)),
    ...seed.characters.map((c) => tx.objectStore('characters').put(c)),
    ...seed.episodes.map((e) => tx.objectStore('episodes').put(e)),
  ])
  await tx.done
  return true
}
