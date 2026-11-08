from fastapi import APIRouter, HTTPException
from groq import GroqError

from app.db import get_cursor
from app.groq_client import ask_json
from app.schemas import SearchFilters, SearchRequest, SearchResponse

router = APIRouter(prefix="/ai", tags=["ai"])

VALID_PROPERTY_TYPES = {"APARTMENT", "VILLA", "PLOT", "COMMERCIAL", "OTHER"}

EXTRACTION_SYSTEM_PROMPT = """You extract structured search filters from a real estate query in India.

Respond ONLY with a JSON object, no other text, with these exact keys:
- bedrooms: integer or null (e.g. "3 BHK" -> 3)
- min_price: number or null, in Indian Rupees (absolute value, not lakhs/crores)
- max_price: number or null, in Indian Rupees (absolute value, not lakhs/crores)
- city: string or null (just the city name)
- property_type: one of "APARTMENT", "VILLA", "PLOT", "COMMERCIAL", "OTHER", or null

Conversion rules:
- 1 lakh = 100000 rupees
- 1 crore = 10000000 rupees
- "under X" or "below X" means max_price = X
- "above X" or "over X" means min_price = X
- If a field isn't mentioned, use null. Do not guess.
"""


def _extract_filters(query: str) -> tuple[SearchFilters, bool]:
    """Returns (filters, ai_parsed). Falls back to empty filters if Groq fails."""
    try:
        raw = ask_json(EXTRACTION_SYSTEM_PROMPT, query)
        property_type = raw.get("property_type")
        if property_type not in VALID_PROPERTY_TYPES:
            property_type = None
        if not isinstance(raw, dict):
            raise ValueError("model did not return a JSON object")
        filters = SearchFilters(
            bedrooms=raw.get("bedrooms"),
            min_price=raw.get("min_price"),
            max_price=raw.get("max_price"),
            city=raw.get("city"),
            property_type=property_type,
        )
        return filters, True
    except (GroqError, Exception):
        # Fail gracefully: no filters extracted, caller still returns
        # unfiltered AVAILABLE properties rather than erroring out.
        return SearchFilters(), False


def _run_query(filters: SearchFilters) -> list[dict]:
    conditions = ['status = %s::"PropertyStatus"']
    params: list = ["AVAILABLE"]

    if filters.bedrooms is not None:
        conditions.append('"bedrooms" = %s')
        params.append(filters.bedrooms)
    if filters.min_price is not None:
        conditions.append('"price" >= %s')
        params.append(filters.min_price)
    if filters.max_price is not None:
        conditions.append('"price" <= %s')
        params.append(filters.max_price)
    if filters.city:
        conditions.append('"city" ILIKE %s')
        params.append(f"%{filters.city}%")
    if filters.property_type:
        conditions.append('"propertyType" = %s::"PropertyType"')
        params.append(filters.property_type)

    where_clause = " AND ".join(conditions)
    sql = f"""
        SELECT "id", "title", "propertyType", "status", "price", "areaSqft",
               "bedrooms", "bathrooms", "address", "city", "state"
        FROM "properties"
        WHERE {where_clause}
        ORDER BY "price" ASC
        LIMIT 50
    """

    with get_cursor() as cur:
        cur.execute(sql, params)
        return cur.fetchall()


@router.post("/search", response_model=SearchResponse)
def ai_search(payload: SearchRequest):
    if not payload.query.strip():
        raise HTTPException(status_code=400, detail="query is required")

    filters, ai_parsed = _extract_filters(payload.query)

    try:
        results = _run_query(filters)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"database query failed: {e}")

    return SearchResponse(filters_used=filters, ai_parsed=ai_parsed, results=results)