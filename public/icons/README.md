# ไอคอนสำหรับ Add to Home Screen

`public/icon.svg` เป็นแค่ไอคอนตัวแทนไว้ก่อน iOS ไม่ยอมรับ SVG เป็น apple-touch-icon จึงต้องสร้างไฟล์ PNG จริงวางไว้ในโฟลเดอร์นี้ก่อนใช้งานจริงบนเครื่อง:

- `apple-touch-icon.png` — 180×180
- `icon-192.png` — 192×192 (สำหรับ manifest)
- `icon-512.png` — 512×512 (สำหรับ manifest)

แล้วอัปเดตลิงก์ใน `index.html` และ `public/manifest.webmanifest` ให้ชี้มาที่ไฟล์เหล่านี้แทน `icon.svg`
