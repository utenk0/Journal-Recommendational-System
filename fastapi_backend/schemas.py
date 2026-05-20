from typing import Any

from pydantic import BaseModel


class JournalListResponse(BaseModel):
    items: list[dict[str, Any]]
    total: int
