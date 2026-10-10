export interface ValidationIssue {
  message: string
}

export interface ValidationResult {
  valid: boolean
  issues: ValidationIssue[]
}

const MAX_OUT_OF_LIST_RATIO = 0.05 // ~95–98% ของคำควรอยู่ในคลังที่ผู้ใช้รู้แล้ว (ดู README)

// ตรวจตอนที่โมเดลเขียนมา ก่อนบันทึกเป็นตอนจริง: คำเป้าหมายต้องครบ และคำนอกคลังต้องไม่เกินเกณฑ์
export function validateEpisode(params: {
  content: string
  targetTerms: string[]
  knownVocabulary: Set<string>
}): ValidationResult {
  const issues: ValidationIssue[] = []
  // แยกที่เครื่องหมายอะพอสโทรฟีด้วย เพราะคลังคำ NGSL/TSL/BSL เก็บรูปย่อของคำปฏิเสธ/กริยาช่วยแบบแยกคำ
  // (เช่น don't → "don" + "t", I'm → "i" + "m") ถ้าเก็บอะพอสโทรฟีไว้ในคำ คำเหล่านี้จะไม่ตรงกับคลังเลย
  const words: string[] = params.content.toLowerCase().match(/[a-zà-öø-ÿ]+/g) ?? []

  for (const term of params.targetTerms) {
    if (!words.includes(term.toLowerCase())) {
      issues.push({ message: `คำเป้าหมาย "${term}" ไม่พบในเนื้อตอน` })
    }
  }

  if (words.length > 0) {
    const outOfList = words.filter((w) => !params.knownVocabulary.has(w)).length
    const ratio = outOfList / words.length
    if (ratio > MAX_OUT_OF_LIST_RATIO) {
      issues.push({
        message: `สัดส่วนคำนอกคลังสูงเกินไป (${(ratio * 100).toFixed(1)}%) ควรให้โมเดลเขียนใหม่`,
      })
    }
  }

  return { valid: issues.length === 0, issues }
}
