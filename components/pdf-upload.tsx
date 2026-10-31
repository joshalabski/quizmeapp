"use client"

import { useEffect, useRef, useState } from "react"
import { FileText, Loader2, UploadCloud } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type StudyFile = { id: string; file_name: string; file_size: number; created_at: string }

export function PdfUpload() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<StudyFile[]>([])
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")
  const loadFiles = async () => { const supabase = createClient(); const { data } = await supabase.from("study_files").select("id,file_name,file_size,created_at").order("created_at", { ascending: false }); if (data) setFiles(data) }
  useEffect(() => { void loadFiles() }, [])
  async function upload(file?: File) {
    if (!file) return
    if (file.type !== "application/pdf") { setMessage("Please choose a PDF file."); return }
    if (file.size > 10 * 1024 * 1024) { setMessage("PDFs must be smaller than 10 MB."); return }
    setBusy(true); setMessage("")
    const supabase = createClient(); const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setMessage("Please log in before uploading a PDF."); setBusy(false); return }
    const path = `${user.id}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`
    const uploadResult = await supabase.storage.from("study-files").upload(path, file, { contentType: "application/pdf", upsert: false })
    if (uploadResult.error) { setMessage("We couldn’t upload that PDF. Please try again."); setBusy(false); return }
    const { error } = await supabase.from("study_files").insert({ user_id: user.id, file_name: file.name, storage_path: path, mime_type: file.type, file_size: file.size })
    if (error) { await supabase.storage.from("study-files").remove([path]); setMessage("We couldn’t save that PDF. Please try again."); setBusy(false); return }
    await loadFiles(); setMessage("PDF uploaded securely."); setBusy(false)
  }
  return <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-extrabold uppercase tracking-[0.18em] text-violet-600">Study library</p><h2 className="mt-2 text-xl font-extrabold text-slate-950">Upload your notes</h2><p className="mt-1 text-sm text-slate-500">Keep PDFs private to your account and ready for future study sessions.</p></div><span className="grid size-11 place-items-center rounded-xl bg-violet-50 text-violet-600"><UploadCloud className="size-5" /></span></div><button type="button" onClick={() => inputRef.current?.click()} disabled={busy} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-violet-200 bg-violet-50/50 px-4 py-6 text-sm font-bold text-violet-700 hover:border-violet-400 disabled:opacity-60">{busy ? <Loader2 className="size-4 animate-spin" /> : <UploadCloud className="size-4" />} {busy ? "Uploading…" : "Choose a PDF"}</button><input ref={inputRef} type="file" accept="application/pdf,.pdf" className="sr-only" onChange={(event) => { void upload(event.target.files?.[0]); event.currentTarget.value = "" }} />{message && <p className="mt-3 text-sm font-semibold text-slate-500" role="status">{message}</p>}<div className="mt-5 flex flex-col gap-2">{files.map((file) => <div key={file.id} className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-3"><FileText className="size-4 text-violet-600" /><span className="min-w-0 flex-1 truncate text-sm font-bold text-slate-700">{file.file_name}</span><span className="text-xs text-slate-400">{Math.ceil(file.file_size / 1024)} KB</span></div>)}{!files.length && <p className="text-xs text-slate-400">No PDFs uploaded yet.</p>}</div></section>
}
