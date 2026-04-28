import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { normalizeJournal } from '../../shared/journalNormalizer.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const JOURNALS_FILE = path.resolve(__dirname, '../../src/data/journals.json')

export async function loadJournals() {
  const raw = await readFile(JOURNALS_FILE, 'utf8')
  const parsed = JSON.parse(raw)
  return parsed.map(normalizeJournal)
}
