// โครงฟังก์ชันถอดเสียงพูด — ตัวรู้จำเสียงของ Safari ใช้ไม่ได้ในเว็บแอปบนหน้าจอโฮม (WebKit bug 225298)
// จึงต้องอัดเสียงจากไมโครโฟนแล้วส่งไฟล์มาที่นี่เสมอ ห้ามพึ่ง SpeechRecognition ของเบราว์เซอร์

export async function handler(request: Request): Promise<Response> {
  const audio = await request.arrayBuffer()
  void audio // TODO: ส่งต่อให้บริการถอดเสียงบนคลาวด์ แล้วคืนบทถอดเสียง

  return new Response(JSON.stringify({ error: 'stt ยังไม่ได้ต่อผู้ให้บริการจริง' }), {
    status: 501,
    headers: { 'Content-Type': 'application/json' },
  })
}
