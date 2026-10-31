export type QuizResult = { id: string; course: string; score: number; total: number; weakTopics: string[]; createdAt: string }
export type Exam = { id: string; course: string; date: string; type: string }
export type FlashcardDeck = { id: string; name: string; cards: { term: string; definition: string }[]; createdAt: string }

const read = <T,>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)) as T } catch { return fallback }
}
const write = <T,>(key: string, value: T) => { if (typeof window !== "undefined") localStorage.setItem(key, JSON.stringify(value)) }

export const getQuizResults = () => read<QuizResult[]>("quizme_results", [])
export const saveQuizResult = (result: QuizResult) => { const next = [result, ...getQuizResults()].slice(0, 50); write("quizme_results", next); return next }
export const getExams = () => read<Exam[]>("quizme_exams", [])
export const saveExam = (exam: Exam) => { const next = [exam, ...getExams()]; write("quizme_exams", next); return next }
export const getDecks = () => read<FlashcardDeck[]>("quizme_decks", [])
export const saveDeck = (deck: FlashcardDeck) => { const next = [deck, ...getDecks()]; write("quizme_decks", next); return next }
