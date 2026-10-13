# ฟังก์ชันฝั่งเซิร์ฟเวอร์

หน้าที่: ถือคีย์ API ของผู้ให้บริการ AI/เสียง และเป็นจุดเดียวที่หน้าเว็บเรียกเข้ามา — คีย์ API ต้องไม่อยู่ในโค้ดฝั่งหน้าเว็บเด็ดขาด เพราะอ่านได้จากเบราว์เซอร์

ไฟล์ในนี้เป็น handler ที่รับ `Request` คืน `Response` แบบมาตรฐานเว็บ ยังไม่ผูกกับผู้ให้บริการโฮสติ้งเจ้าใด (Vercel/Netlify/Cloudflare — ยังไม่ตัดสินใจ) แต่ **ใช้งานได้แล้วตอน dev** ผ่าน `server/dev-middleware.ts` ซึ่งเป็นปลั๊กอิน Vite ที่ mount ทั้งสอง route นี้เข้ากับ `npm run dev` ให้อัตโนมัติ (ดู `vite.config.ts`) — ไม่ต้องรอตัดสินใจเรื่องโฮสติ้งก่อนถึงจะทดสอบได้ เมื่อเลือกโฮสติ้งจริงแล้วค่อยย้าย/ปรับไฟล์ตามตารางนี้ (ตัว handler เองไม่ต้องแก้ เพราะเขียนด้วย Fetch API มาตรฐานแล้ว):

| โฮสติ้ง | ย้ายไปที่ |
| --- | --- |
| Vercel | `api/` (ชื่อไฟล์ตรงกับ path, export เป็น Edge Function) |
| Netlify | `netlify/functions/` |
| Cloudflare Pages | `functions/` |

## ตั้งค่าคีย์ (ใช้ได้ทันทีตอน dev)

1. คัดลอก `.env.example` เป็น `.env.local` (gitignore ไว้แล้วผ่านรูปแบบ `*.local`)
2. ขอคีย์ฟรีที่ https://aistudio.google.com/apikey ใส่ใน `GEMINI_API_KEY`
3. รัน `npm run dev` ตามปกติ — `vite.config.ts` จะโหลด `.env.local` เข้า `process.env` ให้เอง และ
   `server/dev-middleware.ts` จะ mount `/api/llm/generate-episode` กับ `/api/llm/chat-reply` ให้พร้อมใช้

คีย์นี้อ่านเฉพาะในโปรเซส Node ของ Vite dev server เท่านั้น ไม่เคยถูกส่งเข้าโค้ดฝั่งเบราว์เซอร์

## รายการฟังก์ชัน

| ไฟล์ | ใช้ทำอะไร | เรียกจาก | สถานะ |
| --- | --- | --- | --- |
| `llm/generate-episode.ts` | สร้างตอนใหม่จากคัมภีร์เรื่อง + สรุปตอนก่อน + คำเป้าหมาย ด้วย Gemini | `src/features/story/generateEpisode.ts` | ต่อแล้ว |
| `llm/chat-reply.ts` | ให้ตัวละครตอบแชทด้วย Gemini พร้อมคำแนะนำภาษา (languageTips) | `src/features/chat/getChatReply.ts` → `src/pages/ChatPage.tsx` | ต่อแล้ว |
| `llm/gemini-client.ts` | สร้าง `GoogleGenAI` client ตัวเดียวใช้ร่วมกันทั้งสองฟังก์ชันข้างบน | — | ต่อแล้ว |
| `dev-middleware.ts` | ปลั๊กอิน Vite เฉพาะ dev แปลง request ของ Node ให้เป็น Request/Response มาตรฐานเว็บ | `vite.config.ts` | ใช้เฉพาะ dev |
| `tts.ts` | แปลงข้อความเป็นเสียง เก็บไฟล์ไว้เล่นซ้ำ | หน้าอ่าน/แชทตอนฟังเสียง | โครงเปล่า |
| `stt.ts` | ถอดเสียงพูดของผู้ใช้ (ไมโครโฟน) | ฟีเจอร์พูดตามตัวละคร | โครงเปล่า |
| `realtime-token.ts` | ออกโทเคนชั่วคราวสำหรับต่อ speech-to-speech API ตรงจากเบราว์เซอร์ | หน้าโทรสด | โครงเปล่า |
| `sync.ts` | ซิงก์ข้อมูลในเครื่อง (IndexedDB) กับฐานข้อมูลบนคลาวด์ | ทุกหน้าที่เขียนข้อมูล | โครงเปล่า |

ไฟล์ที่ยังเป็นโครงเปล่าคืน 501 ไว้ก่อน และทุกไฟล์ (รวมที่ต่อแล้ว) ต้องอ่านคีย์จาก environment variable เท่านั้น ห้าม hardcode — ดู `gemini-client.ts` เป็นตัวอย่าง
