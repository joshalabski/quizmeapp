export type LocalUser = { id: string; name: string; email: string }

type StoredUser = LocalUser & { password: string }
const USERS_KEY = "quizme_local_users"
const SESSION_KEY = "quizme_user"

function readUsers(): StoredUser[] {
  if (typeof window === "undefined") return []
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || "[]") as StoredUser[] } catch { return [] }
}

export function getLocalUser(): LocalUser | null {
  if (typeof window === "undefined") return null
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || "null") as LocalUser | null } catch { return null }
}

export function signUpLocal(name: string, email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase()
  const users = readUsers()
  if (users.some((user) => user.email === normalizedEmail)) return { error: "An account with that email already exists. Try logging in instead." }
  const user: StoredUser = { id: crypto.randomUUID(), name: name.trim(), email: normalizedEmail, password }
  localStorage.setItem(USERS_KEY, JSON.stringify([...users, user]))
  const session = { id: user.id, name: user.name, email: user.email }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  return { user: session }
}

export function loginLocal(email: string, password: string) {
  const user = readUsers().find((candidate) => candidate.email === email.trim().toLowerCase() && candidate.password === password)
  if (!user) return { error: "Invalid email or password. Please try again." }
  const session = { id: user.id, name: user.name, email: user.email }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  return { user: session }
}

export function logoutLocal() { localStorage.removeItem(SESSION_KEY) }
