import { useEffect, useMemo, useState } from 'react'
import { TappableText } from '../components/TappableText'
import { WordCard } from '../components/WordCard'
import { getAllEpisodes, getAllWords, putWord } from '../lib/db'
import { recordEncounter } from '../lib/srs'
import { makeBlankWord } from '../lib/wordlists/import'
import type { ContextualTranslation, Episode, Word } from '../types'

interface SelectedWord {
  term: string
  translation?: ContextualTranslation
}

export function ReadPage() {
  const [episode, setEpisode] = useState<Episode | null>(null)
  const [words, setWords] = useState<Word[]>([])
  const [selected, setSelected] = useState<SelectedWord | null>(null)

  useEffect(() => {
    getAllEpisodes().then((episodes) => setEpisode(episodes.at(-1) ?? null))
    getAllWords().then(setWords)
  }, [])

  const targetTerms = useMemo(() => {
    if (!episode) return new Set<string>()
    const terms = words
      .filter((w) => episode.targetWordIds.includes(w.id))
      .map((w) => w.term.toLowerCase())
    return new Set(terms)
  }, [episode, words])

  async function handleWordTap(term: string) {
    if (!episode) return

    let word = words.find((w) => w.term.toLowerCase() === term.toLowerCase())
    if (!word) {
      word = makeBlankWord(term, 'custom')
    }

    const updated = recordEncounter(word, {
      mode: 'read',
      episodeId: episode.id,
      at: new Date().toISOString(),
      result: 'looked_up',
    })
    await putWord(updated)
    setWords((prev) => [...prev.filter((w) => w.id !== updated.id), updated])

    setSelected({
      term,
      translation: episode.contextualTranslations[updated.id],
    })
  }

  if (!episode) {
    return (
      <div className="page">
        <p>ยังไม่มีตอนให้อ่าน — เพิ่มข้อมูลตัวอย่างหรือรอ features/story/generateEpisode</p>
      </div>
    )
  }

  return (
    <div className="page">
      <h1>{episode.title}</h1>
      <TappableText text={episode.content} targetTerms={targetTerms} onWordTap={handleWordTap} />
      {selected && (
        <WordCard term={selected.term} translation={selected.translation} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
