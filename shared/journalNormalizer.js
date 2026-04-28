const STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'by',
  'for',
  'from',
  'in',
  'is',
  'it',
  'of',
  'on',
  'or',
  'that',
  'the',
  'to',
  'with',
])

export const FILTER_DOMAINS = ['Mathematics', 'Physics']

function journalNumberFromId(id) {
  return Number(id.replace('journal_', ''))
}

function buildIssns(journalNumber) {
  const first = 1000 + (journalNumber % 9000)
  const second = 4000 + ((journalNumber * 7) % 5000)
  const third = 2000 + ((journalNumber * 3) % 7000)
  const fourth = 3000 + ((journalNumber * 11) % 6000)

  return [`${first}-${second}`, `${third}-${fourth}`]
}

export function tokenize(text) {
  return (text.toLowerCase().match(/[a-z0-9]+/g) || []).filter(
    (token) => token.length > 2 && !STOP_WORDS.has(token),
  )
}

export function normalizeJournal(rawJournal) {
  const journalNumber = journalNumberFromId(rawJournal.id)
  const primaryDomain = rawJournal.domain[0]
  const openAccessLabel = rawJournal.openAccess ? 'Open access' : 'Hybrid access'
  const acceptanceRatePercent = `${Math.round(rawJournal.acceptanceRate * 100)}%`

  return {
    ...rawJournal,
    domain: primaryDomain,
    doi: `10.1000/${rawJournal.id}`,
    tags: [primaryDomain, rawJournal.quartile, openAccessLabel],
    description: `${primaryDomain} venue with ${rawJournal.quartile} standing, impact factor ${rawJournal.impactFactor}, and ${acceptanceRatePercent} acceptance rate.`,
    publisher: `${primaryDomain} Research Press`,
    issns: buildIssns(journalNumber),
    averagePublicationTime: `${rawJournal.reviewTime_weeks} weeks`,
    languages: ['English'],
    authorRetainsRights: rawJournal.openAccess,
    articleReceivesDoi: true,
    peerReviewMethod: rawJournal.reviewTime_weeks <= 12 ? 'Single-blind peer review' : 'Anonymous peer review',
    license: rawJournal.openAccess ? 'CC BY' : 'Subscription / hybrid',
    maxApc: rawJournal.openAccess ? `$${1200 + (journalNumber % 6) * 300}` : 'None listed',
    planSCompliance: rawJournal.openAccess,
    doajSince: rawJournal.openAccess
      ? `${(journalNumber % 12) + 1}/${(journalNumber % 27) + 1}/20${19 + (journalNumber % 6)}`
      : 'Not listed',
    website: `https://example.org/journals/${rawJournal.id}`,
    authorInstructions: `https://example.org/journals/${rawJournal.id}/authors`,
    aimsAndScope: `https://example.org/journals/${rawJournal.id}/aims`,
    editorialBoard: `https://example.org/journals/${rawJournal.id}/editorial-board`,
    subjects: [primaryDomain, rawJournal.quartile, `${rawJournal.reviewTime_weeks}-week review cycle`],
    keywords: [
      `${primaryDomain.toLowerCase()} research`,
      `impact factor ${rawJournal.impactFactor}`,
      `${acceptanceRatePercent} acceptance`,
      rawJournal.quartile,
    ],
  }
}
