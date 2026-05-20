import re

STOP_WORDS = {
    "a",
    "an",
    "and",
    "are",
    "as",
    "at",
    "be",
    "by",
    "for",
    "from",
    "in",
    "is",
    "it",
    "of",
    "on",
    "or",
    "that",
    "the",
    "to",
    "with",
}

FILTER_DOMAINS = ["Mathematics", "Physics"]


def journal_number_from_id(journal_id: str) -> int:
    return int(journal_id.replace("journal_", ""))


def build_issns(journal_number: int) -> list[str]:
    first = 1000 + (journal_number % 9000)
    second = 4000 + ((journal_number * 7) % 5000)
    third = 2000 + ((journal_number * 3) % 7000)
    fourth = 3000 + ((journal_number * 11) % 6000)
    return [f"{first}-{second}", f"{third}-{fourth}"]


def tokenize(text: str) -> list[str]:
    tokens = re.findall(r"[a-z0-9]+", text.lower())
    return [token for token in tokens if len(token) > 2 and token not in STOP_WORDS]


def normalize_journal(raw_journal: dict) -> dict:
    journal_number = journal_number_from_id(raw_journal["id"])
    primary_domain = raw_journal["domain"][0]
    open_access_label = "Open access" if raw_journal["openAccess"] else "Hybrid access"
    acceptance_rate_percent = f"{round(raw_journal['acceptanceRate'] * 100)}%"

    return {
        **raw_journal,
        "domain": primary_domain,
        "doi": f"10.1000/{raw_journal['id']}",
        "tags": [primary_domain, raw_journal["quartile"], open_access_label],
        "description": (
            f"{primary_domain} venue with {raw_journal['quartile']} standing, "
            f"impact factor {raw_journal['impactFactor']}, and {acceptance_rate_percent} acceptance rate."
        ),
        "publisher": f"{primary_domain} Research Press",
        "issns": build_issns(journal_number),
        "averagePublicationTime": f"{raw_journal['reviewTime_weeks']} weeks",
        "languages": ["English"],
        "authorRetainsRights": raw_journal["openAccess"],
        "articleReceivesDoi": True,
        "peerReviewMethod": (
            "Single-blind peer review"
            if raw_journal["reviewTime_weeks"] <= 12
            else "Anonymous peer review"
        ),
        "license": "CC BY" if raw_journal["openAccess"] else "Subscription / hybrid",
        "maxApc": f"${1200 + (journal_number % 6) * 300}" if raw_journal["openAccess"] else "None listed",
        "planSCompliance": raw_journal["openAccess"],
        "doajSince": (
            f"{(journal_number % 12) + 1}/{(journal_number % 27) + 1}/20{19 + (journal_number % 6)}"
            if raw_journal["openAccess"]
            else "Not listed"
        ),
        "website": f"https://example.org/journals/{raw_journal['id']}",
        "authorInstructions": f"https://example.org/journals/{raw_journal['id']}/authors",
        "aimsAndScope": f"https://example.org/journals/{raw_journal['id']}/aims",
        "editorialBoard": f"https://example.org/journals/{raw_journal['id']}/editorial-board",
        "subjects": [primary_domain, raw_journal["quartile"], f"{raw_journal['reviewTime_weeks']}-week review cycle"],
        "keywords": [
            f"{primary_domain.lower()} research",
            f"impact factor {raw_journal['impactFactor']}",
            f"{acceptance_rate_percent} acceptance",
            raw_journal["quartile"],
        ],
    }
