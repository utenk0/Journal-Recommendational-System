from fastapi_backend.connectors.mock_journal_connector import load_recommendation_payload


def get_journals(
    *,
    title: str = "",
    abstract_text: str = "",
    references: str = "",
    domain: str = "all",
    open_access_only: bool = False,
    keyword: str = "",
    sort_by: str = "match",
) -> dict:
    payload = load_recommendation_payload()
    if title.strip():
        payload["query"]["title"] = title.strip()
    if abstract_text.strip():
        payload["query"]["abstract"] = abstract_text.strip()

    payload["recommendations"] = sorted(
        payload["recommendations"],
        key=lambda recommendation: recommendation["rank"],
    )[:10]
    return payload


def get_journal_by_id(journal_id: str) -> dict | None:
    payload = load_recommendation_payload()
    return next(
        (
            recommendation
            for recommendation in payload["recommendations"]
            if recommendation["journal_name"] == journal_id
        ),
        None,
    )
