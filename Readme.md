# QuizMe

**An exam-prep companion that turns your own notes into practice, then shows you where you're weak.**

Students waste hours making practice questions, and most only discover their gaps in the exam hall. QuizMe lets you upload a lecture PDF once, generate quizzes from it with Google's **Gemma** model, and track your weak topics, streak and exam countdowns, all stored on your own device.

**Live demo:** https://quizmeapp-blush.vercel.app
**Demo video:** _add your YouTube or Loom link here_

---

## Features

- **PDF study library**: upload a PDF once. The text is extracted in the browser and saved locally, so you never re-upload it.
- **AI quiz generator**: pick a saved PDF (or paste notes) and get multiple-choice questions, each with four options, the correct answer, an explanation and a topic tag.
- **Instant feedback**: answers lock after the first pick, with green/red feedback and a short explanation.
- **Weak-topic tracking**: wrong answers become a "Topics to revise" list, built from the topic tags on each question.
- **Retry missed questions**: replay only the questions you got wrong.
- **Saved quizzes**: generated quizzes are stored so you can retake them without calling the AI again.
- **Study streak and activity heatmap**: a GitHub-style grid shows every day you finished a quiz, with current and best streaks.
- **Dashboard**: streak, quizzes taken, average score and days until your next exam, with quick links to every tool.
- **Flashcards, study planner, likely questions**: flashcards from your notes, exam countdowns, and topic grouping from past questions (estimates only, not predictions).
- **Reliable by design**: the API route retries when the model is busy, falls back to a second model, validates every response and shows friendly errors instead of crashing.

## How Gemma is used

QuizMe calls **Gemma 4** through the Gemini API from a server-side Next.js route (`/api/generate`), so the API key is never exposed to the browser.

1. The browser sends the study text, course name and question count to `/api/generate`.
2. The route builds a structured prompt that asks the model to reply with JSON only.
3. The model (for example `gemma-4-26b-a4b-it`) returns questions or flashcards.
4. The route strips any markdown, parses the JSON, and the client validates each question before showing it.
5. If a model returns `503` (busy) or `429` (rate limit), the route retries, then tries the next model in `GEMINI_MODEL`.

## Tech stack

- [Next.js](https://nextjs.org/) (App Router) and TypeScript
- [Tailwind CSS](https://tailwindcss.com/) and shadcn/ui components, with [lucide-react](https://lucide.dev/) icons
- [Google Gemma](https://ai.google.dev/gemma) via the Gemini API
- [pdf.js](https://mozilla.github.io/pdf.js/) (`pdfjs-dist`) for in-browser PDF text extraction
- [idb-keyval](https://github.com/jakearchibald/idb-keyval) (IndexedDB) for stored PDF text and files
- `localStorage` for quizzes, results, flashcard decks, exams and the document index

## Getting started

### Prerequisites

- Node.js 18 or newer
- A free API key from [Google AI Studio](https://aistudio.google.com/apikey)

### Install

```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>
npm install
```

Copy the PDF worker into `public/` (it must match your installed `pdfjs-dist` version, so repeat this after upgrading):

```bash
cp node_modules/pdfjs-dist/build/pdf.worker.min.mjs public/
```

### Environment variables

Create a file named `.env.local` in the project root:

```
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemma-4-26b-a4b-it,gemma-4-31b-it
```

- `GEMINI_API_KEY`: your key from Google AI Studio. Never commit it.
- `GEMINI_MODEL`: one model name, or several separated by commas. They are tried in order if one is busy. Use exact names without the `models/` prefix. You can list the models your key can use at `https://generativelanguage.googleapis.com/v1beta/models?key=YOUR_KEY`.

On Vercel, add the same variables under **Project Settings > Environment Variables** (no quotes), then redeploy.

### Run

```bash
npm run dev
```

Open http://localhost:3000.

## Project structure

```
app/
  api/generate/route.ts   Server route that calls Gemma (retry, fallback, JSON cleanup)
  dashboard/              Stats, streak heatmap, PDF library, exams, quick links
  quiz/                   Quiz setup, taking a quiz, results, saved quizzes
  flashcards/ planner/ likely-questions/ progress/
components/
  app-shell.tsx           Sidebar, header and page layout
  pdf-upload.tsx          PDF upload and document list
  study-heatmap.tsx       GitHub-style activity grid
lib/
  study-storage.ts        localStorage data layer (documents, quizzes, results, decks, exams)
  file-store.ts           IndexedDB storage for PDF text and files
  pdf-text.ts             In-browser PDF text extraction
  streak.ts               Daily activity counts and streak calculation
  local-auth.ts           Demo login (browser storage only)
```

## Data and privacy

- All study data (PDFs, extracted text, quizzes, results, decks, exams) is stored **in your browser**. Nothing is saved on a server.
- Only the text needed to generate a quiz or flashcards is sent to the model through the API route.
- Clearing your browser data removes everything.
- The login is a **demo**: it stores a user locally and is not real authentication.

## Known limitations

- Scanned or image-only PDFs have no text layer and are not supported yet.
- Very long PDFs are truncated to roughly the first 12,000 characters per request.
- Data lives on one device and browser, with no sync across devices.
- Free-tier model limits can cause temporary "busy" errors. The app retries, but you may need to wait a few seconds.
- "Likely questions" groups topics that repeat in the past questions you provide. It estimates, it does not predict.

## Roadmap

- Real accounts and cross-device sync with Supabase
- OCR for scanned PDFs
- Chapter or page-range selection for long documents
- Flashcard and study-session activity counted in the streak
- Offline mode with an on-device model

## License

Released under the [MIT License](./LICENSE).

## Author

Built by Joshua for a Gemma-powered hackathon.