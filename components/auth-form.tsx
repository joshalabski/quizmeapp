"use client"

import { FormEvent, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, Check, Sparkles } from "lucide-react"
import { loginLocal, signUpLocal } from "@/lib/local-auth"

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

  function submit(event: FormEvent) {
    event.preventDefault(); setError("")
    if (!email || !password || (mode === "signup" && !name)) { setError("Please complete all fields to continue."); return }
    setBusy(true)
    const result = mode === "signup" ? signUpLocal(name, email, password) : loginLocal(email, password)
    if (result.error) { setError(result.error); setBusy(false); return }
    router.push("/dashboard")
  }

  return <main className="grid min-h-screen bg-white lg:grid-cols-2"><section className="hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between"><Link href="/" className="flex items-center gap-2 text-xl font-extrabold"><span className="grid size-9 place-items-center rounded-xl bg-violet-600"><Sparkles className="size-4" /></span>QuizMe</Link><div><p className="max-w-lg text-5xl font-extrabold leading-tight tracking-tight">A little practice today. A lot more confidence tomorrow.</p><div className="mt-8 flex flex-col gap-3 text-sm text-slate-300"><span><Check className="mr-2 inline size-4 text-violet-400" />Personalized quizzes from your notes</span><span><Check className="mr-2 inline size-4 text-violet-400" />A clear path to exam day</span><span><Check className="mr-2 inline size-4 text-violet-400" />Private local study library</span></div></div><p className="text-sm text-slate-500">Demo mode: your account stays in this browser.</p></section><section className="flex items-center justify-center px-6 py-12"><div className="w-full max-w-md"><Link href="/" className="mb-12 flex items-center gap-2 text-xl font-extrabold lg:hidden"><span className="grid size-9 place-items-center rounded-xl bg-violet-600 text-white"><Sparkles className="size-4" /></span>QuizMe</Link><p className="text-sm font-bold text-violet-600">{mode === "login" ? "Welcome back" : "Start learning smarter"}</p><h1 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-950">{mode === "login" ? "Log in to QuizMe" : "Create your account"}</h1><p className="mt-3 text-sm text-slate-500">{mode === "login" ? "Pick up where you left off." : "Your personalized study space is waiting."}</p><form onSubmit={submit} className="mt-8 flex flex-col gap-5">{mode === "signup" && <label className="flex flex-col gap-2 text-sm font-bold text-slate-700">Your name<input value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl border border-slate-200 px-4 py-3.5 font-normal outline-none focus:border-violet-500" placeholder="Alex Morgan" /></label>}<label className="flex flex-col gap-2 text-sm font-bold text-slate-700">Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-xl border border-slate-200 px-4 py-3.5 font-normal outline-none focus:border-violet-500" placeholder="you@example.com" /></label><label className="flex flex-col gap-2 text-sm font-bold text-slate-700">Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-xl border border-slate-200 px-4 py-3.5 font-normal outline-none focus:border-violet-500" placeholder="At least 6 characters" /></label>{error && <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700" role="alert">{error}</p>}<button disabled={busy} className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3.5 font-bold text-white shadow-lg shadow-violet-200 hover:bg-violet-700 disabled:opacity-60">{busy ? "Opening your study space…" : mode === "login" ? "Log in" : "Create account"}<ArrowRight className="size-4" /></button></form><p className="mt-8 text-center text-sm text-slate-500">{mode === "login" ? "New to QuizMe?" : "Already have an account?"} <Link href={mode === "login" ? "/signup" : "/login"} className="font-bold text-violet-600">{mode === "login" ? "Create an account" : "Log in"}</Link></p></div></section></main>
}
