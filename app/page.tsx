'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronLeft,
  Clock3,
  Flame,
  GraduationCap,
  Layers3,
  Lightbulb,
  Play,
  RotateCcw,
  Sparkles,
  Target,
  Trophy,
  X,
  Zap,
} from 'lucide-react'

import { Button } from '@/components/ui/button'

type Question = {
  question: string
  options: string[]
  correctIndex: number
  explanation: string
  topic: string
}

type Score = { score: number; total: number; date: string; topic: string }

const starterQuiz: Question[] = [
  {
    question: 'What is the primary function of mitochondria in a cell?',
    options: ['Store genetic information', 'Produce cellular energy', 'Transport proteins', 'Break down waste'],
    correctIndex: 1,
    explanation: 'Mitochondria convert energy from food into ATP, the usable energy currency of the cell.',
    topic: 'Cell biology',
  },
  {
    question: 'Which process allows plants to convert light energy into chemical energy?',
    options: ['Cellular respiration', 'Fermentation', 'Photosynthesis', 'Osmosis'],
    correctIndex: 2,
    explanation: 'Photosynthesis uses light energy to turn carbon dioxide and water into glucose and oxygen.',
    topic: 'Plant science',
  },
  {
    question: 'What does the term “homeostasis” describe?',
    options: ['Cell division', 'Stable internal conditions', 'Inherited traits', 'Energy release'],
    correctIndex: 1,
    explanation: 'Homeostasis is an organism’s ability to maintain a relatively stable internal environment.',
    topic: 'Core concepts',
  },
]

const optionLetters = ['A', 'B', 'C', 'D']

export default function Page() {
  const [screen, setScreen] = useState<'home' | 'quiz' | 'results'>('home')
  const [notes, setNotes] = useState('')
  const [count, setCount] = useState('3')
  const [difficulty, setDifficulty] = useState('Medium')
  const [quiz, setQuiz] = useState<Question[]>(starterQuiz)
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [answers, setAnswers] = useState<number[]>([])
  const [history, setHistory] = useState<Score[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    try {
      setHistory(JSON.parse(localStorage.getItem('quizme-history') || '[]'))
    } catch {
      setHistory([])
    }
  }, [])

  const active = quiz[current]
  const correctAnswers = useMemo(() => answers.filter((answer, index) => answer === quiz[index]?.correctIndex).length, [answers, quiz])

  function startQuiz() {
    setIsGenerating(true)
    window.setTimeout(() => {
      const requested = Number(count)
      setQuiz(requested === 5 ? [...starterQuiz, ...starterQuiz.slice(0, 2)] : starterQuiz)
      setCurrent(0)
      setSelected(null)
      setAnswers([])
      setIsGenerating(false)
      setScreen('quiz')
    }, 650)
  }

  function chooseAnswer(index: number) {
    if (selected !== null) return
    setSelected(index)
    setAnswers((previous) => [...previous, index])
  }

  function nextQuestion() {
    if (current === quiz.length - 1) {
      const score = { score: correctAnswers + (selected === active.correctIndex ? 1 : 0), total: quiz.length, date: 'Just now', topic: 'Biology basics' }
      const nextHistory = [score, ...history].slice(0, 5)
      setHistory(nextHistory)
      localStorage.setItem('quizme-history', JSON.stringify(nextHistory))
      setScreen('results')
      return
    }
    setCurrent((value) => value + 1)
    setSelected(null)
  }

  function resetHome() {
    setScreen('home')
    setNotes('')
    setSelected(null)
    setAnswers([])
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#080b16] text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(99,102,241,0.18),transparent_38%),radial-gradient(circle_at_100%_80%,rgba(14,165,233,0.08),transparent_28%)]" />
      <header className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
        <button onClick={resetHome} className="group flex items-center gap-3" aria-label="Go to QuizMe home">
          <span className="flex size-9 items-center justify-center rounded-xl bg-indigo-500 shadow-lg shadow-indigo-500/25 transition-transform group-hover:rotate-6"><GraduationCap className="size-5" /></span>
          <span className="text-lg font-semibold tracking-tight">Quiz<span className="text-indigo-400">Me</span></span>
        </button>
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500"><Sparkles className="size-3.5 text-indigo-400" /> Learn smarter, not longer</div>
      </header>

      <div className="relative mx-auto w-full max-w-6xl px-5 pb-16 sm:px-8">
        {screen === 'home' && <HomeScreen notes={notes} setNotes={setNotes} count={count} setCount={setCount} difficulty={difficulty} setDifficulty={setDifficulty} history={history} isGenerating={isGenerating} startQuiz={startQuiz} />}
        {screen === 'quiz' && <QuizScreen active={active} current={current} total={quiz.length} selected={selected} chooseAnswer={chooseAnswer} nextQuestion={nextQuestion} />}
        {screen === 'results' && <ResultsScreen score={correctAnswers} total={quiz.length} quiz={quiz} answers={answers} retry={() => { setCurrent(0); setSelected(null); setAnswers([]); setScreen('quiz') }} reset={resetHome} />}
      </div>
    </main>
  )
}

