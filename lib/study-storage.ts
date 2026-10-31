import { deleteDocData } from "./file-store"

export type StudyDocument = { id: string; name: string; size: number; pages: number; chars: number; createdAt: string }
export type QuizQuestion = { question: string; options: string[]; answer: number; explanation: string; topic: string }
export type Quiz = { id: string; documentId?: string; course: string; questions: QuizQuestion[]; createdAt: string }
export type QuizResult = { id: string; quizId?: string; documentId?: string; course: string; score: number; total: number; weakTopics: string[]; createdAt: string }
export type Exam = { id: string; course: string; date: string; type: string }
export type FlashcardDeck = { id: string; name: string; documentId?: string; cards: { term: string; definition: string }[]; createdAt: string }

const read = <T,>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)) as T } catch { return fallback }
}

// Throws if storage is full, so callers can tell the user
const write = <T,>(key: string, value: T) => {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    throw new Error("Browser storage is full. Delete a document or old quiz and try again.")
  }
}

// Results
export const getQuizResults = () => read<QuizResult[]>("quizme_results", [])
export const saveQuizResult = (result: QuizResult) => { const next = [result, ...getQuizResults()].slice(0, 50); write("quizme_results", next); return next }

// Exams
export const getExams = () => read<Exam[]>("quizme_exams", [])
export const saveExam = (exam: Exam) => { const next = [exam, ...getExams()]; write("quizme_exams", next); return next }

// Flashcard decks
export const getDecks = () => read<FlashcardDeck[]>("quizme_decks", [])
export const saveDeck = (deck: FlashcardDeck) => { const next = [deck, ...getDecks()]; write("quizme_decks", next); return next }

// Documents (metadata only; text and file live in IndexedDB)
export const getDocuments = () => read<StudyDocument[]>("quizme_documents", [])
export const saveDocument = (doc: StudyDocument) => { const next = [doc, ...getDocuments()]; write("quizme_documents", next); return next }

// Generated quizzes
export const getQuizzes = () => read<Quiz[]>("quizme_quizzes", [])
export const saveQuiz = (quiz: Quiz) => { const next = [quiz, ...getQuizzes()].slice(0, 30); write("quizme_quizzes", next); return next }

// Deleting a document also removes its quizzes, decks and stored file. Results are kept as history.
export async function removeDocument(id: string) {
  write("quizme_documents", getDocuments().filter((d) => d.id !== id))
  write("quizme_quizzes", getQuizzes().filter((q) => q.documentId !== id))
  write("quizme_decks", getDecks().filter((d) => d.documentId !== id))
  await deleteDocData(id)
}