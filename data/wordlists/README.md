# คลังคำ (NGSL / TSL / BSL)

ดาวน์โหลดไฟล์คลังคำจาก NGSL Project แล้ววางไว้ในโฟลเดอร์นี้ (ไม่ต้อง commit ไฟล์ขนาดใหญ่เข้า git ถ้าไม่จำเป็น):

- NGSL — https://www.newgeneralservicelist.com/word-lists
- TOEIC Service List (TSL) — https://www.newgeneralservicelist.com/toeic-service-list
- Business Service List (BSL) — https://www.newgeneralservicelist.com/word-lists

ชื่อไฟล์ที่ `src/lib/wordlists/import.ts` คาดไว้เป็นตัวอย่าง:

- `ngsl.csv`
- `tsl.csv`
- `bsl.csv`

รูปแบบคอลัมน์จริงต้องตรวจจากไฟล์ที่โหลดมา แล้วปรับฟังก์ชัน `parseWordListCsv` ให้ตรงกับคอลัมน์จริง (เช่น ลำดับ, คำ, Lemma, ความถี่) ก่อนรันสคริปต์นำเข้า

สัญญาอนุญาต: ต้องอ้างอิงเงื่อนไขการใช้เชิงพาณิชย์ของ NGSL (Creative Commons) ตามหน้าเว็บของโครงการ — TSL อยู่ภายใต้ CC BY-SA 4.0
