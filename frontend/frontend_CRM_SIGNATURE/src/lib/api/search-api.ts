import { api } from '../axios';
import { SearchResults } from '@/types/search';

export async function globalSearchRequest(q: string, limit = 5): Promise<SearchResults> {
  const { data } = await api.get('/search', { params: { q, limit } });
  return data.data;
}