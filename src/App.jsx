import { useEffect, useState } from 'react'
import { fetchJournalById, fetchJournals } from './api/journals'
import JournalDetails from './components/JournalDetails'
import ManuscriptForm from './components/ManuscriptForm'
import Results from './components/Results'
import Sidebar from './components/Sidebar'
import './App.css'

const FILTER_DOMAINS = ['Mathematics', 'Physics']

function readRouteFromHash() {
  const match = window.location.hash.match(/journal=([^&]+)/)

  if (match) {
    return {
      name: 'journal',
      journalId: decodeURIComponent(match[1]),
    }
  }

  if (window.location.hash === '#results') {
    return { name: 'results', journalId: null }
  }

  return { name: 'search', journalId: null }
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

function App() {
  const [domain, setDomain] = useState('Mathematics')
  const [draftTitle, setDraftTitle] = useState('')
  const [draftAbstractText, setDraftAbstractText] = useState('')
  const [searchTitle, setSearchTitle] = useState('')
  const [searchAbstractText, setSearchAbstractText] = useState('')
  const [route, setRoute] = useState(() => readRouteFromHash())
  const [journals, setJournals] = useState([])
  const [query, setQuery] = useState(null)
  const [isResultsLoading, setIsResultsLoading] = useState(false)
  const [resultsError, setResultsError] = useState('')
  const [detailJournal, setDetailJournal] = useState(null)
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState('')
  const [resultsReloadKey, setResultsReloadKey] = useState(0)
  const [detailReloadKey, setDetailReloadKey] = useState(0)

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(readRouteFromHash())
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  useEffect(() => {
    if (route.name !== 'results') return undefined

    const abortController = new AbortController()

    async function loadJournals() {
      setIsResultsLoading(true)
      setResultsError('')
      setJournals([])

      try {
        const payload = await fetchJournals({
          title: searchTitle,
          abstractText: searchAbstractText,
          domain,
          sortBy: 'match',
        })

        if (abortController.signal.aborted) return

        setQuery(payload.query)
        setJournals(payload.recommendations)
      } catch (error) {
        if (abortController.signal.aborted) return
        setResultsError(error instanceof Error ? error.message : 'Failed to load journals')
        setQuery(null)
        setJournals([])
      } finally {
        if (!abortController.signal.aborted) {
          setIsResultsLoading(false)
        }
      }
    }

    loadJournals()
    return () => abortController.abort()
  }, [route.name, searchTitle, searchAbstractText, domain, resultsReloadKey])

  useEffect(() => {
    if (route.name !== 'journal') return undefined

    const abortController = new AbortController()

    async function loadDetail() {
      setIsDetailLoading(true)
      setDetailError('')
      setDetailJournal(null)

      try {
        const payload = await fetchJournalById(route.journalId)

        if (abortController.signal.aborted) return

        setDetailJournal(payload)
      } catch (error) {
        if (abortController.signal.aborted) return
        setDetailError(error instanceof Error ? error.message : 'Failed to load journal details')
      } finally {
        if (!abortController.signal.aborted) {
          setIsDetailLoading(false)
        }
      }
    }

    loadDetail()
    return () => abortController.abort()
  }, [route.name, route.journalId, detailReloadKey])

  const runSearch = () => {
    setSearchTitle(draftTitle)
    setSearchAbstractText(draftAbstractText)
    setRoute({ name: 'results', journalId: null })

    if (window.location.hash === '#results') {
      setResultsReloadKey((value) => value + 1)
    } else {
      window.location.hash = 'results'
    }
  }

  const clearSearch = () => {
    setDraftTitle('')
    setDraftAbstractText('')
    setSearchTitle('')
    setSearchAbstractText('')
    setQuery(null)
  }

  const exportBrief = () => {
    const exportedQuery = query || {
      title: searchTitle || 'Untitled manuscript',
      abstract: searchAbstractText || '',
    }

    const lines = [
      'ScholarAI Recommendation Brief',
      '',
      `Title: ${exportedQuery.title || 'Untitled manuscript'}`,
      `Abstract: ${exportedQuery.abstract || 'No abstract provided.'}`,
      '',
      'Filters',
      `- Domain: ${domain}`,
      '',
      `Recommendations (${journals.length})`,
      '',
    ]

    journals.forEach((journal) => {
      lines.push(`${journal.rank}. ${journal.journal_name}`)
      lines.push(`   Match score: ${journal.match_score_percent}%`)
      lines.push(`   Confidence: ${journal.confidence}`)
      lines.push(`   ISSN: ${journal.issn.join(', ')}`)
      lines.push(`   Reason: ${journal.reason}`)
      lines.push(
        `   Best matching paper: ${journal.best_matching_paper.title} (${journal.best_matching_paper.year})`,
      )
      lines.push(`   DOI: ${journal.best_matching_paper.doi}`)
      lines.push(
        `   Supporting papers (${journal.supporting_paper_count}): ${journal.supporting_papers.map((paper) => paper.title).join('; ')}`,
      )
      lines.push('')
    })

    const fileContents = lines.join('\n')
    const blob = new Blob([fileContents], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const fileNameBase = slugify(exportedQuery.title || 'recommendation-brief') || 'recommendation-brief'

    link.href = url
    link.download = `${fileNameBase}-brief.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  if (route.name === 'journal') {
    return (
      <div className="page detail-page-shell">
        <header className="topbar">
          <div className="brand">
            <span className="brand-mark" />
            <div>
              <p className="brand-title">ScholarAI</p>
              <p className="brand-subtitle">Journal detail view</p>
            </div>
          </div>
          <div className="topbar-meta">
            <a className="ghost-button detail-back-link" href="#results">
              Back to results
            </a>
          </div>
        </header>

        <main className="detail-page-content">
          <JournalDetails
            journal={detailJournal}
            isLoading={isDetailLoading}
            error={detailError}
            onRetry={() => setDetailReloadKey((value) => value + 1)}
          />
        </main>
      </div>
    )
  }

  if (route.name === 'results') {
    return (
      <div className="page results-page-shell">
        <header className="topbar">
          <div className="brand">
            <span className="brand-mark" />
            <div>
              <p className="brand-title">ScholarAI</p>
              <p className="brand-subtitle">Journal recommendations</p>
            </div>
          </div>
          <div className="topbar-meta">
            <a className="ghost-button detail-back-link" href="#">
              Back to search
            </a>
            <button
              className="ghost-button"
              type="button"
              onClick={exportBrief}
              disabled={isResultsLoading || journals.length === 0}
            >
              Export Brief
            </button>
          </div>
        </header>

        <main className="results-page-content">
          <Results
            filteredJournals={journals}
            title={query?.title || searchTitle}
            isLoading={isResultsLoading}
            error={resultsError}
            onRetry={() => setResultsReloadKey((value) => value + 1)}
          />
        </main>
      </div>
    )
  }

  return (
    <div className="page">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" />
          <div>
            <p className="brand-title">ScholarAI</p>
            <p className="brand-subtitle">Manuscript recommendation studio</p>
          </div>
        </div>
        <div className="topbar-meta">
          <span className="pill">Beta</span>
          <button
            className="ghost-button"
            type="button"
            onClick={exportBrief}
            disabled={isResultsLoading || journals.length === 0}
          >
            Export Brief
          </button>
        </div>
      </header>

      <div className="layout">
        <Sidebar
          domains={FILTER_DOMAINS}
          domain={domain}
          setDomain={setDomain}
        />

        <main className="content">
          <ManuscriptForm
            title={draftTitle}
            setTitle={setDraftTitle}
            abstractText={draftAbstractText}
            setAbstractText={setDraftAbstractText}
            onSubmitSearch={runSearch}
            onClear={clearSearch}
          />
        </main>
      </div>
    </div>
  )
}

export default App
