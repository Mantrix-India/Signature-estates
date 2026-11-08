export interface AiSearchFilters {
  bedrooms: number | null;
  min_price: number | null;
  max_price: number | null;
  city: string | null;
  property_type: string | null;
}

export interface AiSearchResultItem {
  id: string;
  title: string;
  propertyType: string;
  status: string;
  price: number;
  areaSqft: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  address: string;
  city: string;
  state: string;
}

export interface AiSearchResponse {
  filters_used: AiSearchFilters;
  ai_parsed: boolean;
  results: AiSearchResultItem[];
}

export interface AiSummaryResponse {
  summary: string;
  pros: string[];
  cons: string[];
  investment_score: number | null;
  investment_note: string | null;
  cached: boolean;
  generated_at: string;
}