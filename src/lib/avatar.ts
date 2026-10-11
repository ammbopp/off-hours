import type { CharacterRelation } from '../types'

// อักษรย่อสำหรับวงกลมอวาตาร์ เช่น "Daniel Reyes" → "DR"
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  return (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')
}

// คลาสสีไล่เฉดต่อตัวละคร ให้แต่ละคนมีโทนจำง่ายของตัวเอง (ดู .avatar-* ใน index.css)
export function avatarClass(relation: CharacterRelation): string {
  return `avatar avatar-${relation}`
}
