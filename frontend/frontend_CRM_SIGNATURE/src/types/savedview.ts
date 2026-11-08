export interface SavedView {
  id: string;
  name: string;
  entity: string;
  config: Record<string, unknown>;
  createdAt: string;
}