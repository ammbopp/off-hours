# คลังคำ (NGSL / TSL / BSL)

ดาวน์โหลดไว้แล้ว (ไฟล์ "lemmatized for teaching" จากแต่ละคลัง):

| ไฟล์ | คลัง | จำนวนคำตั้งต้น | ที่มา |
| --- | --- | --- | --- |
| `ngsl.csv` | New General Service List | 2,809 | https://www.newgeneralservicelist.com/new-general-service-list |
| `tsl.csv` | TOEIC Service List | 1,250 | https://www.newgeneralservicelist.com/toeic-service-list |
| `bsl.csv` | Business Service List | 1,744 | https://www.newgeneralservicelist.com/business-service-list |

### ไฟล์คำนิยามภาษาอังกฤษ

| ไฟล์ | คลัง | จำนวนคำนิยาม |
| --- | --- | --- |
| `ngsl-definitions.xlsx` | NGSL ("with English definitions") | 2,809 |
| `tsl-definitions.xlsx` | TSL ("definitions in easy English") | 1,245 |

โครงการ NGSL **ไม่ได้เผยแพร่ไฟล์คำนิยามของ BSL** คำที่อยู่ใน BSL อย่างเดียวจึงไม่มีคำนิยาม (แต่คำที่อยู่ทั้ง TSL และ BSL ได้คำนิยามจากฝั่ง TSL — 575 คำ) ส่วนคำเป้าหมายของแต่ละตอนมีคำแปลไทยตามบริบทเขียนไว้ใน `src/data/episodes/` อยู่แล้ว

ไฟล์ .xlsx อ่านด้วยตัวอ่านขนาดเล็กใน `scripts/lib/xlsx.ts` ซึ่งเรียกคำสั่ง `unzip` ของระบบ จึงไม่ต้องติดตั้งไลบรารีอ่าน Excel เพิ่ม

ถ้าต้องการอัปเดตเป็นเวอร์ชันใหม่กว่านี้ ดาวน์โหลดไฟล์ "lemmatized for teaching" (.csv) และไฟล์คำนิยาม (.xlsx) จากลิงก์ข้างต้นแล้วทับไฟล์เดิม จากนั้นรัน `npm run wordlists:import` ใหม่ และ **เพิ่มเลข `CORPUS_VERSION` ใน `src/lib/db/index.ts`** เพื่อให้แอปโหลดคลังคำใหม่เข้าเครื่อง

## รูปแบบไฟล์จริง

ไม่มีหัวตาราง บรรทัดขึ้นต้นด้วย `##` คือคอมเมนต์ (ข้าม) แต่ละบรรทัดข้อมูลคือ "คำตั้งต้น,รูปแปร1,รูปแปร2,..." เช่น:

```
do,does,don,doesn,did,didn,doing,done,doin
```

คอลัมน์แรกคือคำตั้งต้น (lemma) ใช้เป็น `Word.term` ในแอป ส่วนรูปแปรที่เหลือ (รวมรูปย่อของคำปฏิเสธ/กริยาช่วยอย่าง `don`, `doesn`) ใช้สร้างฐาน "คำที่รู้แล้ว" สำหรับ `validateEpisode` — ดู `src/lib/wordlists/import.ts` และ `scripts/validate-episode.ts`

## ไฟล์ที่สร้างจากสคริปต์ (`npm run wordlists:import`)

- `wordforms.generated.json` (อยู่โฟลเดอร์นี้) — รูปแปรทั้งหมดแยกตามคลัง ใช้โดย `scripts/validate-episode.ts` เท่านั้น ไม่ส่งให้ไคลเอนต์
- `../../public/words.generated.json` — `Word[]` รวมทั้งสามคลัง (5,803 คำ) ที่หน้าเว็บ `fetch()` มา seed เข้า IndexedDB ตอนเปิดแอปครั้งแรก

สัญญาอนุญาต: NGSL ใช้เชิงพาณิชย์ได้ภายใต้ Creative Commons ตามหน้าเว็บของโครงการ — TSL และ BSL อยู่ภายใต้ CC BY-SA 4.0
