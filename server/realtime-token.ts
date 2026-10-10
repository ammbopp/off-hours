// โครงฟังก์ชันออกโทเคนชั่วคราวสำหรับหน้าโทรสด (speech-to-speech)
// หน้าเว็บต้องไม่ถือคีย์ API ตัวจริง — ขอโทเคนอายุสั้นจากที่นี่แล้วต่อ API ตรงจากเบราว์เซอร์
// ต้นทุนต่อนาทีสูงสุดในแอป (ดูตาราง "ค่าใช้จ่าย" ใน README หลัก) ตัดออกก่อนได้ถ้าเวลาพัฒนาไม่พอ

export async function handler(): Promise<Response> {
  // TODO: เรียก API ของผู้ให้บริการ speech-to-speech เพื่อออกโทเคนชั่วคราว แล้วนับนาทีโทรของเดือนนี้
  return new Response(JSON.stringify({ error: 'realtime-token ยังไม่ได้ต่อผู้ให้บริการจริง' }), {
    status: 501,
    headers: { 'Content-Type': 'application/json' },
  })
}
