import type { QuizResult } from "./study-storage"

export type DayCounts = Record<string, number>

// "2026-10-31" in the user's local time
export const dayKey = (d: Date) => d.toLocaleDateString("en-CA")

export function getDayCounts(results: QuizResult[]): DayCounts {
  const counts: DayCounts = {}
  for (const r of results) {
    const key = dayKey(new Date(r.createdAt))
    counts[key] = (counts[key] ?? 0) + 1
  }
  return counts
}

export function getStreaks(counts: DayCounts) {
  const dayNumber = (key: string) => Math.round(new Date(`${key}T12:00:00`).getTime() / 86400000)

  // Best streak: longest run of consecutive days
  let best = 0
  let run = 0
  let prev: number | null = null
  for (const key of Object.keys(counts).sort()) {
    const n = dayNumber(key)
    run = prev !== null && n - prev === 1 ? run + 1 : 1
    best = Math.max(best, run)
    prev = n
  }

  // Current streak: counting back from today (or yesterday if you haven't studied yet today)
  const cursor = new Date()
  cursor.setHours(12, 0, 0, 0)
  if (!counts[dayKey(cursor)]) cursor.setDate(cursor.getDate() - 1)
  let current = 0
  while (counts[dayKey(cursor)]) {
    current++
    cursor.setDate(cursor.getDate() - 1)
  }

  return { current, best }
}