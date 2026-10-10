// ตัวอ่าน .xlsx แบบเล็กที่สุดเท่าที่พอใช้กับไฟล์คำนิยามของ NGSL Project
// (ชีตเดียว ไม่มีสูตร เซลล์เป็นข้อความล้วน) จึงไม่ต้องพึ่งไลบรารีภายนอก
// ใช้คำสั่ง unzip ของระบบในการแตกไฟล์ — มีอยู่แล้วทั้งบน macOS และ Linux
import { execFileSync } from 'node:child_process'

const MAX_BUFFER = 64 * 1024 * 1024

function unzipEntry(xlsxPath: string, entry: string): string {
  return execFileSync('unzip', ['-p', xlsxPath, entry], {
    encoding: 'utf-8',
    maxBuffer: MAX_BUFFER,
  })
}

function decodeXmlEntities(text: string): string {
  return text
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code: string) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
}

// แต่ละ <si> คือหนึ่งข้อความ แต่ข้างในอาจถูกแบ่งเป็นหลาย <t> ถ้าเซลล์มีการจัดรูปแบบ (rich text)
// จึงต้องรวม <t> ทั้งหมดภายใน <si> เดียวกันเข้าด้วยกัน ไม่ใช่ดึง <t> ทั้งไฟล์มาเรียงกัน
function parseSharedStrings(xml: string): string[] {
  const items = xml.split('</si>')
  const strings: string[] = []

  for (const item of items) {
    if (!item.includes('<si')) continue
    const parts = [...item.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((m) => m[1])
    strings.push(decodeXmlEntities(parts.join('')))
  }

  return strings
}

function columnIndex(cellRef: string): number {
  const letters = cellRef.match(/^[A-Z]+/)?.[0] ?? 'A'
  let index = 0
  for (const letter of letters) {
    index = index * 26 + (letter.charCodeAt(0) - 64)
  }
  return index - 1
}

function parseSheet(xml: string, shared: string[]): string[][] {
  const rows: string[][] = []

  for (const rowMatch of xml.matchAll(/<row[^>]*>([\s\S]*?)<\/row>/g)) {
    const cells: string[] = []

    for (const cellMatch of rowMatch[1].matchAll(/<c\s([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const attributes = cellMatch[1]
      const body = cellMatch[2] ?? ''
      const ref = attributes.match(/r="([A-Z]+\d+)"/)?.[1] ?? 'A1'
      const type = attributes.match(/t="([^"]+)"/)?.[1]
      const rawValue = body.match(/<v>([\s\S]*?)<\/v>/)?.[1]

      let value = ''
      if (type === 's' && rawValue !== undefined) {
        value = shared[Number(rawValue)] ?? ''
      } else if (type === 'inlineStr') {
        const parts = [...body.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((m) => m[1])
        value = decodeXmlEntities(parts.join(''))
      } else if (rawValue !== undefined) {
        value = decodeXmlEntities(rawValue)
      }

      cells[columnIndex(ref)] = value
    }

    rows.push(cells)
  }

  return rows
}

// คืนค่าทุกแถวของชีตแรกเป็น string[][] (แถวแรกคือหัวตาราง)
export function readXlsxRows(xlsxPath: string): string[][] {
  const shared = parseSharedStrings(unzipEntry(xlsxPath, 'xl/sharedStrings.xml'))
  return parseSheet(unzipEntry(xlsxPath, 'xl/worksheets/sheet1.xml'), shared)
}