function HomeScreen({ notes, setNotes, count, setCount, difficulty, setDifficulty, history, isGenerating, startQuiz }: any) {
  return <section className="mx-auto max-w-5xl pt-10 sm:pt-16">
    <div className="mx-auto max-w-2xl text-center"><div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-3 py-1.5 text-xs font-medium text-indigo-300"><Zap className="size-3.5" /> Turn notes into confidence</div><h1 className="text-4xl font-semibold tracking-[-0.04em] text-white sm:text-6xl">Study less.<br /><span className="bg-gradient-to-r from-indigo-300 via-violet-300 to-sky-300 bg-clip-text text-transparent">Remember more.</span></h1><p className="mx-auto mt-5 max-w-lg text-base leading-7 text-slate-400">Paste your notes, choose your challenge, and let QuizMe build a focused practice session for you.</p></div>
    <div className="mt-12 grid gap-5 lg:grid-cols-[1.4fr_0.8fr]">
      <div className="rounded-3xl border border-white/[0.08] bg-white/[0.045] p-5 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-7"><div className="mb-4 flex items-center justify-between"><label htmlFor="notes" className="flex items-center gap-2 text-sm font-semibold text-white"><BookOpen className="size-4 text-indigo-300" /> Your study notes</label><span className="text-xs text-slate-500">{notes.length} characters</span></div><textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Paste a chapter, lecture notes, or anything you want to master..." className="min-h-56 w-full resize-none rounded-2xl border border-white/[0.08] bg-[#0c1120] p-4 text-sm leading-6 text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-indigo-400/60 focus:ring-4 focus:ring-indigo-500/10" /><div className="mt-5 grid gap-3 sm:grid-cols-2"><Field label="Questions" value={count} onChange={setCount} options={['3', '5', '10']} /><Field label="Difficulty" value={difficulty} onChange={setDifficulty} options={['Easy', 'Medium', 'Exam-level']} /></div><Button onClick={startQuiz} disabled={!notes.trim() || isGenerating} className="mt-5 h-12 w-full rounded-xl bg-indigo-500 text-sm font-semibold text-white shadow-xl shadow-indigo-500/20 hover:bg-indigo-400">{isGenerating ? <><RotateCcw className="size-4 animate-spin" /> Building your quiz...</> : <>Generate quiz <ArrowRight className="size-4" /></>}</Button></div>
      <ScoreHistory history={history} />
    </div>
    <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-500"><span className="flex items-center gap-1.5"><Target className="size-3.5 text-emerald-400" /> Active recall</span><span className="flex items-center gap-1.5"><Clock3 className="size-3.5 text-sky-400" /> 5-minute sessions</span><span className="flex items-center gap-1.5"><Lightbulb className="size-3.5 text-amber-400" /> Clear explanations</span></div>
  </section>
}

function Field({ label, value, onChange, options }: any) { return <label className="block"><span className="mb-2 block text-xs font-medium text-slate-500">{label}</span><select value={value} onChange={(e) => onChange(e.target.value)} className="h-11 w-full rounded-xl border border-white/[0.08] bg-[#0c1120] px-3 text-sm text-slate-200 outline-none focus:border-indigo-400/60">{options.map((option: string) => <option key={option}>{option}</option>)}</select></label> }

function ScoreHistory({ history }: { history: Score[] }) { return <div className="rounded-3xl border border-white/[0.08] bg-white/[0.025] p-5 sm:p-7"><div className="mb-5 flex items-center justify-between"><div><p className="text-sm font-semibold text-white">Recent scores</p><p className="mt-1 text-xs text-slate-500">Your last five sessions</p></div><Trophy className="size-5 text-amber-300" /></div>{history.length ? <div className="space-y-3">{history.map((item, index) => <div key={`${item.date}-${index}`} className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.03] px-3.5 py-3"><div className="flex items-center gap-3"><span className="flex size-8 items-center justify-center rounded-lg bg-indigo-500/10 text-xs font-semibold text-indigo-300">{item.score}/{item.total}</span><div><p className="text-xs font-medium text-slate-200">{item.topic}</p><p className="mt-0.5 text-[11px] text-slate-500">{item.date}</p></div></div><span className="text-xs font-semibold text-emerald-300">{Math.round(item.score / item.total * 100)}%</span></div>)}</div> : <div className="flex min-h-48 flex-col items-center justify-center text-center"><div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-white/[0.04]"><Layers3 className="size-5 text-slate-600" /></div><p className="text-sm text-slate-400">No scores yet</p><p className="mt-1 max-w-[180px] text-xs leading-5 text-slate-600">Your results will appear here after your first quiz.</p></div>}</div> }

function QuizScreen({ active, current, total, selected, chooseAnswer, nextQuestion }: any) { const percentage = ((current + 1) / total) * 100; return <section className="mx-auto max-w-2xl pt-8 sm:pt-16"><div className="mb-8 flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-300">Practice session</p><p className="mt-2 text-sm text-slate-400">Question <span className="font-semibold text-white">{current + 1}</span> of {total}</p></div><div className="flex size-12 items-center justify-center rounded-full border border-indigo-400/20 bg-indigo-400/10 text-sm font-semibold text-indigo-200">{Math.round(percentage)}%</div></div><div className="mb-10 h-1.5 overflow-hidden rounded-full bg-white/[0.08]"><div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-400 transition-all duration-500" style={{ width: `${percentage}%` }} /></div><div className="rounded-3xl border border-white/[0.08] bg-white/[0.045] p-5 shadow-2xl shadow-black/20 sm:p-8"><div className="mb-8 flex items-center gap-2 text-xs font-medium text-slate-500"><span className="rounded-full bg-indigo-400/10 px-2.5 py-1 text-indigo-300">{active.topic}</span><span>•</span><span>Choose one answer</span></div><h2 className="text-2xl font-semibold leading-tight tracking-[-0.025em] text-white sm:text-3xl">{active.question}</h2><div className="mt-8 space-y-3">{active.options.map((option: string, index: number) => { const isCorrect = selected !== null && index === active.correctIndex; const isWrong = selected === index && index !== active.correctIndex; return <button key={option} onClick={() => chooseAnswer(index)} disabled={selected !== null} className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left text-sm transition-all ${isCorrect ? 'border-emerald-400/50 bg-emerald-400/10 text-emerald-100' : isWrong ? 'border-rose-400/50 bg-rose-400/10 text-rose-100' : selected !== null ? 'border-white/[0.06] bg-white/[0.02] text-slate-500' : 'border-white/[0.08] bg-white/[0.025] text-slate-300 hover:-translate-y-0.5 hover:border-indigo-400/50 hover:bg-indigo-400/[0.08]'}`}><span className={`flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold ${isCorrect ? 'bg-emerald-400/20 text-emerald-300' : isWrong ? 'bg-rose-400/20 text-rose-300' : 'bg-white/[0.07] text-slate-400'}`}>{isCorrect ? <Check className="size-4" /> : isWrong ? <X className="size-4" /> : optionLetters[index]}</span><span>{option}</span></button> })}</div>{selected !== null && <div className="mt-6 rounded-2xl border border-indigo-400/20 bg-indigo-400/[0.07] p-4"><div className="flex gap-3"><Lightbulb className="mt-0.5 size-4 shrink-0 text-amber-300" /><div><p className="text-xs font-semibold text-indigo-200">Why this is the answer</p><p className="mt-1.5 text-sm leading-6 text-slate-300">{active.explanation}</p></div></div></div>}<Button onClick={nextQuestion} disabled={selected === null} className="mt-6 h-11 w-full rounded-xl bg-white text-sm font-semibold text-[#101426] hover:bg-slate-200">{current === total - 1 ? 'See results' : 'Next question'} <ArrowRight className="size-4" /></Button></div></section> }

function ResultsScreen({ score, total, quiz, answers, retry, reset }: any) { const percentage = Math.round(score / total * 100); const missed = quiz.filter((question: Question, index: number) => answers[index] !== question.correctIndex); return <section className="mx-auto max-w-3xl pt-8 sm:pt-16"><div className="text-center"><div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-300"><Trophy className="size-8" /></div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-300">Session complete</p><h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">Nice work.</h1><p className="mt-3 text-slate-400">You scored {score} out of {total} questions.</p></div><div className="mt-10 grid gap-5 sm:grid-cols-[0.8fr_1.2fr]"><div className="flex flex-col items-center justify-center rounded-3xl border border-white/[0.08] bg-white/[0.045] p-8"><div className="relative flex size-36 items-center justify-center rounded-full" style={{ background: `conic-gradient(#818cf8 ${percentage}%, rgba(255,255,255,.08) 0)` }}><div className="flex size-28 flex-col items-center justify-center rounded-full bg-[#111626]"><span className="text-3xl font-semibold text-white">{percentage}%</span><span className="text-xs text-slate-500">accuracy</span></div></div><p className="mt-5 text-sm font-medium text-slate-300">Keep the momentum going</p></div><div className="rounded-3xl border border-white/[0.08] bg-white/[0.025] p-6"><div className="mb-5 flex items-center gap-2"><Target className="size-4 text-rose-300" /><h2 className="text-sm font-semibold text-white">Topics to revisit</h2></div>{missed.length ? <div className="space-y-3">{missed.map((item: Question) => <div key={item.question} className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-3.5"><p className="text-xs font-semibold text-slate-200">{item.topic}</p><p className="mt-1 text-xs leading-5 text-slate-500">Review the key idea behind this question.</p></div>)}</div> : <div className="rounded-2xl bg-emerald-400/10 p-4 text-sm text-emerald-200">Perfect score. You have this material down.</div>}</div></div><div className="mt-6 flex flex-col gap-3 sm:flex-row"><Button onClick={retry} className="h-12 flex-1 rounded-xl bg-indigo-500 font-semibold text-white hover:bg-indigo-400"><RotateCcw className="size-4" /> Retry same quiz</Button><Button onClick={reset} variant="outline" className="h-12 flex-1 rounded-xl border-white/[0.1] bg-white/[0.03] text-slate-200 hover:bg-white/[0.08]">New notes <ArrowRight className="size-4" /></Button></div><button onClick={reset} className="mx-auto mt-7 flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300"><ChevronLeft className="size-3" /> Back to home</button></section> }
