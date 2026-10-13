import { useCallback, useEffect, useRef, useState } from 'react'
import { ACCENT_LANG } from '../../lib/speech'
import type { Accent, NarrationRate } from '../../types'
import type { ParsedSentence } from './text'

export type { NarrationRate }

interface UseNarrationOptions {
  onSentenceStart?: (index: number) => void
  accent?: Accent // สำเนียงเสียงบรรยาย อ่านค่าล่าสุดทุกครั้งที่พูดประโยคใหม่ ไม่ต้องรอ mount ใหม่เมื่อผู้ใช้เปลี่ยนในหน้าตั้งค่า
  initialRate?: NarrationRate
}

// เล่นเสียงบรรยายทีละประโยค แล้วต่อประโยคถัดไปใน onend
// ไม่ใช้ event "boundary" ของ speechSynthesis เพราะ Safari บน iOS ส่ง event นี้ไม่ครบ
// การแบ่งเป็นประโยคทำให้ไฮไลต์ตรงกับเสียงเสมอ และหยุด/เล่นต่อกลางตอนได้
export function useNarration(sentences: ParsedSentence[], options: UseNarrationOptions = {}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [playing, setPlaying] = useState(false)
  const [rate, setRate] = useState<NarrationRate>(options.initialRate ?? 1)

  const stoppedRef = useRef(true)
  const rateRef = useRef<NarrationRate>(rate)
  const accentRef = useRef<Accent>(options.accent ?? 'US')
  const onSentenceStartRef = useRef(options.onSentenceStart)

  rateRef.current = rate
  accentRef.current = options.accent ?? 'US'
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
        utterance.lang = ACCENT_LANG[accentRef.current]
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
