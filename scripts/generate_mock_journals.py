import argparse
import json
import random
from pathlib import Path

DOMAINS = ["AI", "Physics", "Mathematics", "NLP", "Data Science"]
QUARTILES = ["Q1", "Q2", "Q3", "Q4"]


def build_journals(count: int) -> list[dict]:
    journals = []

    for i in range(count):
        journals.append(
            {
                "id": f"journal_{i + 1:03}",
                "name": f"Journal {i + 1}",
                "domain": [random.choice(DOMAINS)],
                "openAccess": random.choice([True, False]),
                "impactFactor": round(random.uniform(1.0, 25.0), 2),
                "quartile": random.choice(QUARTILES),
                "acceptanceRate": round(random.uniform(0.05, 0.5), 2),
                "reviewTime_weeks": random.randint(4, 30),
                "score": round(random.uniform(0.6, 0.98), 2),
            }
        )

    return journals


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate a mock journals dataset for the journal recommendation app."
    )
    parser.add_argument(
        "--count",
        type=int,
        default=150,
        help="Number of journals to generate.",
    )
    parser.add_argument(
        "--seed",
        type=int,
        default=42,
        help="Random seed for reproducible output.",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("src/data/journals.json"),
        help="Output JSON path.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    random.seed(args.seed)

    journals = build_journals(args.count)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(journals, indent=2) + "\n", encoding="utf-8")

    print(f"Wrote {len(journals)} journals to {args.output}")


if __name__ == "__main__":
    main()
