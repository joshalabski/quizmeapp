"use client"

import { useState } from "react"
import { AppShell, SectionHeading } from "@/components/app-shell"
import { saveQuizResult } from "@/lib/study-storage"
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Loader2, RotateCcw, Sparkles } from "lucide-react"

const demoQuestions = [
  { question: "Which concept best explains why increasing temperature speeds up a reaction?", options: ["Activation energy decreases", "More particles exceed activation energy", "The equilibrium constant changes", "Products become more stable"], answer: 1, explanation: "Higher temperature gives particles more kinetic energy, so more collisions have enough energy to pass the activation barrier." },
  { question: "What is the primary role of a catalyst?", options: ["Increase product yield", "Change the equilibrium position", "Lower activation energy", "Add energy to the system"], answer: 2, explanation: "A catalyst provides an alternate reaction pathway with lower activation energy." },
  { question: "Which shape describes a molecule with four bonding pairs?", options: ["Linear", "Trigonal planar", "Tetrahedral", "Bent"], answer: 2, explanation: "Four electron domains arrange themselves tetrahedrally to minimize repulsion." },
]

type Question = typeof demoQuestions[number]
export default function QuizPage() {
  const [course, setCourse] = useState("")
  const [notes, setNotes] = useState("")
  const [questions, setQuestions] = useState<Question[] | null>(null)
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  async function generate() {
    setError(""); setLoading(true); setSaved(false)
    try {
      const response = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "quiz", course, notes, count: 10 }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Quiz generation is unavailable right now.")
      setQuestions(data.questions?.length ? data.questions : demoQuestions); setCurrent(0); setAnswers({})
    } catch (err) {
      setError(err instanceof Error ? err.message : "We could not generate your quiz. Please try again.")
      if (notes || course) { setQuestions(demoQuestions); setCurrent(0); setAnswers({}) }
    } finally { setLoading(false) }
  }

  function finish() {
    if (!questions) return
    const correct = questions.filter((question, index) => answers[index] === question.answer).length
    saveQuizResult({ id: crypto.randomUUID(), course: course || "Practice quiz", score: correct, total: questions.length, weakTopics: correct < questions.length ? [course || "Core concepts"] : [], createdAt: new Date().toISOString() })
    setSaved(true)
  }

  if (!questions) return <AppShell title="Quiz generator" description="Practice with questions made for you."><SectionHeading eyebrow="Active recall" title="Turn notes into confidence." description="Generate a focused quiz from your study materials and find your gaps fast." /><div className="grid gap-6 lg:grid-cols-[1fr_0.7fr]"><div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"><div className="flex items-center gap-3"><div className="grid size-11 place-items-center rounded-xl bg-violet-50 text-violet-600"><Sparkles className="size-5" /></div><div><h2 className="font-extrabold">Create a practice quiz</h2><p className="text-sm text-slate-400">Start with a course and paste your notes.</p></div></div><label className="mt-8 flex flex-col gap-2 text-sm font-bold">Course name<input value={course} onChange={(e) => setCourse(e.target.value)} className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100" placeholder="e.g. Organic Chemistry" /></label><label className="mt-5 flex flex-col gap-2 text-sm font-bold">Your notes<textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="min-h-40 rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100" placeholder="Paste lecture notes, a study guide, or a topic..." /></label>{error && <div className="mt-5 flex items-start gap-3 rounded-xl border border-rose-100 bg-rose-50 p-3 text-sm text-rose-700"><AlertCircle className="mt-0.5 size-4 shrink-0" /><span>{error}</span></div>}<button onClick={generate} disabled={loading || (!course && !notes)} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50">{loading ? <><Loader2 className="size-4 animate-spin" />Generating...</> : <><Sparkles className="size-4" />Generate quiz</>}</button></div><div className="rounded-2xl bg-slate-950 p-7 text-white"><p className="text-xs font-extrabold uppercase tracking-[0.16em] text-violet-300">How it works</p><div className="mt-6 flex flex-col gap-6">{[["01", "Add your material", "Paste notes or describe the topic you want to practice."], ["02", "Practice actively", "Answer one focused question at a time, then see why."], ["03", "Learn from gaps", "Your score and weak topics are saved to Progress."]].map(([number, title, text]) => <div key={number} className="flex gap-4"><span className="text-sm font-extrabold text-violet-300">{number}</span><div><p className="font-bold">{title}</p><p className="mt-1 text-sm leading-6 text-slate-400">{text}</p></div></div>)}</div></div></div></AppShell>

  const question = questions[current]; const isLast = current === questions.length - 1; const score = questions.filter((item, index) => answers[index] === item.answer).length
  return <AppShell title="Quiz in progress" description={course || "Practice quiz"}><div className="mx-auto max-w-3xl"><div className="mb-8 flex items-center justify-between"><div><p className="text-xs font-extrabold uppercase tracking-[0.16em] text-violet-600">{course || "Practice quiz"}</p><p className="mt-2 text-sm text-slate-400">Question {current + 1} of {questions.length}</p></div><div className="h-2 w-32 rounded-full bg-slate-100"><div className="h-full rounded-full bg-violet-600 transition-all" style={{ width: `${((current + 1) / questions.length) * 100}%` }} /></div></div><div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-10"><h1 className="text-2xl font-extrabold leading-tight md:text-3xl">{question.question}</h1><div className="mt-8 grid gap-3">{question.options.map((option, index) => <button key={option} onClick={() => setAnswers({ ...answers, [current]: index })} className={`flex items-center gap-4 rounded-xl border px-4 py-4 text-left text-sm font-semibold transition ${answers[current] === index ? "border-violet-500 bg-violet-50 text-violet-800" : "border-slate-200 hover:border-violet-200 hover:bg-violet-50/40"}`}><span className={`grid size-8 place-items-center rounded-lg text-xs font-extrabold ${answers[current] === index ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-500"}`}>{String.fromCharCode(65 + index)}</span>{option}</button>)}</div>{answers[current] !== undefined && <div className="mt-6 rounded-xl bg-violet-50 p-4 text-sm leading-6 text-violet-900"><div className="flex items-center gap-2 font-bold"><CheckCircle2 className="size-4" />Explanation</div><p className="mt-2">{question.explanation}</p></div>}<div className="mt-8 flex justify-between"><button onClick={() => setCurrent(Math.max(0, current - 1))} disabled={current === 0} className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-slate-500 hover:bg-slate-100 disabled:opacity-30"><ArrowLeft className="size-4" />Previous</button>{isLast ? <button onClick={finish} disabled={answers[current] === undefined} className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-extrabold text-white disabled:opacity-40">Finish quiz · {score}/{questions.length}</button> : <button onClick={() => setCurrent(current + 1)} disabled={answers[current] === undefined} className="flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-extrabold text-white disabled:opacity-40">Next<ArrowRight className="size-4" /></button>}</div></div>{saved && <div className="mt-6 flex items-center justify-between rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-800"><span className="font-bold">Saved to your Progress. Nice work.</span><button onClick={() => setQuestions(null)} className="flex items-center gap-2 font-bold"><RotateCcw className="size-4" />New quiz</button></div>}</div></AppShell>
}
