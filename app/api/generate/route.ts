import { NextResponse } from "next/server"

function cleanJson(text: string) {
  return text.replace(/^```(?:json)?\s*/i, "").replace(/```$/i, "").trim()
}

export async function POST(request: Request) {
  try {
    const { type = "quiz", notes = "", topic = "", course = "", count = 10, pastQuestions = "" } = await request.json()
    const source = notes || topic || pastQuestions
    if (!source) return NextResponse.json({ error: "Add some material first so we know what to generate." }, { status: 400 })
    const apiKey = process.env.GEMINI_API_KEY
    const model = process.env.GEMINI_MODEL || "gemini-1.5-flash"
    if (!apiKey) return NextResponse.json({ error: "Generation is not configured yet. Add GEMINI_API_KEY to enable AI generation." }, { status: 503 })

    let prompt = ""
    if (type === "flashcards") {
      prompt = `Create 12 concise study flashcards from these notes for ${course || "this course"}. Return valid JSON only as {"cards":[{"term":"...","definition":"..."}]}. Notes: ${notes}`
    } else if (type === "likely") {
      prompt = `Analyze these past exam questions. Group repeated themes, rank them by frequency, and propose exactly 5 likely questions. Return valid JSON only as {"topics":[{"name":"...","frequency":3}],"questions":["..."]}. These are estimates, not guarantees. Questions: ${pastQuestions}`
    } else {
      prompt = `Create ${count} multiple-choice study questions about ${topic || "the provided notes"}. Return valid JSON only as {"questions":[{"question":"...","options":["...","...","...","..."],"answer":0,"explanation":"..."}]}. Notes: ${notes}`
    }
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) })
    if (!response.ok) return NextResponse.json({ error: "The model could not generate that right now. Please try again." }, { status: 502 })
    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ""
    return NextResponse.json(JSON.parse(cleanJson(text)))
  } catch {
    return NextResponse.json({ error: "We couldn't read that response. Please try again." }, { status: 500 })
  }
}
