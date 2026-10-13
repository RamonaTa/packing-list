import { Category, PackingItem, Season } from '../core/models/packing.models';

export interface PackingTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  days: number;
  season: Season;
  items: ReadonlyArray<{ name: string; category: Category; quantity?: number }>;
}

export interface CatalogSuggestion {
  name: string;
  category: Category;
  seasons: readonly Season[];
  minDays?: number;
  quantity?: number;
}

const ALL_SEASONS: readonly Season[] = ['summer', 'winter', 'spring-autumn', 'any'];

export const PACKING_TEMPLATES: readonly PackingTemplate[] = [
  {
    id: 'empty',
    name: 'Lista vuota',
    description: 'Parti da zero e aggiungi quello che ti serve',
    icon: '＋',
    days: 3,
    season: 'any',
    items: [],
  },
  {
    id: 'weekend',
    name: 'Weekend',
    description: 'L’essenziale per una fuga di pochi giorni',
    icon: '🧳',
    days: 3,
    season: 'spring-autumn',
    items: [
      { name: 'Carta d’identità', category: 'documents' },
      { name: 'Portafoglio', category: 'documents' },
      { name: 'Magliette', category: 'clothes', quantity: 3 },
      { name: 'Pantaloni', category: 'clothes', quantity: 2 },
      { name: 'Intimo', category: 'clothes', quantity: 3 },
      { name: 'Calze', category: 'clothes', quantity: 3 },
      { name: 'Pigiama', category: 'clothes' },
      { name: 'Spazzolino', category: 'toiletries' },
      { name: 'Caricabatterie', category: 'electronics' },
    ],
  },
  {
    id: 'beach',
    name: 'Mare',
    description: 'Costumi, sole e tutto il necessario per la spiaggia',
    icon: '☀️',
    days: 7,
    season: 'summer',
    items: [
      { name: 'Carta d’identità', category: 'documents' },
      { name: 'Prenotazioni', category: 'documents' },
      { name: 'Magliette', category: 'clothes', quantity: 5 },
      { name: 'Costumi', category: 'clothes', quantity: 3 },
      { name: 'Pantaloncini', category: 'clothes', quantity: 3 },
      { name: 'Sandali', category: 'clothes' },
      { name: 'Cappello', category: 'clothes' },
      { name: 'Crema solare', category: 'health' },
      { name: 'Occhiali da sole', category: 'misc' },
      { name: 'Telo mare', category: 'misc' },
    ],
  },
  {
    id: 'city',
    name: 'Città d’arte',
    description: 'Un bagaglio leggero per esplorare la città',
    icon: '🏛️',
    days: 4,
    season: 'spring-autumn',
    items: [
      { name: 'Carta d’identità', category: 'documents' },
      { name: 'Biglietti e prenotazioni', category: 'documents' },
      { name: 'Magliette', category: 'clothes', quantity: 4 },
      { name: 'Pantaloni comodi', category: 'clothes', quantity: 2 },
      { name: 'Scarpe comode', category: 'clothes' },
      { name: 'Giacca leggera', category: 'clothes' },
      { name: 'Spazzolino', category: 'toiletries' },
      { name: 'Power bank', category: 'electronics' },
    ],
  },
  {
    id: 'mountain',
    name: 'Montagna',
    description: 'Strati caldi e accessori per l’aria aperta',
    icon: '🏔️',
    days: 5,
    season: 'winter',
    items: [
      { name: 'Carta d’identità', category: 'documents' },
      { name: 'Maglie termiche', category: 'clothes', quantity: 3 },
      { name: 'Maglioni caldi', category: 'clothes', quantity: 2 },
      { name: 'Pantaloni da trekking', category: 'clothes', quantity: 2 },
      { name: 'Scarponi', category: 'clothes' },
      { name: 'Guanti e berretto', category: 'clothes' },
      { name: 'Crema solare', category: 'health' },
      { name: 'Borraccia', category: 'misc' },
    ],
  },
];

