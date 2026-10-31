import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const displayName = user.user_metadata?.display_name || user.email?.split("@")[0] || "Student"
      await supabase.from("profiles").upsert({ id: user.id, email: user.email, display_name: displayName })
    }
  }
  return NextResponse.redirect(new URL("/dashboard", request.url))
}
