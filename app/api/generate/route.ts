import { NextResponse } from "next/server"

// Give Vercel room for retries (the default limit can be as low as 10s)
export const maxDuration = 30

const MAX_CHARS = 12000
const RETRIES_PER_MODEL = 2

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

type Part = { text?: string; thought?: boolean }

async function getProviderError(res: Response) {
  const body: unknown = await res.json().catch(() => null)
  if (
    body &&
    typeof body === "object" &&
    "error" in body &&
    body.error &&
    typeof body.error === "object" &&
    "message" in body.error &&
    typeof body.error.message === "string"
  ) {
    return body.error.message
  }
  return res.statusText || "No additional details were provided."
}

function extractJson(raw: string) {
  const cleaned = raw.replace(/```json|```/g, "").trim()
  const start = Math.min(...["[", "{"].map((c) => (cleaned.indexOf(c) === -1 ? Infinity : cleaned.indexOf(c))))
  const end = Math.max(cleaned.lastIndexOf("]"), cleaned.lastIndexOf("}"))
  if (!Number.isFinite(start) || end <= start) throw new Error("No JSON found")
  return JSON.parse(cleaned.slice(start, end + 1))
}

function buildPrompt(type: string, course: string, notes: string, count: number) {
  if (type === "flashcards") {
    return `Create ${count} flashcards from the study material below. Reply with ONLY a JSON array, no markdown. Each item: {"term": string, "definition": string}. Use only the material.\n\nCourse: ${course}\n\nMaterial:\n${notes}`
  }
  return `Create ${count} multiple-choice questions from the study material below. Reply with ONLY a JSON array, no markdown. Each item: {"question": string, "options": [exactly 4 strings], "answer": number 0-3 (index of the correct option), "explanation": one or two sentences, "topic": short topic name}. Use only the material.\n\nCourse: ${course}\n\nMaterial:\n${notes}`
}

function callModel(model: string, prompt: string, apiKey: string) {
  const isGemma = model.startsWith("gemma")
  return fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      // Gemma 4 "thinks" by default; "minimal" turns that off for faster, cleaner JSON.
      // If you ever get a 400 error mentioning thinking, delete this line.
      ...(isGemma ? { generationConfig: { thinkingConfig: { thinkingLevel: "minimal" } } } : {}),
    }),
  })
}

// Tries each model in order. Busy (503) and rate-limited (429) responses are retried,
// then the next model is tried. Any other error stops immediately.
async function generateWithFallback(models: string[], prompt: string, apiKey: string) {
  let lastBusy: Response | null = null
  for (const model of models) {
    for (let attempt = 0; attempt < RETRIES_PER_MODEL; attempt++) {
      const res = await callModel(model, prompt, apiKey)
      if (res.ok) return { res, busy: false }
      if (res.status !== 503 && res.status !== 429) return { res, busy: false }
      lastBusy = res
      await sleep(1000 * (attempt + 1))
    }
  }
  return { res: lastBusy, busy: true }
}

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY?.trim()
  // GEMINI_MODEL can hold one name or several separated by commas,
  // e.g. "gemma-4-26b-a4b-it,gemma-4-31b-it"
  const models = (process.env.GEMINI_MODEL ?? "").split(",").map((m) => m.trim()).filter(Boolean)
  if (!apiKey || !models.length) {
    return NextResponse.json({ error: "Server is missing GEMINI_API_KEY or GEMINI_MODEL." }, { status: 500 })
  }

  const { type = "quiz", course = "", notes = "", count = 10 } = await req.json()
  if (typeof notes !== "string" || notes.length < 100) {
    return NextResponse.json({ error: "Not enough material to work with." }, { status: 400 })
  }

  const prompt = buildPrompt(type, course, notes.slice(0, MAX_CHARS), Math.min(Number(count) || 10, 20))

  const { res, busy } = await generateWithFallback(models, prompt, apiKey)

  if (busy || !res) {
    return NextResponse.json(
      { error: "The AI is busy right now. Please wait a few seconds and try again." },
      { status: 503 },
    )
  }
  if (!res.ok) {
    const details = await getProviderError(res)
    return NextResponse.json({ error: `Gemini API request failed (${res.status}): ${details}` }, { status: 502 })
  }

  const data = await res.json()
  const parts: Part[] = data?.candidates?.[0]?.content?.parts ?? []
  // Ignore any "thought" parts so only the final answer is parsed
  const raw = parts.filter((p) => !p.thought).map((p) => p.text ?? "").join("")

  try {
    const parsed = extractJson(raw)
    return NextResponse.json(type === "flashcards" ? { cards: parsed } : { questions: parsed })
  } catch {
    return NextResponse.json({ error: "The model's reply wasn't valid. Please try again." }, { status: 502 })
  }
}