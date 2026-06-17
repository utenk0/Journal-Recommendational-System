function ManuscriptForm({
  title,
  setTitle,
  abstractText,
  setAbstractText,
  onSubmitSearch,
  onClear,
}) {
  return (
    <section className="panel hero">
      <div className="panel-header">
        <div>
          <h1>Manuscript-Based Search</h1>
          <p>
            Paste your manuscript details below for AI-powered journal
            recommendations.
          </p>
        </div>
      </div>

      <form
        className="form-grid"
        onSubmit={(event) => {
          event.preventDefault()
          onSubmitSearch()
        }}
      >
        <label className="field">
          <span>Title</span>
          <input
            className="text-input dark"
            placeholder="Paste your title here..."
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
        <div className="form-actions">
          <button className="primary-button" type="submit">
            Find Journals
          </button>
          <button className="ghost-button" type="button" onClick={onClear}>
            Clear form
          </button>
        </div>
      </form>
    </section>
  )
}

export default ManuscriptForm