export const PACKING_SUGGESTIONS: readonly CatalogSuggestion[] = [
  { name: 'Carta d’identità', category: 'documents', seasons: ALL_SEASONS },
  { name: 'Tessera sanitaria', category: 'documents', seasons: ALL_SEASONS },
  { name: 'Biglietti e prenotazioni', category: 'documents', seasons: ALL_SEASONS },
  { name: 'Portafoglio', category: 'documents', seasons: ALL_SEASONS },
  { name: 'Magliette', category: 'clothes', seasons: ALL_SEASONS, quantity: 3 },
  { name: 'Intimo', category: 'clothes', seasons: ALL_SEASONS, quantity: 3 },
  { name: 'Calze', category: 'clothes', seasons: ALL_SEASONS, quantity: 3 },
  { name: 'Pigiama', category: 'clothes', seasons: ALL_SEASONS },
  {
    name: 'Costume',
    category: 'clothes',
    seasons: ['summer'],
  },
  {
    name: 'Sandali',
    category: 'clothes',
    seasons: ['summer'],
  },
  {
    name: 'Cappello',
    category: 'clothes',
    seasons: ['summer'],
  },
  {
    name: 'Giacca impermeabile',
    category: 'clothes',
    seasons: ['winter', 'spring-autumn'],
  },
  {
    name: 'Maglia calda',
    category: 'clothes',
    seasons: ['winter'],
  },
  {
    name: 'Spazzolino',
    category: 'toiletries',
    seasons: ALL_SEASONS,
  },
  {
    name: 'Dentifricio',
    category: 'toiletries',
    seasons: ALL_SEASONS,
  },
  {
    name: 'Shampoo',
    category: 'toiletries',
    seasons: ALL_SEASONS,
  },
  {
    name: 'Crema solare',
    category: 'health',
    seasons: ['summer'],
  },
  {
    name: 'Farmaci personali',
    category: 'health',
    seasons: ALL_SEASONS,
  },
  {
    name: 'Cerotti',
    category: 'health',
    seasons: ALL_SEASONS,
  },
  {
    name: 'Caricabatterie',
    category: 'electronics',
    seasons: ALL_SEASONS,
  },
  {
    name: 'Power bank',
    category: 'electronics',
    seasons: ALL_SEASONS,
  },
  {
    name: 'Occhiali da sole',
    category: 'misc',
    seasons: ['summer', 'spring-autumn'],
  },
  {
    name: 'Borraccia',
    category: 'misc',
    seasons: ALL_SEASONS,
  },
  {
    name: 'Telo mare',
    category: 'misc',
    seasons: ['summer'],
  },
];

export function templateItems(template: PackingTemplate): Omit<PackingItem, 'id' | 'checked'>[] {
  return template.items.map((item) => ({ ...item }));
}

export function suggestionsFor(
  season: Season,
  days: number,
  existing: readonly { name: string; category: Category }[] = [],
): CatalogSuggestion[] {
  const existingKeys = new Set(
    existing.map((item) => `${item.category}:${item.name.trim().toLocaleLowerCase()}`),
  );

  return PACKING_SUGGESTIONS.filter(
    (item) =>
      item.seasons.includes(season) &&
      (!item.minDays || days >= item.minDays) &&
      !existingKeys.has(`${item.category}:${item.name.toLocaleLowerCase()}`),
  ).map((item) => ({ ...item }));
}

export function assistantItems(
  season: Season,
  days: number,
  previousItems: readonly PackingItem[],
): Omit<PackingItem, 'id' | 'checked'>[] {
  const byName = new Map<string, Omit<PackingItem, 'id' | 'checked'>>();
  const nameKey = (name: string, category: Category) =>
    `${category}:${name.trim().toLocaleLowerCase()}`;

  for (const item of previousItems) {
    const key = nameKey(item.name, item.category);
    const current = byName.get(key);
    const quantity = Math.max(current?.quantity ?? 0, item.quantity ?? 0);
    byName.set(key, {
      name: item.name,
      category: item.category,
      ...(quantity > 0 ? { quantity } : {}),
    });
  }

  for (const suggestion of suggestionsFor(season, days)) {
    const key = nameKey(suggestion.name, suggestion.category);
    if (!byName.has(key)) {
      byName.set(key, {
        name: suggestion.name,
        category: suggestion.category,
        ...(suggestion.quantity ? { quantity: Math.min(suggestion.quantity, days) } : {}),
      });
    }
  }

  return [...byName.values()];
}
