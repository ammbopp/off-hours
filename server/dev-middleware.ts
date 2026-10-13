// ปลั๊กอิน Vite เฉพาะตอน dev (npm run dev) — แปลง request ของ Node (connect middleware) ให้เป็น
// Request/Response แบบมาตรฐานเว็บที่ handler ใน server/llm/*.ts ใช้ เพื่อให้ทดสอบ API ได้ทันทีในเครื่อง
// โดยไม่ต้องตัดสินใจเรื่องโฮสติ้ง (Vercel/Netlify/Cloudflare) ก่อน — ไฟล์นี้ไม่เกี่ยวกับตอน build จริง
// เพราะ production ต้องย้าย handler ไปตามตารางใน server/README.md อยู่ดี
import type { Plugin } from 'vite'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { handler as generateEpisodeHandler } from './llm/generate-episode'
import { handler as chatReplyHandler } from './llm/chat-reply'

type Handler = (request: Request) => Promise<Response>

const ROUTES: Record<string, Handler> = {
  '/api/llm/generate-episode': generateEpisodeHandler,
  '/api/llm/chat-reply': chatReplyHandler,
}

async function readBody(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(chunk as Buffer)
  return Buffer.concat(chunks).toString('utf-8')
}

async function respond(res: ServerResponse, response: Response): Promise<void> {
  res.statusCode = response.status
  response.headers.forEach((value, key) => res.setHeader(key, value))
  res.end(await response.text())
}

export function llmDevApiPlugin(): Plugin {
  return {
    name: 'off-hours-llm-dev-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const route = req.url ? ROUTES[req.url] : undefined
        if (!route || req.method !== 'POST') return next()

        try {
          const body = await readBody(req)
          const request = new Request(`http://localhost${req.url}`, { method: 'POST', body })
          await respond(res, await route(request))
        } catch (err) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: err instanceof Error ? err.message : 'dev middleware error' }))
        }
      })
    },
  }
}
