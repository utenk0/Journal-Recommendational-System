import json
from pathlib import Path

from fastapi_backend.normalizer import normalize_journal

JOURNALS_FILE = Path(__file__).resolve().parents[2] / "src" / "data" / "journals.json"


def load_journals() -> list[dict]:
    parsed = json.loads(JOURNALS_FILE.read_text(encoding="utf-8"))
    return [normalize_journal(journal) for journal in parsed]
