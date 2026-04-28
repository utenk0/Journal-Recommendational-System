import { loadJournals } from '../connectors/mockJournalConnector.mjs'
import { tokenize } from '../../shared/journalNormalizer.js'

function computeRelevance(journal, queryTokens, domain, openAccessOnly) {
  const uniqueQueryTokens = new Set(queryTokens)
  const journalTokens = tokenize(
    [
      journal.name,
      journal.domain,
      journal.description,
      journal.quartile,
      journal.tags.join(' '),
      journal.keywords.join(' '),
    ].join(' '),
  )
  const tagTokens = tokenize(`${journal.tags.join(' ')} ${journal.keywords.join(' ')}`)

  const textMatches = journalTokens.reduce(
    (count, token) => count + (uniqueQueryTokens.has(token) ? 1 : 0),
    0,
  )
  const tagMatches = tagTokens.reduce(
    (count, token) => count + (uniqueQueryTokens.has(token) ? 1 : 0),
    0,
  )

  const textCoverage = journalTokens.length ? textMatches / journalTokens.length : 0
  const tagCoverage = tagTokens.length ? tagMatches / tagTokens.length : 0
  const domainBoost = domain !== 'all' && journal.domain === domain ? 0.12 : 0
  const oaBoost = openAccessOnly && journal.openAccess ? 0.06 : 0

  return Math.min(1, textCoverage * 0.5 + tagCoverage * 0.32 + domainBoost + oaBoost)
}

function keywordMatch(journal, keyword) {
  if (!keyword) return true

  const haystack = [
    journal.domain,
    journal.quartile,
    journal.description,
    ...journal.tags,
    ...journal.keywords,
  ]
    .join(' ')
    .toLowerCase()

  return haystack.includes(keyword)
}

export async function getJournals({
  title = '',
  abstractText = '',
  references = '',
  domain = 'all',
  openAccessOnly = false,
  keyword = '',
  sortBy = 'relevance',
}) {
  const journals = await loadJournals()
  const queryTokens = tokenize(`${title} ${abstractText} ${references}`)
  const cleanedKeyword = keyword.trim().toLowerCase()

  const filtered = journals
    .filter((journal) => {
      if (domain !== 'all' && journal.domain !== domain) return false
      if (openAccessOnly && !journal.openAccess) return false
      return keywordMatch(journal, cleanedKeyword)
    })
    .map((journal) => ({
      ...journal,
      relevance: computeRelevance(journal, queryTokens, domain, openAccessOnly),
    }))

  const items = [...filtered].sort((a, b) => {
    if (sortBy === 'match') return b.score - a.score
    return b.relevance - a.relevance
  })

  return {
    items,
    total: items.length,
  }
}

export async function getJournalById(id) {
  const journals = await loadJournals()
  return journals.find((journal) => journal.id === id) ?? null
}
