export interface SearchClient {
  id: string;
  fullName: string;
  phone: string;
  status: string;
  link: string;
}
export interface SearchLead {
  id: string;
  stage: string;
  client: { id: string; fullName: string };
  link: string;
}
export interface SearchProperty {
  id: string;
  title: string;
  city: string;
  price: number;
  status: string;
  link: string;
}
export interface SearchResults {
  clients: SearchClient[];
  leads: SearchLead[];
  properties: SearchProperty[];
}