import { describe, expect, it } from 'vitest';
import { assistantItems, PACKING_TEMPLATES, suggestionsFor } from './packing-catalog';

describe('packing catalog', () => {
  it('provides useful starter items for a selected template', () => {
    const beachTemplate = PACKING_TEMPLATES.find((template) => template.id === 'beach');

    expect(beachTemplate).toBeDefined();
    expect(beachTemplate?.items.some((item) => item.name === 'Costumi')).toBe(true);
    expect(beachTemplate?.season).toBe('summer');
  });

  it('filters seasonal suggestions and excludes items already in the list', () => {
    const suggestions = suggestionsFor('summer', 7, [
      { name: 'Carta d’identità', category: 'documents' },
    ]);

    expect(suggestions.some((item) => item.name === 'Costume')).toBe(true);
    expect(suggestions.some((item) => item.name === 'Maglia calda')).toBe(false);
    expect(suggestions.some((item) => item.name === 'Carta d’identità')).toBe(false);
  });

  it('builds an assistant list from previous items and useful suggestions without duplicates', () => {
    const items = assistantItems('summer', 5, [
      { id: '1', name: 'Spazzolino', category: 'toiletries', checked: true },
      { id: '2', name: 'Magliette', category: 'clothes', checked: false, quantity: 4 },
    ]);

    expect(items.filter((item) => item.name === 'Spazzolino')).toHaveLength(1);
    expect(items.find((item) => item.name === 'Spazzolino')?.quantity).toBeUndefined();
    expect(items.find((item) => item.name === 'Magliette')?.quantity).toBe(4);
    expect(items.some((item) => item.name === 'Crema solare')).toBe(true);
  });
});
