from fastapi_backend.connectors.mock_journal_connector import load_journals
from fastapi_backend.normalizer import tokenize


def compute_relevance(journal: dict, query_tokens: list[str], domain: str, open_access_only: bool) -> float:
    unique_query_tokens = set(query_tokens)
    journal_tokens = tokenize(
        " ".join(
            [
                journal["name"],
                journal["domain"],
                journal["description"],
                journal["quartile"],
                " ".join(journal["tags"]),
                " ".join(journal["keywords"]),
            ]
        )
    )
    tag_tokens = tokenize(f"{' '.join(journal['tags'])} {' '.join(journal['keywords'])}")

    text_matches = sum(1 for token in journal_tokens if token in unique_query_tokens)
    tag_matches = sum(1 for token in tag_tokens if token in unique_query_tokens)

    text_coverage = text_matches / len(journal_tokens) if journal_tokens else 0
    tag_coverage = tag_matches / len(tag_tokens) if tag_tokens else 0
    domain_boost = 0.12 if domain != "all" and journal["domain"] == domain else 0
    oa_boost = 0.06 if open_access_only and journal["openAccess"] else 0

    return min(1, text_coverage * 0.5 + tag_coverage * 0.32 + domain_boost + oa_boost)


def keyword_match(journal: dict, keyword: str) -> bool:
    if not keyword:
        return True

    haystack = " ".join(
        [
            journal["domain"],
            journal["quartile"],
            journal["description"],
            *journal["tags"],
            *journal["keywords"],
        ]
    ).lower()
    return keyword in haystack


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
    journals = load_journals()
    query_tokens = tokenize(f"{title} {abstract_text} {references}")
    cleaned_keyword = keyword.strip().lower()

    filtered = []
    for journal in journals:
        if domain != "all" and journal["domain"] != domain:
            continue
        if open_access_only and not journal["openAccess"]:
            continue
        if not keyword_match(journal, cleaned_keyword):
            continue

        filtered.append(
            {
                **journal,
                "relevance": compute_relevance(journal, query_tokens, domain, open_access_only),
            }
        )

    if sort_by == "match":
        items = sorted(filtered, key=lambda journal: journal["score"], reverse=True)
    else:
        items = sorted(filtered, key=lambda journal: journal["relevance"], reverse=True)

    return {
        "items": items,
        "total": len(items),
    }


def get_journal_by_id(journal_id: str) -> dict | None:
    journals = load_journals()
    return next((journal for journal in journals if journal["id"] == journal_id), None)
