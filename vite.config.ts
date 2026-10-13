import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { llmDevApiPlugin } from './server/dev-middleware'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // โหลด .env.local เข้า process.env (ไม่ใส่ prefix ว่าง เพื่ออ่านได้ทุกตัวแปร ไม่ใช่แค่ที่ขึ้นต้น VITE_)
  // ให้ server/llm/*.ts อ่าน GEMINI_API_KEY ได้ตอน dev — คีย์นี้ไม่เคยถูกส่งเข้าโค้ดฝั่งเบราว์เซอร์
  // เพราะปลั๊กอิน llmDevApiPlugin รันอยู่ในโปรเซส Node ของ Vite dev server เท่านั้น
  const env = loadEnv(mode, process.cwd(), '')
  for (const [key, value] of Object.entries(env)) {
    if (!(key in process.env)) process.env[key] = value
  }

  return {
    plugins: [react(), llmDevApiPlugin()],
  }
})
