// โครงฟังก์ชันซิงก์ข้อมูล — IndexedDB ในเครื่องเป็นหลัก แล้วซิงก์ขึ้นฐานข้อมูลเล็กบนคลาวด์
// เพื่อให้ iPhone กับ iPad เห็นความคืบหน้าเดียวกัน และกันข้อมูลหายถ้า Safari ล้างพื้นที่เก็บข้อมูล

interface SyncRequestBody {
  words: unknown[]
  episodes: unknown[]
  messages: unknown[]
  settings: unknown
}

export async function handler(request: Request): Promise<Response> {
  const body = (await request.json()) as SyncRequestBody
  void body // TODO: เขียนลงฐานข้อมูลบนคลาวด์ (เลือกเจ้าเดียวกับโฮสติ้งหรือ serverless DB แยกก็ได้)

  return new Response(JSON.stringify({ error: 'sync ยังไม่ได้ต่อฐานข้อมูลบนคลาวด์' }), {
    status: 501,
    headers: { 'Content-Type': 'application/json' },
  })
}
