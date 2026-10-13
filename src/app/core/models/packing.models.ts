export type Season = 'summer' | 'winter' | 'spring-autumn' | 'any';

export type Category = 'clothes' | 'toiletries' | 'documents' | 'electronics' | 'health' | 'misc';

export interface PackingItem {
  id: string;
  name: string;
  category: Category;
  checked: boolean;
  quantity?: number;
}

export interface PackingList {
  id: string;
  name: string;
  days: number;
  season: Season;
  items: PackingItem[];
  createdAt: string;
}

export interface SuggestedItem {
  name: string;
  category: Category;
  seasons: Season[];
  minDays?: number;
}
