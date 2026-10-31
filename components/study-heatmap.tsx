"use client"

import { useEffect, useMemo, useState } from "react"
import { dayKey, type DayCounts } from "@/lib/streak"

const WEEKS = 20
// Full class names written out so Tailwind can see them
const LEVELS = ["bg-slate-100", "bg-violet-200", "bg-violet-400", "bg-violet-600"]
const levelFor = (n: number) => (n === 0 ? 0 : n === 1 ? 1 : n <= 3 ? 2 : 3)

export function StudyHeatmap({ counts }: { counts: DayCounts }) {
  // Render after mount so server and browser dates can't disagree
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const { days, months } = useMemo(() => {
    const today = new Date()
    today.setHours(12, 0, 0, 0)
    // Start on the Sunday (WEEKS - 1) weeks back so columns line up like GitHub
    const start = new Date(today)
    start.setDate(start.getDate() - today.getDay() - (WEEKS - 1) * 7)

    const list: { key: string; date: Date }[] = []
    for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
      list.push({ key: dayKey(d), date: new Date(d) })
    }

    // One month label per column, shown only when the month changes
    const labels: string[] = []
    let lastMonth = -1
    for (let w = 0; w < WEEKS; w++) {
      const first = list[w * 7]?.date
      const month = first ? first.getMonth() : lastMonth
      labels.push(month !== lastMonth && first ? first.toLocaleDateString(undefined, { month: "short" }) : "")
      lastMonth = month
    }
    return { days: list, months: labels }
  }, [])

  const total = Object.values(counts).reduce((a, b) => a + b, 0)
  const todayKey = dayKey(new Date())

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-extrabold text-slate-950">Study activity</h2>
          <p className="mt-1 text-sm text-slate-400">Every quiz you finish lights up a day.</p>
        </div>
        {mounted && <p className="text-xs font-semibold text-slate-400">{total} quizzes · last {WEEKS} weeks</p>}
      </div>

      {mounted ? (
        <div className="mt-5 overflow-x-auto pb-1">
          <div className="inline-flex gap-2">
            {/* Day labels */}
            <div className="flex flex-col gap-1">
              <div className="h-3" />
              <div className="grid gap-1 text-[10px] leading-3 text-slate-400" style={{ gridTemplateRows: "repeat(7, 12px)" }}>
                {["", "Mon", "", "Wed", "", "Fri", ""].map((label, i) => <span key={i}>{label}</span>)}
              </div>
            </div>

            {/* Months + cells */}
            <div className="flex flex-col gap-1">
              <div className="grid h-3 gap-1 text-[10px] leading-3 text-slate-400" style={{ gridTemplateColumns: `repeat(${WEEKS}, 12px)` }}>
                {months.map((m, i) => <span key={i} className="whitespace-nowrap">{m}</span>)}
              </div>
              <div className="grid gap-1" style={{ gridTemplateRows: "repeat(7, 12px)", gridAutoFlow: "column", gridAutoColumns: "12px" }}>
                {days.map(({ key, date }) => {
                  const n = counts[key] ?? 0
                  return (
                    <div
                      key={key}
                      title={`${n} ${n === 1 ? "quiz" : "quizzes"} on ${date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`}
                      className={`size-3 rounded-sm ${LEVELS[levelFor(n)]} ${key === todayKey ? "ring-1 ring-violet-500" : ""}`}
                    />
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-5 h-[116px] animate-pulse rounded-xl bg-slate-50" />
      )}

      <div className="mt-4 flex items-center justify-end gap-1.5 text-[10px] font-semibold text-slate-400">
        Less {LEVELS.map((c) => <span key={c} className={`size-3 rounded-sm ${c}`} />)} More
      </div>
    </section>
  )
}