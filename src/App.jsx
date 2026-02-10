import { useMemo, useState } from 'react'
import Chip from '@mui/material/Chip'
import './App.css'

const JOURNALS = [
  {
    id: 1,
    name: 'Journal of Applied Mathematics',
    doi: '10.1007/s10440-023-00567-z',
    score: 0.92,
    openAccess: true,
    domain: 'math',
    tags: ['PDEs', 'analysis', 'applied'],
  },
  {
    id: 2,
    name: 'Open Access Journal of Pure Math',
    doi: '10.3934/math.2023001',
    score: 0.65,
    openAccess: true,
    domain: 'math',
    tags: ['algebra', 'geometry'],
  },
  {
    id: 3,
    name: 'Acta Mathematica',
    doi: '10.4310/ACTA.2023.v231.n1.a1',
    score: 0.82,
    openAccess: false,
    domain: 'math',
    tags: ['topology', 'analysis'],
  },
  {
    id: 4,
    name: 'Physics Letters A',
    doi: '10.1016/j.physleta.2023.128932',
    score: 0.78,
    openAccess: false,
    domain: 'physics',
    tags: ['theory', 'quantum'],
  },
  {
    id: 5,
    name: 'Astrophysical Journal Letters',
    doi: '10.3847/2041-8213/acf831',
    score: 0.86,
    openAccess: true,
    domain: 'physics',
    tags: ['astro', 'cosmology'],
  },
  {
    id: 6,
    name: 'Computational Methods in Science',
    doi: '10.1016/j.cms.2024.0111',
    score: 0.73,
    openAccess: false,
    domain: 'physics',
    tags: ['simulation', 'numerics'],
  },
]

function MatchRing({ score }) {
  const size = 54
  const stroke = 6
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.max(0, Math.min(1, score))
  const dashOffset = circumference * (1 - clamped)

  return (
    <div className="match-ring">
      <svg width={size} height={size} aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1d4ed8"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="match-ring-text">
        <strong>{Math.round(score * 100)}</strong>
        <span>Match</span>
      </div>
    </div>
  )
}

function App() {
  const [domain, setDomain] = useState('all')
  const [openAccessOnly, setOpenAccessOnly] = useState(false)
  const [mscCode, setMscCode] = useState('')
  const [sortBy, setSortBy] = useState('relevance')
  const [title, setTitle] = useState('math')
  const [abstractText, setAbstractText] = useState('')
  const [references, setReferences] = useState('')

  const filteredJournals = useMemo(() => {
    const cleanedCode = mscCode.trim().toLowerCase()
    const matchesCode = (journal) => {
      if (!cleanedCode) return true
      return journal.tags.some((tag) => tag.toLowerCase().includes(cleanedCode))
    }

    const filtered = JOURNALS.filter((journal) => {
      if (domain !== 'all' && journal.domain !== domain) return false
      if (openAccessOnly && !journal.openAccess) return false
      return matchesCode(journal)
    })

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'match') return b.score - a.score
      return b.score - a.score
    })

    return sorted
  }, [domain, openAccessOnly, mscCode, sortBy])

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
        <aside className="sidebar">
          <div className="sidebar-section">
            <h2>Filters</h2>
            <div className="field-group">
              <p className="field-label">Domain</p>
              <label className="radio-row">
                <input
                  type="radio"
                  name="domain"
                  value="math"
                  checked={domain === 'math'}
                  onChange={() => setDomain('math')}
                />
                <span>Mathematics</span>
              </label>
              <label className="radio-row">
                <input
                  type="radio"
                  name="domain"
                  value="physics"
                  checked={domain === 'physics'}
                  onChange={() => setDomain('physics')}
                />
                <span>Physics</span>
              </label>
              <label className="radio-row">
                <input
                  type="radio"
                  name="domain"
                  value="all"
                  checked={domain === 'all'}
                  onChange={() => setDomain('all')}
                />
                <span>All</span>
              </label>
            </div>

            <div className="field-group">
              <label className="switch-row">
                <input
                  type="checkbox"
                  checked={openAccessOnly}
                  onChange={(event) => setOpenAccessOnly(event.target.checked)}
                />
                <span className="switch-text">
                  Open Access
                  <small>Show only open access journals</small>
                </span>
              </label>
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="msc">
                MSC Codes
              </label>
              <input
                id="msc"
                className="text-input"
                placeholder="e.g., 53C, 35Q"
                value={mscCode}
                onChange={(event) => setMscCode(event.target.value)}
              />
            </div>
          </div>

          {!openAccessOnly && (
            <div className="sidebar-section">
              <h3>Sorting</h3>
              <div className="field-group">
                <label className="select-label" htmlFor="sortBy">
                  Sort by
                </label>
                <select
                  id="sortBy"
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                >
                  <option value="relevance">Relevance</option>
                  <option value="match">Match score</option>
                </select>
              </div>
            </div>
          )}
        </aside>

        <main className="content">
          <section className="panel hero">
            <div className="panel-header">
              <div>
                <h1>Manuscript-Based Search</h1>
                <p>
                  Paste your manuscript details below for AI-powered journal
                  recommendations.
                </p>
              </div>
              <div className="panel-metrics">
                <div>
                  <span className="metric-label">Results</span>
                  <strong>{filteredJournals.length}</strong>
                </div>
                <div>
                  <span className="metric-label">Open Access</span>
                  <strong>
                    {filteredJournals.filter((journal) => journal.openAccess).length}
                  </strong>
                </div>
              </div>
            </div>

            <form className="form-grid" onSubmit={(event) => event.preventDefault()}>
              <label className="field">
                <span>Title</span>
                <input
                  className="text-input dark"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                />
              </label>
              <label className="field">
                <span>Abstract</span>
                <textarea
                  className="text-input dark"
                  placeholder="Paste your abstract here..."
                  value={abstractText}
                  onChange={(event) => setAbstractText(event.target.value)}
                />
              </label>
              <label className="field">
                <span>References (Optional)</span>
                <textarea
                  className="text-input dark"
                  placeholder="Paste references, one per line..."
                  value={references}
                  onChange={(event) => setReferences(event.target.value)}
                />
              </label>
              <div className="form-actions">
                <button className="primary-button" type="submit">
                  Find Journals
                </button>
                <button className="ghost-button" type="button">
                  Save draft
                </button>
              </div>
            </form>
          </section>

          <section className="results">
            <div className="results-header">
              <h2>Recommended Journals</h2>
              <p>
                Matching against <strong>{title || 'your manuscript'}</strong>
              </p>
            </div>

            <div className="cards">
              {filteredJournals.map((journal, index) => (
                <article
                  key={journal.id}
                  className="card"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <div className="card-header">
                    <h3>{journal.name}</h3>
                    <MatchRing score={journal.score} />
                  </div>
                  <p className="doi">{journal.doi}</p>
                  <div className="card-tags">
                    <Chip
                      label={journal.domain.toUpperCase()}
                      size="small"
                      className="chip chip-domain"
                    />
                    {journal.openAccess && (
                      <Chip
                        label="Open Access"
                        size="small"
                        className="chip chip-oa"
                      />
                    )}
                  </div>
                  <div className="card-footer">
                    <p>
                      Best for {journal.tags[0]} and {journal.tags[1]} submissions.
                    </p>
                    <button className="ghost-button" type="button">
                      View journal
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

export default App
