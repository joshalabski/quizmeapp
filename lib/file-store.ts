import { del, get, set } from "idb-keyval"

export const saveDocText = (id: string, text: string) => set(`doc-text:${id}`, text)
export const getDocText = (id: string) => get<string>(`doc-text:${id}`)
export const saveDocFile = (id: string, file: Blob) => set(`doc-file:${id}`, file)
export const getDocFile = (id: string) => get<Blob>(`doc-file:${id}`)
export const deleteDocData = (id: string) =>
  Promise.all([del(`doc-text:${id}`), del(`doc-file:${id}`)])