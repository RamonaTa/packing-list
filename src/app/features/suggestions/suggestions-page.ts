import { Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Category } from '../../core/models/packing.models';
import { ListsService } from '../../core/services/lists.service';
import { suggestionsFor } from '../../data/packing-catalog';
import { CATEGORY_LABELS, CATEGORY_ORDER, SEASON_LABELS } from '../../shared/utils/labels';

type SuggestionFilter = Category | 'all';

@Component({
  selector: 'app-suggestions-page',
  imports: [RouterLink],
  template: `
    @if (list(); as currentList) {
      <section class="screen">
        <a [routerLink]="['/list', currentList.id]" class="back-link">
          <span aria-hidden="true">←</span> {{ currentList.name }}
        </a>

        <header class="screen-header">
          <p class="screen-kicker">
            {{ SEASON_LABELS[currentList.season] }} · {{ currentList.days }} giorni
          </p>
          <h1 class="screen-title">Suggerimenti</h1>
          <p class="screen-subtitle">Idee utili per non lasciare a casa le cose importanti.</p>
        </header>

        <div class="suggestion-banner">
          <span class="suggestion-banner-icon" aria-hidden="true">✦</span>
          <span>
            <strong>{{ suggestions().length }} cose potrebbero servirti</strong>
            <small>Consigli basati sulla stagione e sulla durata</small>
          </span>
        </div>

        <div class="category-strip" aria-label="Filtra suggerimenti">
          <button
            type="button"
            class="tab-button"
            [class.tab-button-active]="filter() === 'all'"
            (click)="filter.set('all')"
          >
            Tutti
          </button>
          @for (category of categories; track category) {
            <button
              type="button"
              class="tab-button"
              [class.tab-button-active]="filter() === category"
              (click)="filter.set(category)"
            >
              {{ CATEGORY_LABELS[category] }}
            </button>
          }
        </div>

        @for (group of groups(); track group.category) {
          <section class="panel suggestion-group">
            <div class="suggestion-group-heading">
              <h2>{{ group.label }}</h2>
              <button type="button" class="text-link" (click)="addAll(group.category)">
                Aggiungi tutti
              </button>
            </div>
            @for (item of group.items; track item.name) {
              <div class="suggestion-row">
                <span class="suggestion-emoji" aria-hidden="true">
                  {{ categoryIcon[group.category] }}
                </span>
                <span class="suggestion-copy">
                  <strong>{{ item.name }}</strong>
                  <small>Un buon compagno di viaggio</small>
                </span>
                @if (item.quantity) {
                  <span class="item-quantity">×{{ item.quantity }}</span>
                }
                <button
                  type="button"
                  class="suggestion-add"
                  (click)="add(item.name, group.category, item.quantity)"
                  [attr.aria-label]="'Aggiungi ' + item.name"
                >
                  +
                </button>
              </div>
            }
          </section>
        } @empty {
          <section class="card empty-state">
            <div class="empty-illustration" aria-hidden="true">✓</div>
            <h2>Hai già tutto!</h2>
            <p>Non ci sono altri suggerimenti per questa categoria.</p>
            <a [routerLink]="['/list', currentList.id]" class="text-link">Torna alla valigia →</a>
          </section>
        }

        <a [routerLink]="['/list', currentList.id]" class="primary-button full-width">
          Fatto <span aria-hidden="true">→</span>
        </a>
      </section>
    } @else {
      <section class="card empty-state">
        <h2>Valigia non trovata</h2>
        <a routerLink="/" class="text-link">Torna alle tue valigie</a>
      </section>
    }
  `,
  styles: `
    .suggestion-banner {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px;
      border: 1px solid #c0ded7;
      border-radius: 15px;
      background: linear-gradient(110deg, #e1f3ed, #f4f3e7);
    }

    .suggestion-banner-icon,
    .suggestion-emoji {
      display: grid;
      width: 39px;
      height: 39px;
      flex: 0 0 auto;
      place-items: center;
      border-radius: 13px;
      background: rgb(255 255 255 / 75%);
      font-size: 19px;
    }

    .suggestion-banner > span:last-child {
      display: grid;
      gap: 2px;
    }

    .suggestion-banner strong {
      font-size: 13px;
    }

    .suggestion-banner small {
      color: var(--muted);
      font-size: 11px;
    }

    .suggestion-group {
      padding: 8px 13px;
    }

    .suggestion-group-heading {
      display: flex;
      min-height: 42px;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      border-bottom: 1px solid #eeeae1;
    }

    .suggestion-group-heading h2 {
      margin: 0;
      color: var(--muted);
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .suggestion-emoji {
      width: 34px;
      height: 34px;
      background: #f4eee3;
      font-size: 17px;
    }
  `,
})
export default class SuggestionsPage {
  readonly id = input.required<string>();

  private readonly listsService = inject(ListsService);

  readonly SEASON_LABELS = SEASON_LABELS;
  readonly CATEGORY_LABELS = CATEGORY_LABELS;
  readonly categories = CATEGORY_ORDER;
  readonly filter = signal<SuggestionFilter>('all');
  readonly categoryIcon: Record<Category, string> = {
    documents: '🪪',
    clothes: '👕',
    toiletries: '🧴',
    electronics: '🔌',
    health: '🩹',
    misc: '🎒',
  };

  readonly list = computed(() => this.listsService.lists().find((entry) => entry.id === this.id()));
  readonly suggestions = computed(() => {
    const current = this.list();
    return current
      ? suggestionsFor(current.season, current.days, current.items).filter(
          (suggestion) => this.filter() === 'all' || suggestion.category === this.filter(),
        )
      : [];
  });
  readonly groups = computed(() =>
    CATEGORY_ORDER.map((category) => ({
      category,
      label: CATEGORY_LABELS[category],
      items: this.suggestions().filter((suggestion) => suggestion.category === category),
    })).filter((group) => group.items.length > 0),
  );

  add(name: string, category: Category, quantity?: number): void {
    this.listsService.addItem(this.id(), name, category, quantity);
  }

  addAll(category: Category): void {
    for (const suggestion of this.suggestions().filter((item) => item.category === category)) {
      this.add(suggestion.name, suggestion.category, suggestion.quantity);
    }
  }
}
