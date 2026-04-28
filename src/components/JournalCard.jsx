import Chip from '@mui/material/Chip'
import MatchRing from './MatchRing'

function JournalCard({ journal, index }) {
  const detailHref = `/#journal=${journal.id}`

  return (
    <article
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
        <a
          className="card-link"
          href={detailHref}
          target="_blank"
          rel="noreferrer"
        >
          View journal
        </a>
      </div>
    </article>
  )
}

export default JournalCard
