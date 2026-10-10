// อักษรย่อสำหรับวงกลมอวาตาร์ เช่น "Daniel Reyes" → "DR"
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  return (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')
}
