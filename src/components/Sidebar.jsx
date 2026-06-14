function Sidebar({ domains, domain, setDomain }) {
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
        </div>

      </div>
    </aside>
  )
}

export default Sidebar
