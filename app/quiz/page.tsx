"use client"

import { useEffect, useState } from "react"
import { AppShell, SectionHeading } from "@/components/app-shell"
import { getDocText } from "@/lib/file-store"
import { getDocuments, getQuizzes, saveQuiz, saveQuizResult, type Quiz, type QuizQuestion, type StudyDocument } from "@/lib/study-storage"
import { AlertCircle, ArrowRight, CheckCircle2, Loader2, RotateCcw, Sparkles } from "lucide-react"

// Never trust model output: keep only well-formed questions
function cleanQuestions(raw: unknown, fallbackTopic: string): QuizQuestion[] {
  if (!Array.isArray(raw)) return []
  return raw.flatMap((item) => {
    const q = item as Record<string, unknown>
    const options = Array.isArray(q.options) ? q.options.map(String) : []
    const answer = Number(q.answer ?? q.correctIndex)
    if (typeof q.question !== "string" || options.length !== 4 || !Number.isInteger(answer) || answer < 0 || answer > 3) return []
    return [{
      question: q.question,
      options,
      answer,
      explanation: typeof q.explanation === "string" ? q.explanation : "",
      topic: typeof q.topic === "string" && q.topic ? q.topic : fallbackTopic,
    }]
  })
}

export default function QuizPage() {
  const [documents, setDocuments] = useState<StudyDocument[]>([])
  const [savedQuizzes, setSavedQuizzes] = useState<Quiz[]>([])
  const [documentId, setDocumentId] = useState("")
  const [course, setCourse] = useState("")
  const [notes, setNotes] = useState("")
  const [count, setCount] = useState(10)
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [finished, setFinished] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => { setDocuments(getDocuments()); setSavedQuizzes(getQuizzes()) }, [])

  function begin(q: Quiz) { setQuiz(q); setCurrent(0); setAnswers({}); setFinished(false) }

  async function generate() {
    setError("")
    setLoading(true)
    try {
      let source = notes.trim()
      if (documentId) {
        const text = await getDocText(documentId)
        if (!text) throw new Error("Couldn't find that document's text. Try uploading it again.")
        source = text
      }
      if (source.length < 100) throw new Error("Add more material first, at least a few sentences.")

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "quiz", course, notes: source, count }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Quiz generation failed. Please try again.")

      const name = course || documents.find((d) => d.id === documentId)?.name || "Practice quiz"
      const questions = cleanQuestions(data.questions, name)
      if (!questions.length) throw new Error("The model returned no usable questions. Please try again.")

      const newQuiz: Quiz = { id: crypto.randomUUID(), documentId: documentId || undefined, course: name, questions, createdAt: new Date().toISOString() }
      setSavedQuizzes(saveQuiz(newQuiz))
      begin(newQuiz)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  function pick(index: number) {
    if (answers[current] !== undefined) return // locked after the first choice
    setAnswers({ ...answers, [current]: index })
  }

  function finish() {
    if (!quiz) return
    const wrong = quiz.questions.filter((q, i) => answers[i] !== q.answer)
    try {
      saveQuizResult({
        id: crypto.randomUUID(), quizId: quiz.id, documentId: quiz.documentId, course: quiz.course,
        score: quiz.questions.length - wrong.length, total: quiz.questions.length,
        weakTopics: [...new Set(wrong.map((q) => q.topic))], createdAt: new Date().toISOString(),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save your result.")
    }
    setFinished(true)
  }

  function retryMissed() {
    if (!quiz) return
    const missed = quiz.questions.filter((q, i) => answers[i] !== q.answer)
    begin({ ...quiz, id: crypto.randomUUID(), questions: missed })
  }

  // ---------- Setup screen ----------
  if (!quiz) {
    return (
      <AppShell title="Quiz generator" description="Practice with questions made for you.">
        <SectionHeading eyebrow="Active recall" title="Turn notes into confidence." description="Pick a saved PDF or paste notes, and find your gaps fast." />
        <div className="grid gap-6 lg:grid-cols-[1fr_0.7fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <label className="flex flex-col gap-2 text-sm font-bold">Study material
              <select value={documentId} onChange={(e) => setDocumentId(e.target.value)} className="rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100">
                <option value="">Paste notes instead</option>
                {documents.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </label>
            <label className="mt-5 flex flex-col gap-2 text-sm font-bold">Course name
              <input value={course} onChange={(e) => setCourse(e.target.value)} placeholder="e.g. Organic Chemistry" className="rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100" />
            </label>
            {!documentId && (
              <label className="mt-5 flex flex-col gap-2 text-sm font-bold">Your notes
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Paste lecture notes or a study guide…" className="min-h-40 rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100" />
              </label>
            )}
            <label className="mt-5 flex flex-col gap-2 text-sm font-bold">Number of questions
              <select value={count} onChange={(e) => setCount(Number(e.target.value))} className="rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-violet-500">
                {[5, 10, 15].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
            {error && (
              <div className="mt-5 flex items-start gap-3 rounded-xl border border-rose-100 bg-rose-50 p-3 text-sm text-rose-700">
                <AlertCircle className="mt-0.5 size-4 shrink-0" /><span>{error}</span>
              </div>
            )}
            <button onClick={generate} disabled={loading || (!documentId && !notes.trim())}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50">
              {loading ? <><Loader2 className="size-4 animate-spin" />Generating…</> : <><Sparkles className="size-4" />{error ? "Try again" : "Generate quiz"}</>}
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-extrabold">Saved quizzes</h2>
            <div className="mt-4 flex flex-col gap-2">
              {savedQuizzes.map((q) => (
                <button key={q.id} onClick={() => begin(q)} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-left text-sm hover:bg-violet-50">
                  <span className="font-bold text-slate-700">{q.course}</span>
                  <span className="text-xs text-slate-400">{q.questions.length} questions</span>
                </button>
              ))}
              {!savedQuizzes.length && <p className="text-sm text-slate-400">Generated quizzes appear here so you can retake them.</p>}
            </div>
          </div>
        </div>
      </AppShell>
    )
  }

  // ---------- Results screen ----------
  if (finished) {
    const score = quiz.questions.filter((q, i) => answers[i] === q.answer).length
    const wrongTopics = [...new Set(quiz.questions.filter((q, i) => answers[i] !== q.answer).map((q) => q.topic))]
    return (
      <AppShell title="Results" description={quiz.course}>
        <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-violet-600">{quiz.course}</p>
          <p className="mt-4 text-5xl font-extrabold">{score}/{quiz.questions.length}</p>
          <p className="mt-2 text-sm text-slate-400">{Math.round((score / quiz.questions.length) * 100)}% · saved to Progress</p>
          {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
          {wrongTopics.length > 0 && (
            <div className="mt-8 text-left">
              <h2 className="font-extrabold">Topics to revise</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {wrongTopics.map((t) => <li key={t} className="rounded-lg bg-violet-50 px-3 py-1.5 text-sm font-bold text-violet-700">{t}</li>)}
              </ul>
            </div>
          )}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {wrongTopics.length > 0 && <button onClick={retryMissed} className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-extrabold text-white"><RotateCcw className="size-4" />Retry missed questions</button>}
            <button onClick={() => { setQuiz(null); setError("") }} className="rounded-xl bg-slate-100 px-5 py-3 text-sm font-extrabold text-slate-700">New quiz</button>
          </div>
        </div>
      </AppShell>
    )
  }

  // ---------- Quiz screen ----------
  const question = quiz.questions[current]
  const answered = answers[current] !== undefined
  const isLast = current === quiz.questions.length - 1

  return (
    <AppShell title="Quiz in progress" description={quiz.course}>
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-violet-600">{question.topic}</p>
            <p className="mt-2 text-sm text-slate-400">Question {current + 1} of {quiz.questions.length}</p>
          </div>
          <div className="h-2 w-32 rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-violet-600 transition-all" style={{ width: `${((current + 1) / quiz.questions.length) * 100}%` }} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-10">
          <h1 className="text-2xl font-extrabold leading-tight md:text-3xl">{question.question}</h1>
          <div className="mt-8 grid gap-3">
            {question.options.map((option, index) => {
              const isCorrect = index === question.answer
              const isChosen = answers[current] === index
              const style = !answered ? "border-slate-200 hover:border-violet-200 hover:bg-violet-50/40"
                : isCorrect ? "border-emerald-400 bg-emerald-50 text-emerald-800"
                : isChosen ? "border-rose-400 bg-rose-50 text-rose-800"
                : "border-slate-200 opacity-60"
              return (
                <button key={index} onClick={() => pick(index)} disabled={answered}
                  className={`flex items-center gap-4 rounded-xl border px-4 py-4 text-left text-sm font-semibold transition ${style}`}>
                  <span className="grid size-8 place-items-center rounded-lg bg-slate-100 text-xs font-extrabold text-slate-500">{String.fromCharCode(65 + index)}</span>
                  {option}
                </button>
              )
            })}
          </div>

          {answered && question.explanation && (
            <div className="mt-6 rounded-xl bg-violet-50 p-4 text-sm leading-6 text-violet-900">
              <div className="flex items-center gap-2 font-bold"><CheckCircle2 className="size-4" />Explanation</div>
              <p className="mt-2">{question.explanation}</p>
            </div>
          )}

          <div className="mt-8 flex justify-end">
            {isLast
              ? <button onClick={finish} disabled={!answered} className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-extrabold text-white disabled:opacity-40">Finish quiz</button>
              : <button onClick={() => setCurrent(current + 1)} disabled={!answered} className="flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-extrabold text-white disabled:opacity-40">Next<ArrowRight className="size-4" /></button>}
          </div>
        </div>
      </div>
    </AppShell>
  )
}