export interface StoryBible {
  setting: string
  mainConflict: string
  characterNotes: string
}

// คัมภีร์เรื่องหนึ่งหน้า — แก้ตรงนี้เมื่อเริ่มเบื่อโครงเรื่องเดิม (ดู README หัวข้อ "การสร้างเนื้อเรื่อง")
export const storyBible: StoryBible = {
  setting:
    'ออฟฟิศของบริษัทข้ามชาติสมมติชื่อ Northfield Partners สาขากรุงเทพฯ ผู้ใช้เป็นพนักงานใหม่แผนกที่ปรึกษาธุรกิจ',
  mainConflict:
    'โปรเจกต์ใหญ่กำลังจะพลาดกำหนดส่ง และมีคนในทีมที่ดูเหมือนปิดบังอะไรบางอย่างเกี่ยวกับสาเหตุ',
  characterNotes:
    'เพื่อนร่วมงาน เพื่อนสนิท และแฟน ควรมีที่มาและสำเนียงต่างกัน (ดู src/features/chat/characters.ts) และคงบุคลิกเดิมทุกตอน',
}
