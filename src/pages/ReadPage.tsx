import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
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
  const { episodeId } = useParams<{ episodeId?: string }>()
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [words, setWords] = useState<Word[]>([])
  const [selected, setSelected] = useState<SelectedWord | null>(null)

  useEffect(() => {
    getAllEpisodes().then(setEpisodes)
    getAllWords().then(setWords)
  }, [])

  const index = episodeId ? episodes.findIndex((e) => e.id === episodeId) : 0
  const episode = episodes[index === -1 ? 0 : index] ?? null
  const nextEpisode = episode ? episodes[episodes.findIndex((e) => e.id === episode.id) + 1] : undefined

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
        <p>ยังไม่มีตอนให้อ่าน — รอ npm run wordlists:import และ features/story/generateEpisode</p>
      </div>
    )
  }

  return (
    <div className="page">
      <h1>{episode.title}</h1>
      <TappableText text={episode.content} targetTerms={targetTerms} onWordTap={handleWordTap} />

      <div className="read-footer">
        <Link className="button" to={`/quest/${episode.id}`}>
          ทำภารกิจท้ายตอน
        </Link>
        {nextEpisode && (
          <Link className="button button-outline" to={`/read/${nextEpisode.id}`}>
            ตอนต่อไป: {nextEpisode.title}
          </Link>
        )}
      </div>

      {selected && (
        <WordCard term={selected.term} translation={selected.translation} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
