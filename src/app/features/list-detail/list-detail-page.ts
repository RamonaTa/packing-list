import { Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Category } from '../../core/models/packing.models';
import { ListsService } from '../../core/services/lists.service';
import { suggestionsFor } from '../../data/packing-catalog';
import {
  CATEGORIES,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  SEASON_LABELS,
} from '../../shared/utils/labels';

type DetailFilter = Category | 'all';

@Component({
  selector: 'app-list-detail-page',
  imports: [FormsModule, RouterLink],
  template: `
    @if (list(); as l) {
      <section class="screen">
        <a routerLink="/" class="back-link"><span aria-hidden="true">←</span> Le mie valigie</a>

        <header class="screen-header">
          <p class="screen-kicker">{{ seasonLabel[l.season] }} · {{ l.days }} giorni</p>
          <h1 class="screen-title">{{ l.name }}</h1>
          <div class="detail-progress">
            <div
              class="progress-track"
              role="progressbar"
              [attr.aria-valuenow]="progress().pct"
              aria-valuemin="0"
              aria-valuemax="100"
              [attr.aria-label]="'Completamento ' + l.name"
            >
              <div class="progress-fill" [style.width.%]="progress().pct"></div>
            </div>
            <span class="count-pill">{{ progress().done }}/{{ progress().total }}</span>
          </div>
        </header>

        <div class="category-strip" aria-label="Filtra per categoria">
          <button
            type="button"
            class="tab-button"
            [class.tab-button-active]="activeFilter() === 'all'"
            (click)="activeFilter.set('all')"
          >
            Tutti <span>{{ l.items.length }}</span>
          </button>
          @for (category of categories; track category.value) {
            <button
              type="button"
              class="tab-button"
              [class.tab-button-active]="activeFilter() === category.value"
              (click)="activeFilter.set(category.value)"
            >
              {{ category.label }}
            </button>
          }
          <a [routerLink]="['/list', l.id, 'suggestions']" class="tab-button suggestions-tab">
            ✦ Suggerimenti <span>{{ suggestionsCount() }}</span>
          </a>
        </div>

        <form (ngSubmit)="add(nameInput)" class="panel add-panel">
          <label class="field">
            <span class="field-label">Aggiungi un elemento</span>
            <div class="add-row">
              <input
                #nameInput
                id="newName"
                name="newName"
                [(ngModel)]="newName"
                placeholder="es. Caricatore, occhiali da sole…"
                autocomplete="off"
                enterkeyhint="done"
                class="text-input"
              />
              <button
                type="submit"
                [disabled]="!newName().trim()"
                class="primary-button add-button"
                aria-label="Aggiungi elemento"
              >
                ＋
              </button>
            </div>
          </label>

          <div class="category-select">
            @for (category of categories; track category.value) {
              <button
                type="button"
                class="category-button"
                [class.category-button-active]="newCategory() === category.value"
                (click)="newCategory.set(category.value)"
              >
                {{ category.label }}
              </button>
            }
          </div>
        </form>

        @for (group of groups(); track group.cat) {
          <section class="category-section">
            <h2 class="category-heading">
              <span>{{ group.label }}</span>
              <span>{{ group.items.length }}</span>
            </h2>
            <ul class="item-list">
              @for (item of group.items; track item.id) {
                <li class="item-row">
                  <button
                    type="button"
                    class="item-main"
                    (click)="toggle(item.id)"
                    [attr.aria-pressed]="item.checked"
                  >
                    <span class="check-circle" [class.check-circle-checked]="item.checked">
                      @if (item.checked) {
                        ✓
                      }
                    </span>
                    <span class="item-name" [class.item-name-checked]="item.checked">
                      {{ item.name }}
                    </span>
                  </button>
                  <div class="quantity-control" [attr.aria-label]="'Quantità ' + item.name">
                    <button
                      type="button"
                      (click)="changeQuantity(item.id, (item.quantity ?? 1) - 1)"
                      [disabled]="(item.quantity ?? 1) <= 1"
                      [attr.aria-label]="'Riduci quantità di ' + item.name"
                    >
                      −
                    </button>
                    <span>×{{ item.quantity ?? 1 }}</span>
                    <button
                      type="button"
                      (click)="changeQuantity(item.id, (item.quantity ?? 1) + 1)"
                      [attr.aria-label]="'Aumenta quantità di ' + item.name"
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    (click)="remove(item.id)"
                    class="item-delete"
                    [attr.aria-label]="'Rimuovi ' + item.name"
                  >
                    ×
                  </button>
                </li>
              }
            </ul>
          </section>
        } @empty {
          <section class="card empty-state">
            <div class="empty-illustration" aria-hidden="true">🧳</div>
            <h2>{{ activeFilter() === 'all' ? 'La lista è vuota' : 'Nessun elemento qui' }}</h2>
            <p>Aggiungi un elemento o dai un’occhiata ai suggerimenti per il tuo viaggio.</p>
            <a [routerLink]="['/list', l.id, 'suggestions']" class="text-link">
              Scopri i suggerimenti →
            </a>
          </section>
        }

        <div class="inline-actions">
          <button type="button" (click)="reset()" class="secondary-button">Azzera spunte</button>
          <button type="button" (click)="deleteList()" class="danger-button">Elimina lista</button>
        </div>
      </section>
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
  readonly activeFilter = signal<DetailFilter>('all');

  readonly list = computed(() => this.svc.lists().find((l) => l.id === this.id()));
  readonly suggestionsCount = computed(() => {
    const l = this.list();
    return l ? suggestionsFor(l.season, l.days, l.items).length : 0;
  });

  readonly progress = computed(() => {
    const l = this.list();
    return l ? this.svc.progress(l) : { done: 0, total: 0, pct: 0 };
  });

  readonly groups = computed(() => {
    const l = this.list();
    if (!l) return [];
    const activeFilter = this.activeFilter();
    return CATEGORY_ORDER.filter((cat) => activeFilter === 'all' || activeFilter === cat)
      .map((cat) => ({
        cat,
        label: CATEGORY_LABELS[cat],
        items: l.items.filter((i) => i.category === cat),
      }))
      .filter((group) => group.items.length > 0);
  });

  readonly suggestions = computed(() => {
    const l = this.list();
    return l ? suggestionsFor(l.season, l.days, l.items) : [];
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

  changeQuantity(itemId: string, quantity: number): void {
    this.svc.setItemQuantity(this.id(), itemId, quantity);
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
