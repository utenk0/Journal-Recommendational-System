function Sidebar({
  domains,
  domain,
  setDomain,
  openAccessOnly,
  setOpenAccessOnly,
  mscCode,
  setMscCode,
  sortBy,
  setSortBy,
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <h2>Filters</h2>
        <div className="field-group">
          <p className="field-label">Domain</p>
          {domains.map((domainOption) => (
            <label key={domainOption} className="radio-row">
              <input
                type="radio"
                name="domain"
                value={domainOption}
                checked={domain === domainOption}
                onChange={() => setDomain(domainOption)}
              />
              <span>{domainOption}</span>
            </label>
          ))}
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
            Keyword filter
          </label>
          <input
            id="msc"
            className="text-input"
            placeholder="e.g., Q1, AI, impact"
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
  )
}

export default Sidebar
