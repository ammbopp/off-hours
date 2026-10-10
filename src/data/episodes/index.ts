import type { Episode } from '../../types'
import { episode as episode1 } from './episode-01'
import { episode as episode2 } from './episode-02'
import { episode as episode3 } from './episode-03'

// ตอนทั้งหมดผ่าน npm run episodes:validate แล้ว (คำเป้าหมายครบ + สัดส่วนคำนอกคลังไม่เกินเกณฑ์)
export const episodes: Episode[] = [episode1, episode2, episode3]
