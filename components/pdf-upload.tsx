"use client";

import type * as React from "react";
import { useEffect, useRef, useState } from "react";
import { FileText, Loader2, Trash2, UploadCloud } from "lucide-react";
import { extractPdfText } from "@/lib/pdf-text";
import { saveDocFile, saveDocText } from "@/lib/file-store";
import {
  getDocuments,
  removeDocument,
  saveDocument,
  type StudyDocument,
} from "@/lib/study-storage";

declare global {
  namespace JSX {
    interface IntrinsicElements extends React.JSX.IntrinsicElements {}
  }
}

const MAX_MB = 20;

export function PdfUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [docs, setDocs] = useState<StudyDocument[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => setDocs(getDocuments()), []);

  async function upload(file?: File) {
    if (!file) return;
    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) return setMessage("Please choose a PDF file.");
    if (file.size > MAX_MB * 1024 * 1024)
      return setMessage(`PDFs must be smaller than ${MAX_MB} MB.`);

    setBusy(true);
    setMessage("");
    try {
      const { text, pages } = await extractPdfText(file);
      if (text.length < 100) {
        throw new Error(
          "No readable text found. This looks like a scanned PDF, which isn't supported yet.",
        );
      }
      const id = crypto.randomUUID();
      await saveDocText(id, text);
      await saveDocFile(id, file);
      setDocs(
        saveDocument({
          id,
          name: file.name,
          size: file.size,
          pages,
          chars: text.length,
          createdAt: new Date().toISOString(),
        }),
      );
      setMessage("Saved on this device. You won't need to upload it again.");
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : "Could not read that PDF.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    await removeDocument(id);
    setDocs(getDocuments());
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-violet-600">
            Study library
          </p>
          <h2 className="mt-2 text-xl font-extrabold text-slate-950">
            Upload your notes
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Saved in this browser. Upload once, use everywhere.
          </p>
        </div>
        <span className="grid size-11 place-items-center rounded-xl bg-violet-50 text-violet-600">
          <UploadCloud className="size-5" />
        </span>
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-violet-200 bg-violet-50/50 px-4 py-6 text-sm font-bold text-violet-700 hover:border-violet-400 disabled:opacity-60"
      >
        {busy ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <UploadCloud className="size-4" />
        )}
        {busy ? "Reading PDF…" : "Choose a PDF"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="sr-only"
        onChange={(e) => {
          void upload(e.target.files?.[0]);
          e.currentTarget.value = "";
        }}
      />

      {message && (
        <p className="mt-3 text-sm font-semibold text-slate-500" role="status">
          {message}
        </p>
      )}

      <div className="mt-5 flex flex-col gap-2">
        {docs.map((d) => (
          <div
            key={d.id}
            className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-3"
          >
            <FileText className="size-4 text-violet-600" />
            <span className="min-w-0 flex-1 truncate text-sm font-bold text-slate-700">
              {d.name}
            </span>
            <span className="text-xs text-slate-400">{d.pages} pages</span>
            <button
              onClick={() => void remove(d.id)}
              aria-label={`Delete ${d.name}`}
              className="text-slate-300 hover:text-rose-500"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
        {!docs.length && (
          <p className="text-xs text-slate-400">No PDFs uploaded yet.</p>
        )}
      </div>
    </section>
  );
}
