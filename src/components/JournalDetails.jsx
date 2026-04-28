function DetailRow({ label, value }) {
  return (
    <div className="detail-row">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}

function DetailLink({ href, label }) {
  return (
    <a className="detail-link" href={href} target="_blank" rel="noreferrer">
      {label}
    </a>
  )
}

function JournalDetails({ journal, isLoading = false, error = '', onRetry }) {
  if (isLoading) {
    return (
      <section className="journal-detail panel detail-empty">
        <h3>Loading journal</h3>
        <p>Fetching journal details from the API.</p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="journal-detail panel detail-empty">
        <h3>Unable to load journal</h3>
        <p>{error}</p>
        <button className="ghost-button" type="button" onClick={onRetry}>
          Retry
        </button>
      </section>
    )
  }

  if (!journal) {
    return (
      <section className="journal-detail panel detail-empty">
        <h3>Select a journal</h3>
        <p>Choose a result card to inspect publisher details, policies, and scope.</p>
      </section>
    )
  }

  return (
    <section className="journal-detail panel">
      <div className="detail-title-row">
        <div>
          <p className="detail-eyebrow">Selected journal</p>
          <h2>{journal.name}</h2>
          <p className="detail-description">{journal.description}</p>
        </div>
      </div>

      <div className="detail-layout">
        <dl className="detail-grid">
          <DetailRow label="Publisher:" value={journal.publisher} />
          <DetailRow label="ISSNs:" value={journal.issns.join(', ')} />
          <DetailRow label="Primary domain:" value={journal.domain} />
          <DetailRow label="Impact factor:" value={journal.impactFactor} />
          <DetailRow label="Quartile:" value={journal.quartile} />
          <DetailRow label="Acceptance rate:" value={`${Math.round(journal.acceptanceRate * 100)}%`} />
          <DetailRow label="Average publication time:" value={journal.averagePublicationTime} />
          <DetailRow label="Language(s):" value={journal.languages.join(', ')} />
          <DetailRow label="Author retains unrestricted rights:" value={journal.authorRetainsRights ? 'Yes' : 'No'} />
          <DetailRow label="Article receives DOI:" value={journal.articleReceivesDoi ? 'Yes' : 'No'} />
          <DetailRow label="Peer review method:" value={journal.peerReviewMethod} />
          <DetailRow label="License(s):" value={journal.license} />
          <DetailRow label="Maximum publication fees (APCs):" value={journal.maxApc} />
          <DetailRow label="Plan S compliance:" value={journal.planSCompliance ? 'Yes' : 'No'} />
          <DetailRow label="In DOAJ since:" value={journal.doajSince} />
        </dl>

        <div className="detail-side">
          <div className="detail-links">
            <DetailLink href={journal.website} label="Website" />
            <DetailLink href={journal.authorInstructions} label="Author instructions" />
            <DetailLink href={journal.aimsAndScope} label="Aims & scope" />
            <DetailLink href={journal.editorialBoard} label="Editorial Board" />
          </div>

          <div className="token-block">
            <h3>Subjects:</h3>
            <div className="token-list">
              {journal.subjects.map((subject) => (
                <span key={subject} className="token-chip">
                  {subject}
                </span>
              ))}
            </div>
          </div>

          <div className="token-block">
            <h3>Keywords:</h3>
            <div className="token-list">
              {journal.keywords.map((keyword) => (
                <span key={keyword} className="token-chip">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default JournalDetails
