"use client"

import { useEffect, useRef, useState } from "react"
import { FileText, Loader2, UploadCloud } from "lucide-react"

type StudyFile = { id: string; file_name: string; file_size: number; created_at: string }
const KEY = "quizme_local_pdfs"
const readFiles = (): StudyFile[] => { try { return JSON.parse(localStorage.getItem(KEY) || "[]") as StudyFile[] } catch { return [] } }

export function PdfUpload() {
  const inputRef = useRef<HTMLInputElement>(null); const [files, setFiles] = useState<StudyFile[]>([]); const [busy, setBusy] = useState(false); const [message, setMessage] = useState("")
  useEffect(() => setFiles(readFiles()), [])
  async function upload(file?: File) { if (!file) return; if (file.type !== "application/pdf") { setMessage("Please choose a PDF file."); return }; if (file.size > 5 * 1024 * 1024) { setMessage("Demo PDFs must be smaller than 5 MB."); return }; setBusy(true); setMessage(""); const id = crypto.randomUUID(); const next = [{ id, file_name: file.name, file_size: file.size, created_at: new Date().toISOString() }, ...readFiles()]; localStorage.setItem(KEY, JSON.stringify(next)); setFiles(next); setMessage("PDF saved locally in this browser."); setBusy(false) }
  return <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-extrabold uppercase tracking-[0.18em] text-violet-600">Study library</p><h2 className="mt-2 text-xl font-extrabold text-slate-950">Upload your notes</h2><p className="mt-1 text-sm text-slate-500">Demo storage only — PDFs stay on this device.</p></div><span className="grid size-11 place-items-center rounded-xl bg-violet-50 text-violet-600"><UploadCloud className="size-5" /></span></div><button type="button" onClick={() => inputRef.current?.click()} disabled={busy} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-violet-200 bg-violet-50/50 px-4 py-6 text-sm font-bold text-violet-700 hover:border-violet-400 disabled:opacity-60">{busy ? <Loader2 className="size-4 animate-spin" /> : <UploadCloud className="size-4" />} {busy ? "Saving…" : "Choose a PDF"}</button><input ref={inputRef} type="file" accept="application/pdf,.pdf" className="sr-only" onChange={(event) => { void upload(event.target.files?.[0]); event.currentTarget.value = "" }} />{message && <p className="mt-3 text-sm font-semibold text-slate-500" role="status">{message}</p>}<div className="mt-5 flex flex-col gap-2">{files.map((file) => <div key={file.id} className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-3"><FileText className="size-4 text-violet-600" /><span className="min-w-0 flex-1 truncate text-sm font-bold text-slate-700">{file.file_name}</span><span className="text-xs text-slate-400">{Math.ceil(file.file_size / 1024)} KB</span></div>)}{!files.length && <p className="text-xs text-slate-400">No PDFs uploaded yet.</p>}</div></section>
}
