import { Injectable, computed, effect, signal } from '@angular/core';
import { newId } from '../../shared/utils/id';
import { PackingList, Season, PackingItem, Category } from '../models/packing.models';

const STORAGE_KEY = 'packing-lists-v1';

@Injectable({ providedIn: 'root' })
export class ListsService {
  private readonly _lists = signal<PackingList[]>(this.load());

  /** Tutte le liste, in sola lettura. */
  readonly lists = this._lists.asReadonly();

  constructor() {
    // Salva automaticamente ogni volta che le liste cambiano
    effect(() => this.persist(this._lists()));
  }

  // ---------- Letture ----------

  byId(id: string) {
    return computed(() => this._lists().find((l) => l.id === id));
  }

  progress(list: PackingList): { done: number; total: number; pct: number } {
    const total = list.items.length;
    const done = list.items.filter((i: { checked: any }) => i.checked).length;
    return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
  }

  // ---------- Liste ----------

  createList(data: {
    name: string;
    days: number;
    season: Season;
    items?: Omit<PackingItem, 'id' | 'checked'>[];
  }): PackingList {
    const list: PackingList = {
      id: newId(),
      name: data.name,
      days: data.days,
      season: data.season,
      createdAt: new Date().toISOString(),
      items: (data.items ?? []).map((i) => ({
        ...i,
        id: newId(),
        checked: false,
      })),
    };
    this._lists.update((lists) => [list, ...lists]);
    return list;
  }

  deleteList(id: string): void {
    this._lists.update((lists) => lists.filter((l) => l.id !== id));
  }

  // ---------- Elementi ----------

  addItem(listId: string, name: string, category: Category = 'misc'): void {
    const item: PackingItem = { id: newId(), name: name.trim(), category, checked: false };
    if (!item.name) return;
    this.updateList(listId, (l) => ({ ...l, items: [...l.items, item] }));
  }

  toggleItem(listId: string, itemId: string): void {
    this.updateList(listId, (l) => ({
      ...l,
      items: l.items.map((i) => (i.id === itemId ? { ...i, checked: !i.checked } : i)),
    }));
  }

  removeItem(listId: string, itemId: string): void {
    this.updateList(listId, (l) => ({
      ...l,
      items: l.items.filter((i: { id: string }) => i.id !== itemId),
    }));
  }

  resetChecks(listId: string): void {
    this.updateList(listId, (l) => ({
      ...l,
      items: l.items.map((i: any) => ({ ...i, checked: false })),
    }));
  }

  // ---------- Interni ----------

  private updateList(id: string, fn: (l: PackingList) => PackingList): void {
    this._lists.update((lists) => lists.map((l) => (l.id === id ? fn(l) : l)));
  }

  private load(): PackingList[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as PackingList[]) : [];
    } catch {
      return [];
    }
  }

  private persist(lists: PackingList[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
    } catch {
      /* storage pieno o non disponibile: ignoriamo */
    }
  }

  updateListInfo(id: string, data: { name: string; days: number; season: Season }): void {
    this.updateList(id, (l) => ({ ...l, ...data }));
  }
}
