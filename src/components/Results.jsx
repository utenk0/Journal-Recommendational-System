import { useEffect, useState } from 'react'
import JournalCard from './JournalCard'

const DEFAULT_VISIBLE_RESULTS = 10

function Results({ filteredJournals, title, isLoading, error, onRetry }) {
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    setShowAll(false)
  }, [filteredJournals])

  const visibleJournals = showAll
    ? filteredJournals
    : filteredJournals.slice(0, DEFAULT_VISIBLE_RESULTS)
  const hiddenCount = Math.max(0, filteredJournals.length - DEFAULT_VISIBLE_RESULTS)

  return (
    <section className="results">
      <div className="results-header">
        <h2>Recommended Journals</h2>
        <p>
          Matching against <strong>{title || 'your manuscript'}</strong>
        </p>
      </div>

      {isLoading && (
        <div className="status-panel">
          <p>Loading journals...</p>
        </div>
      )}

      {!isLoading && error && (
        <div className="status-panel status-error">
          <p>{error}</p>
          <button className="ghost-button" type="button" onClick={onRetry}>
            Retry
          </button>
        </div>
      )}

      {!isLoading && !error && filteredJournals.length === 0 && (
        <div className="status-panel">
          <p>No journals matched the current search.</p>
        </div>
      )}

      {!isLoading && !error && filteredJournals.length > 0 && (
        <>
          <div className="cards">
            {visibleJournals.map((journal, index) => (
              <JournalCard
                key={journal.id}
                journal={journal}
                index={index}
              />
            ))}
          </div>

          {!showAll && hiddenCount > 0 && (
            <div className="results-actions">
              <button
                className="ghost-button"
                type="button"
                onClick={() => setShowAll(true)}
              >
                Show more ({hiddenCount})
              </button>
            </div>
          )}
        </>
      )}
    </section>
  )
}

export default Results
