import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Category, PackingItem, Season } from '../../core/models/packing.models';
import { ListsService } from '../../core/services/lists.service';
import { assistantItems } from '../../data/packing-catalog';
import { CATEGORY_LABELS, CATEGORY_ORDER, SEASON_LABELS, SEASONS } from '../../shared/utils/labels';

function isSeason(value: string | null): value is Season {
  return SEASONS.some((season) => season.value === value);
}

function candidateKey(item: { name: string; category: Category }): string {
  return `${item.category}:${item.name.trim().toLocaleLowerCase()}`;
}

@Component({
  selector: 'app-assistant-preview-page',
  imports: [FormsModule, RouterLink],
  template: `
    <section class="screen">
      <a routerLink="/assistant" class="back-link"><span aria-hidden="true">←</span> Assistente</a>
      <header class="screen-header">
        <p class="screen-kicker">{{ seasonLabel[season()] }} · {{ days() }} giorni</p>
        <h1 class="screen-title">La tua anteprima</h1>
        <p class="screen-subtitle">Rivedi gli elementi e togli quelli che non ti servono.</p>
      </header>

      <div class="steps-indicator" aria-label="Passo 2 di 2">
        <span class="step-current"></span><span class="step-current"></span>
      </div>
      <p class="eyebrow">Passo 2 di 2 · {{ selectedItems().length }} elementi inclusi</p>

      <label class="field">
        <span class="field-label">Nome della valigia</span>
        <input
          name="name"
          [(ngModel)]="name"
          class="text-input"
          placeholder="Nome della valigia"
          autocomplete="off"
        />
      </label>

      <section class="panel preview-list">
        @for (group of groups(); track group.category) {
          <div class="preview-category">
            <h2 class="category-heading">
              <span>{{ group.label }}</span>
              <span>{{ group.items.length }}</span>
            </h2>
            @for (item of group.items; track item.key) {
              <label class="preview-row">
                <input type="checkbox" [checked]="isSelected(item)" (change)="toggle(item)" />
                <span class="preview-row-copy">
                  <strong>{{ item.name }}</strong>
                  <small>{{ item.fromHistory ? 'Dalle tue liste' : 'Suggerito' }}</small>
                </span>
                @if (item.quantity) {
                  <span class="item-quantity">×{{ item.quantity }}</span>
                }
              </label>
            }
          </div>
        } @empty {
          <div class="empty-state">
            <div class="empty-illustration" aria-hidden="true">🧳</div>
            <h2>La lista è vuota</h2>
            <p>Torna all’assistente e prova un’altra stagione o durata.</p>
          </div>
        }
      </section>

      <div class="assistant-preview-actions">
        <a routerLink="/assistant" class="secondary-button full-width edit-trip-button">
          <span aria-hidden="true">←</span>
          Modifica viaggio
        </a>
        <button
          type="button"
          class="primary-button full-width"
          [disabled]="!name().trim() || selectedItems().length === 0"
          (click)="save()"
        >
          Salva valigia <span aria-hidden="true">→</span>
        </button>
      </div>
    </section>
  `,
  styles: `
    .preview-list {
      display: grid;
      gap: 18px;
      max-height: 46dvh;
      overflow: auto;
    }

    .preview-category {
      display: grid;
    }

    .preview-category .category-heading {
      margin-bottom: 4px;
    }

    .assistant-preview-actions {
      display: grid;
      grid-template-columns: 0.8fr 1.2fr;
      gap: 9px;
    }

    .edit-trip-button {
      min-height: 50px;
      gap: 7px;
      border-color: #c0ded7;
      color: var(--brand-dark);
      background: #f2f8f5;
      font-size: 14px;
      white-space: nowrap;
    }

    .edit-trip-button span {
      font-size: 18px;
      line-height: 1;
    }
  `,
})
export default class AssistantPreviewPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly listsService = inject(ListsService);

  readonly name = signal('');
  readonly days = signal(10);
  readonly season = signal<Season>('summer');
  readonly seasonLabel = SEASON_LABELS;
  readonly selectedIds = signal<string[]>([]);

  readonly previousItems = computed(() => this.listsService.lists().flatMap((list) => list.items));

  readonly candidates = computed(() =>
    assistantItems(this.season(), this.days(), this.previousItems()).map((item) => ({
      ...item,
      key: candidateKey(item),
      fromHistory: this.previousItems().some(
        (previous) => candidateKey(previous) === candidateKey(item),
      ),
    })),
  );

  readonly selectedItems = computed(() =>
    this.candidates().filter((item) => this.selectedIds().includes(item.key)),
  );

  readonly groups = computed(() =>
    CATEGORY_ORDER.map((category) => ({
      category,
      label: CATEGORY_LABELS[category],
      items: this.candidates().filter((item) => item.category === category),
    })).filter((group) => group.items.length > 0),
  );

  ngOnInit(): void {
    const query = this.route.snapshot.queryParamMap;
    const rawDays = query.get('days');
    const days = rawDays === null ? 10 : Number(rawDays);
    const season = query.get('season');
    this.days.set(Number.isFinite(days) ? Math.min(60, Math.max(1, days)) : 10);
    if (isSeason(season)) this.season.set(season);
    this.name.set(query.get('name') ?? `${SEASON_LABELS[this.season()]}, ${this.days()} giorni`);
    this.selectedIds.set(this.candidates().map((item) => item.key));
  }

  isSelected(item: { key: string }): boolean {
    return this.selectedIds().includes(item.key);
  }

  toggle(item: { key: string }): void {
    this.selectedIds.update((current) =>
      current.includes(item.key)
        ? current.filter((key) => key !== item.key)
        : [...current, item.key],
    );
  }

  save(): void {
    const name = this.name().trim();
    const items: Omit<PackingItem, 'id' | 'checked'>[] = this.selectedItems().map(
      ({ name, category, quantity }) => ({
        name,
        category,
        ...(quantity === undefined ? {} : { quantity }),
      }),
    );
    if (!name || items.length === 0) return;
    const list = this.listsService.createList({
      name,
      days: this.days(),
      season: this.season(),
      items,
    });
    void this.router.navigate(['/list', list.id]);
  }
}
