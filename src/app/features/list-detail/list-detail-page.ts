import { Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Category } from '../../core/models/packing.models';
import { ListsService } from '../../core/services/lists.service';
import {
  CATEGORIES,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  SEASON_LABELS,
} from '../../shared/utils/labels';

@Component({
  selector: 'app-list-detail-page',
  imports: [FormsModule, RouterLink],
  template: `
    @if (list(); as l) {
      <a routerLink="/" class="mb-4 inline-flex text-sm font-medium text-brand-700">
        ← Le mie valigie
      </a>

      <header class="mb-5">
        <h1 class="wrap-break-word text-2xl font-bold tracking-tight">{{ l.name }}</h1>
        <p class="text-sm text-muted">{{ l.days }} giorni · {{ seasonLabel[l.season] }}</p>
        <div class="mt-3 flex items-center gap-3">
          <div class="h-2 flex-1 overflow-hidden rounded-full bg-line">
            <div
              class="h-full rounded-full bg-brand-500 transition-all"
              [style.width.%]="progress().pct"
            ></div>
          </div>
          <span class="text-sm font-semibold text-brand-700">
            {{ progress().done }}/{{ progress().total }}
          </span>
        </div>
      </header>

      <form
        (ngSubmit)="add(nameInput)"
        class="mb-6 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-line"
      >
        <label for="newName" class="mb-1.5 block text-sm font-semibold">
          Aggiungi un elemento
        </label>

        <div class="flex gap-2">
          <input
            #nameInput
            id="newName"
            name="newName"
            [(ngModel)]="newName"
            placeholder="es. Caricatore, occhiali da sole…"
            autocomplete="off"
            enterkeyhint="done"
            class="min-w-0 flex-1 rounded-xl border-2 border-line bg-white px-3 py-2.5 text-base outline-none placeholder:text-muted/70 focus:border-brand-700"
          />
          <button
            type="submit"
            [disabled]="!newName().trim()"
            class="flex shrink-0 items-center gap-1.5 rounded-xl bg-brand-700 px-4 py-2.5 font-semibold text-white transition active:bg-brand-800 disabled:opacity-40"
          >
            <span class="text-lg leading-none">+</span>
            Aggiungi
          </button>
        </div>

        <span class="mb-1.5 mt-4 block text-sm font-semibold">Categoria</span>
        <div class="flex flex-wrap gap-2">
          @for (c of categories; track c.value) {
            <button
              type="button"
              (click)="newCategory.set(c.value)"
              class="chip"
              [class.chip-active]="newCategory() === c.value"
            >
              {{ c.label }}
            </button>
          }
        </div>
      </form>

      @for (g of groups(); track g.cat) {
        <section class="mb-5">
          <h2 class="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
            {{ g.label }}
          </h2>
          <ul class="space-y-2">
            @for (item of g.items; track item.id) {
              <li class="flex items-center rounded-xl bg-white shadow-sm ring-1 ring-line">
                <button
                  type="button"
                  (click)="toggle(item.id)"
                  class="flex min-w-0 flex-1 items-center gap-3 px-3 py-3 text-left"
                  [attr.aria-pressed]="item.checked"
                >
                  <span
                    class="flex size-6 shrink-0 items-center justify-center rounded-full border-2 text-sm transition"
                    [class]="
                      item.checked ? 'border-brand-500 bg-brand-500 text-white' : 'border-muted'
                    "
                  >
                    @if (item.checked) {
                      ✓
                    }
                  </span>
                  <span
                    class="wrap-break-word"
                    [class]="item.checked ? 'text-muted line-through' : ''"
                  >
                    {{ item.name }}
                  </span>
                </button>
                <button
                  type="button"
                  (click)="remove(item.id)"
                  class="px-3 py-3 text-muted hover:text-red-500"
                  [attr.aria-label]="'Rimuovi ' + item.name"
                >
                  ✕
                </button>
              </li>
            }
          </ul>
        </section>
      } @empty {
        <p class="py-10 text-center text-muted">La lista è vuota. Aggiungi il primo elemento!</p>
      }

      <div class="mt-8 flex gap-3 text-sm">
        <button
          type="button"
          (click)="reset()"
          class="flex-1 rounded-xl bg-white py-3 font-medium ring-1 ring-line"
        >
          Azzera spunte
        </button>
        <button
          type="button"
          (click)="deleteList()"
          class="flex-1 rounded-xl bg-white py-3 font-medium text-red-600 ring-1 ring-line"
        >
          Elimina lista
        </button>
      </div>
    } @else {
      <div class="py-16 text-center">
        <p class="mb-3 text-muted">Lista non trovata.</p>
        <a routerLink="/" class="font-medium text-brand-700">Torna alla home</a>
      </div>
    }
  `,
})
export default class ListDetailPage {
  /** Arriva dalla route `list/:id` grazie a withComponentInputBinding */
  readonly id = input.required<string>();

  private readonly svc = inject(ListsService);
  private readonly router = inject(Router);

  readonly seasonLabel = SEASON_LABELS;
  readonly categories = CATEGORIES;

  readonly newName = signal('');
  readonly newCategory = signal<Category>('misc');

  readonly list = computed(() => this.svc.lists().find((l) => l.id === this.id()));

  readonly progress = computed(() => {
    const l = this.list();
    return l ? this.svc.progress(l) : { done: 0, total: 0, pct: 0 };
  });

  readonly groups = computed(() => {
    const l = this.list();
    if (!l) return [];
    return CATEGORY_ORDER.map((cat) => ({
      cat,
      label: CATEGORY_LABELS[cat],
      items: l.items.filter((i) => i.category === cat),
    })).filter((g) => g.items.length > 0);
  });

  add(input: HTMLInputElement): void {
    const name = this.newName().trim();
    if (!name) return;
    this.svc.addItem(this.id(), name, this.newCategory());
    this.newName.set('');
    input.focus();
  }

  toggle(itemId: string): void {
    this.svc.toggleItem(this.id(), itemId);
  }

  remove(itemId: string): void {
    this.svc.removeItem(this.id(), itemId);
  }

  reset(): void {
    this.svc.resetChecks(this.id());
  }

  deleteList(): void {
    if (confirm('Vuoi davvero eliminare questa lista?')) {
      this.svc.deleteList(this.id());
      this.router.navigate(['/']);
    }
  }
}
