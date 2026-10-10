import { useCallback, useEffect, useRef, useState } from 'react'
import type { ParsedSentence } from './text'

export type NarrationRate = 0.75 | 1 | 1.25

interface UseNarrationOptions {
  onSentenceStart?: (index: number) => void
}

// เล่นเสียงบรรยายทีละประโยค แล้วต่อประโยคถัดไปใน onend
// ไม่ใช้ event "boundary" ของ speechSynthesis เพราะ Safari บน iOS ส่ง event นี้ไม่ครบ
// การแบ่งเป็นประโยคทำให้ไฮไลต์ตรงกับเสียงเสมอ และหยุด/เล่นต่อกลางตอนได้
export function useNarration(sentences: ParsedSentence[], options: UseNarrationOptions = {}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [playing, setPlaying] = useState(false)
  const [rate, setRate] = useState<NarrationRate>(1)

  const stoppedRef = useRef(true)
  const rateRef = useRef<NarrationRate>(rate)
  const onSentenceStartRef = useRef(options.onSentenceStart)

  rateRef.current = rate
  onSentenceStartRef.current = options.onSentenceStart

  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window

  const stop = useCallback(() => {
    stoppedRef.current = true
    if (supported) window.speechSynthesis.cancel()
    setPlaying(false)
    setActiveIndex(null)
  }, [supported])

  const speakFrom = useCallback(
    (startIndex: number) => {
      if (!supported) return

      window.speechSynthesis.cancel()
      stoppedRef.current = false
      setPlaying(true)

      const speakAt = (index: number) => {
        if (stoppedRef.current) return
        const sentence = sentences[index]
        if (!sentence) {
          setPlaying(false)
          setActiveIndex(null)
          return
        }

        setActiveIndex(index)
        onSentenceStartRef.current?.(index)

        const utterance = new SpeechSynthesisUtterance(sentence.text)
        utterance.lang = 'en-US'
        utterance.rate = rateRef.current
        utterance.onend = () => {
          if (stoppedRef.current) return
          speakAt(index + 1)
        }
        utterance.onerror = () => {
          stoppedRef.current = true
          setPlaying(false)
        }
        window.speechSynthesis.speak(utterance)
      }

      speakAt(startIndex)
    },
    [sentences, supported],
  )

  // หยุดเสียงเมื่อออกจากหน้า ไม่งั้นเสียงจะเล่นต่อข้ามหน้า
  useEffect(() => stop, [stop])

  return { activeIndex, playing, rate, setRate, speakFrom, stop, supported }
}
