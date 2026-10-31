import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { notes, topic, count = 10 } = await request.json()
    if (!notes && !topic) return NextResponse.json({ error: "Add notes or a topic to generate a quiz." }, { status: 400 })
    const apiKey = process.env.GEMINI_API_KEY
    const model = process.env.GEMINI_MODEL || "gemini-1.5-flash"
    if (!apiKey) return NextResponse.json({ error: "Gemini is not configured yet. Add GEMINI_API_KEY to enable generation." }, { status: 503 })
    const prompt = `Create ${count} multiple-choice study questions about ${topic || "the provided notes"}. Return valid JSON only as {"questions":[{"question":"...","options":["...","...","...","..."],"answer":0,"explanation":"..."}]}. Notes: ${notes || ""}`
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) })
    if (!response.ok) return NextResponse.json({ error: "Gemini could not generate a quiz right now." }, { status: 502 })
    const data = await response.json(); const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ""
    const cleaned = text.replace(/^```json\s*/i, "").replace(/```$/i, "").trim()
    return NextResponse.json(JSON.parse(cleaned))
  } catch { return NextResponse.json({ error: "We couldn&apos;t read the generated quiz. Please try again." }, { status: 500 }) }
}
