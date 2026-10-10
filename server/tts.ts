// โครงฟังก์ชันแปลงข้อความเป็นเสียง — เริ่มด้วย speechSynthesis ในเบราว์เซอร์ก่อน (ไม่ต้องผ่านฟังก์ชันนี้)
// แล้วค่อยต่อ API เสียงสังเคราะห์ภายนอกทีหลัง (ดูตารางราคาใน README หลัก หัวข้อ "ค่าใช้จ่าย")

interface TtsRequestBody {
  text: string
  voiceId?: string
}

export async function handler(request: Request): Promise<Response> {
  const body = (await request.json()) as TtsRequestBody
  void body // TODO: เรียก API เสียงสังเคราะห์ แล้วคืนไฟล์เสียง (เก็บ cache ไว้เล่นซ้ำ)

  return new Response(JSON.stringify({ error: 'tts ยังไม่ได้ต่อผู้ให้บริการจริง' }), {
    status: 501,
    headers: { 'Content-Type': 'application/json' },
  })
}
