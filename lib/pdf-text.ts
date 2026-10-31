export async function extractPdfText(file: File): Promise<{ text: string; pages: number }> {
  // Imported inside the function so it never runs on the server
  const pdfjs = await import("pdfjs-dist")
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs"

  const data = new Uint8Array(await file.arrayBuffer())
  const pdf = await pdfjs.getDocument({ data }).promise

  let text = ""
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    text += content.items.map((item) => ("str" in item ? item.str : "")).join(" ") + "\n\n"
  }
  return { text: text.trim(), pages: pdf.numPages }
}