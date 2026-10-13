import { Category, Season } from '../../core/models/packing.models';

export const SEASON_LABELS: Record<Season, string> = {
  summer: 'Estate',
  winter: 'Inverno',
  'spring-autumn': 'Primavera/Autunno',
  any: 'Qualsiasi',
};

export const SEASONS = (Object.keys(SEASON_LABELS) as Season[]).map((value) => ({
  value,
  label: SEASON_LABELS[value],
}));

export const CATEGORY_LABELS: Record<Category, string> = {
  clothes: 'Abbigliamento',
  toiletries: 'Igiene personale',
  documents: 'Documenti',
  electronics: 'Elettronica',
  health: 'Salute',
  misc: 'Varie',
};

export const CATEGORY_ORDER: Category[] = [
  'documents',
  'clothes',
  'toiletries',
  'electronics',
  'health',
  'misc',
];

export const CATEGORIES = CATEGORY_ORDER.map((value) => ({
  value,
  label: CATEGORY_LABELS[value],
}));
