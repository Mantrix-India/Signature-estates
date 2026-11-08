import json
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException
from groq import GroqError

from app.db import get_cursor
from app.groq_client import ask_json, MODEL
from app.schemas import SummaryResponse

router = APIRouter(prefix="/ai", tags=["ai"])

SUMMARY_SYSTEM_PROMPT = """You are a real estate analyst. Given property details as JSON,
respond ONLY with a JSON object with these exact keys:
- summary: a 2-3 sentence overview of the property
- pros: array of 3-5 short strings, key selling points
- cons: array of 2-4 short strings, honest drawbacks or considerations
- investment_score: integer 1-10 (10 = excellent investment)
- investment_note: 1-2 sentence rationale for the score

Be honest and specific, not generic. Base it only on the data given.
"""


def _fetch_property(property_id: str) -> dict | None:
    with get_cursor() as cur:
        cur.execute(
            """
            SELECT "id", "title", "description", "propertyType", "price", "areaSqft",
                   "bedrooms", "bathrooms", "city", "state", "amenities",
                   "estimatedRentalMonthly", "maintenanceMonthly",
                   "annualAppreciationPercent", "updatedAt"
            FROM "properties"
            WHERE "id" = %s
            """,
            (property_id,),
        )
        return cur.fetchone()


def _fetch_cached_summary(property_id: str) -> dict | None:
    with get_cursor() as cur:
        cur.execute(
            """
            SELECT "summary", "pros", "cons", "investmentScore", "investmentNote", "generatedAt"
            FROM "property_ai_summaries"
            WHERE "propertyId" = %s
            """,
            (property_id,),
        )
        return cur.fetchone()


def _upsert_summary(property_id: str, data: dict) -> None:
    with get_cursor() as cur:
        cur.execute(
            """
            INSERT INTO "property_ai_summaries"
                ("id", "propertyId", "summary", "pros", "cons", "investmentScore",
                 "investmentNote", "model", "generatedAt", "createdAt", "updatedAt")
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, now(), now(), now())
            ON CONFLICT ("propertyId") DO UPDATE SET
                "summary" = EXCLUDED."summary",
                "pros" = EXCLUDED."pros",
                "cons" = EXCLUDED."cons",
                "investmentScore" = EXCLUDED."investmentScore",
                "investmentNote" = EXCLUDED."investmentNote",
                "model" = EXCLUDED."model",
                "generatedAt" = now(),
                "updatedAt" = now()
            """,
            (
                str(uuid.uuid4()),
                property_id,
                data["summary"],
                data["pros"],
                data["cons"],
                data.get("investment_score"),
                data.get("investment_note"),
                MODEL,
            ),
        )


def _as_str_list(value) -> list[str]:
    if isinstance(value, str):
        value = [value]
    if not isinstance(value, list):
        return []
    return [str(v).strip() for v in value if str(v).strip()]


def _normalise_summary(raw: dict) -> dict:
    """
    The model occasionally returns a missing key, a string instead of a list,
    or a score like "7/10". Validate BEFORE caching so a malformed reply is
    treated as a failure (falls back to the cached copy) instead of crashing
    with a KeyError or poisoning the cache.
    """
    if not isinstance(raw, dict):
        raise ValueError("model did not return a JSON object")
    summary = str(raw.get("summary") or "").strip()
    if not summary:
        raise ValueError("model response missing 'summary'")

    score = raw.get("investment_score")
    try:
        score = int(float(str(score).split("/")[0])) if score is not None else None
    except (TypeError, ValueError):
        score = None
    if score is not None:
        score = max(1, min(10, score))

    note = raw.get("investment_note")
    return {
        "summary": summary,
        "pros": _as_str_list(raw.get("pros")),
        "cons": _as_str_list(raw.get("cons")),
        "investment_score": score,
        "investment_note": str(note).strip() if note else None,
    }


@router.post("/summary/{property_id}", response_model=SummaryResponse)
def ai_summary(property_id: str):
    prop = _fetch_property(property_id)
    if prop is None:
        raise HTTPException(status_code=404, detail="property not found")

    cached = _fetch_cached_summary(property_id)
    if cached and cached["generatedAt"] >= prop["updatedAt"]:
        return SummaryResponse(
            summary=cached["summary"],
            pros=cached["pros"],
            cons=cached["cons"],
            investment_score=cached["investmentScore"],
            investment_note=cached["investmentNote"],
            cached=True,
            generated_at=cached["generatedAt"].isoformat(),
        )

    prop_json = json.dumps(prop, default=str)
    try:
        data = _normalise_summary(ask_json(SUMMARY_SYSTEM_PROMPT, prop_json))
    except (GroqError, Exception) as e:
        if cached:
            # Groq is down but we have a stale cached summary — better than nothing.
            return SummaryResponse(
                summary=cached["summary"],
                pros=cached["pros"],
                cons=cached["cons"],
                investment_score=cached["investmentScore"],
                investment_note=cached["investmentNote"],
                cached=True,
                generated_at=cached["generatedAt"].isoformat(),
            )
        raise HTTPException(status_code=503, detail=f"AI summary unavailable: {e}")

    try:
        _upsert_summary(property_id, data)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"failed to cache summary: {e}")

    return SummaryResponse(
        summary=data["summary"],
        pros=data["pros"],
        cons=data["cons"],
        investment_score=data.get("investment_score"),
        investment_note=data.get("investment_note"),
        cached=False,
        generated_at=datetime.now(timezone.utc).isoformat(),
    )