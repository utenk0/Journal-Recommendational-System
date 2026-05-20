import { useEffect, useState } from 'react'
import { fetchJournalById, fetchJournals } from './api/journals'
import JournalDetails from './components/JournalDetails'
import ManuscriptForm from './components/ManuscriptForm'
import Results from './components/Results'
import Sidebar from './components/Sidebar'
import { FILTER_DOMAINS } from '../shared/journalNormalizer.js'
import './App.css'

function readJournalIdFromHash() {
  const match = window.location.hash.match(/journal=([^&]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

function App() {
  const [domain, setDomain] = useState('all')
  const [openAccessOnly, setOpenAccessOnly] = useState(false)
  const [mscCode, setMscCode] = useState('')
  const [draftTitle, setDraftTitle] = useState('artificial intelligence for science')
  const [draftAbstractText, setDraftAbstractText] = useState('')
  const [draftReferences, setDraftReferences] = useState('')
  const [searchTitle, setSearchTitle] = useState('artificial intelligence for science')
  const [searchAbstractText, setSearchAbstractText] = useState('')
  const [searchReferences, setSearchReferences] = useState('')
  const [routeJournalId, setRouteJournalId] = useState(() => readJournalIdFromHash())
  const [journals, setJournals] = useState([])
  const [resultsTotal, setResultsTotal] = useState(0)
  const [isResultsLoading, setIsResultsLoading] = useState(false)
  const [resultsError, setResultsError] = useState('')
  const [detailJournal, setDetailJournal] = useState(null)
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState('')
  const [resultsReloadKey, setResultsReloadKey] = useState(0)
  const [detailReloadKey, setDetailReloadKey] = useState(0)

  useEffect(() => {
    const handleHashChange = () => {
      setRouteJournalId(readJournalIdFromHash())
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  useEffect(() => {
    if (routeJournalId !== null) return undefined

    const abortController = new AbortController()

    async function loadJournals() {
      setIsResultsLoading(true)
      setResultsError('')
      setJournals([])

      try {
        const payload = await fetchJournals({
          title: searchTitle,
          abstractText: searchAbstractText,
          references: searchReferences,
          domain,
          openAccessOnly,
          keyword: mscCode,
          sortBy: 'match',
        })

        if (abortController.signal.aborted) return

        setJournals(payload.items)
        setResultsTotal(payload.total)
      } catch (error) {
        if (abortController.signal.aborted) return
        setResultsError(error instanceof Error ? error.message : 'Failed to load journals')
        setJournals([])
        setResultsTotal(0)
      } finally {
        if (!abortController.signal.aborted) {
          setIsResultsLoading(false)
        }
      }
    }

    loadJournals()
    return () => abortController.abort()
  }, [routeJournalId, searchTitle, searchAbstractText, searchReferences, domain, openAccessOnly, mscCode, resultsReloadKey])

  useEffect(() => {
    if (routeJournalId === null) return undefined

    const abortController = new AbortController()

    async function loadDetail() {
      setIsDetailLoading(true)
      setDetailError('')
      setDetailJournal(null)

      try {
        const payload = await fetchJournalById(routeJournalId)

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
  }, [routeJournalId, detailReloadKey])

  const runSearch = () => {
    setSearchTitle(draftTitle)
    setSearchAbstractText(draftAbstractText)
    setSearchReferences(draftReferences)
  }

  const clearSearch = () => {
    setDraftTitle('')
    setDraftAbstractText('')
    setDraftReferences('')
    setSearchTitle('')
    setSearchAbstractText('')
    setSearchReferences('')
  }

  if (routeJournalId !== null) {
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
            <a className="ghost-button detail-back-link" href="/">
              Back to search
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
          <button className="ghost-button" type="button">
            Export Brief
          </button>
        </div>
      </header>

      <div className="layout">
        <Sidebar
          domains={FILTER_DOMAINS}
          domain={domain}
          setDomain={setDomain}
          openAccessOnly={openAccessOnly}
          setOpenAccessOnly={setOpenAccessOnly}
          mscCode={mscCode}
          setMscCode={setMscCode}
        />

        <main className="content">
          <ManuscriptForm
            title={draftTitle}
            setTitle={setDraftTitle}
            abstractText={draftAbstractText}
            setAbstractText={setDraftAbstractText}
            references={draftReferences}
            setReferences={setDraftReferences}
            filteredJournals={journals}
            resultsTotal={resultsTotal}
            isLoading={isResultsLoading}
            onSubmitSearch={runSearch}
            onClear={clearSearch}
          />

          <Results
            filteredJournals={journals}
            title={searchTitle}
            isLoading={isResultsLoading}
            error={resultsError}
            onRetry={() => setResultsReloadKey((value) => value + 1)}
          />
        </main>
      </div>
    </div>
  )
}

export default App
