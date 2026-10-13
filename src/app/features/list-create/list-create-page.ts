import { Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Category, Season } from '../../core/models/packing.models';
import { ListsService } from '../../core/services/lists.service';
import { PACKING_TEMPLATES, PackingTemplate, templateItems } from '../../data/packing-catalog';
import { SEASONS, SEASON_LABELS } from '../../shared/utils/labels';

@Component({
  selector: 'app-list-create-page',
  imports: [FormsModule, RouterLink],
  template: `
    <section class="screen">
      <a routerLink="/" class="back-link"><span aria-hidden="true">←</span> Le mie valigie</a>

      <header class="screen-header">
        <p class="screen-kicker">{{ isEdit() ? 'La tua valigia' : 'Cominciamo' }}</p>
        <h1 class="screen-title">{{ isEdit() ? 'Modifica lista' : 'Nuova lista' }}</h1>
        <p class="screen-subtitle">
          {{ isEdit() ? 'Aggiorna i dettagli del tuo viaggio.' : 'Scegli da dove vuoi partire.' }}
        </p>
      </header>

      @if (!isEdit()) {
        <div class="section-heading"><h2>Punto di partenza</h2></div>
        <div class="template-grid">
          @for (template of templates; track template.id) {
            <button
              type="button"
              class="choice-button template-choice"
              [class.choice-button-active]="selectedTemplate() === template.id"
              (click)="selectTemplate(template)"
              [attr.aria-pressed]="selectedTemplate() === template.id"
            >
              <span class="choice-icon" aria-hidden="true">{{ template.icon }}</span>
              <span class="template-choice-copy">
                <strong>{{ template.name }}</strong>
                <small>{{ template.description }}</small>
              </span>
              @if (selectedTemplate() === template.id) {
                <span class="template-check" aria-hidden="true">✓</span>
              }
            </button>
          }
        </div>

        @if (lists().length > 0) {
          <div class="panel reuse-panel">
            <div class="section-heading">
              <h2>Riusa una valigia</h2>
              <span class="soft-pill">Facoltativo</span>
            </div>
            <p class="helper-text">Parti da una lista che hai già preparato.</p>
            <div class="reuse-list">
              @for (list of lists(); track list.id) {
                <button
                  type="button"
                  class="reuse-button"
                  (click)="reuse(list.id)"
                  [attr.aria-label]="'Copia ' + list.name"
                >
                  <span>{{ list.name }}</span>
                  <span class="muted">{{ list.items.length }} elementi →</span>
                </button>
              }
            </div>
          </div>
        }

        <a routerLink="/assistant" class="assistant-callout">
          <span class="assistant-icon" aria-hidden="true">✦</span>
          <span>
            <strong>Genera con l’assistente</strong>
            <small>Un punto di partenza personalizzato, anche offline</small>
          </span>
          <span aria-hidden="true">→</span>
        </a>
      }

      <form (ngSubmit)="save()" class="form-stack">
        <section class="panel form-panel">
          <label class="field">
            <span class="field-label">Nome della valigia</span>
            <input
              id="name"
              name="name"
              [(ngModel)]="name"
              class="text-input"
              placeholder="es. Weekend al mare"
              autocomplete="off"
              required
            />
          </label>

          <div class="field">
            <span class="field-label">Durata del viaggio</span>
            <div class="stepper">
              <button
                type="button"
                class="stepper-button"
                (click)="changeDays(-1)"
                aria-label="Un giorno in meno"
              >
                −
              </button>
              <span class="stepper-value">{{ days() }} giorni</span>
              <button
                type="button"
                class="stepper-button"
                (click)="changeDays(1)"
                aria-label="Un giorno in più"
              >
                +
              </button>
            </div>
          </div>

          <div class="field">
            <span class="field-label">Stagione</span>
            <div class="season-grid">
              @for (seasonOption of seasons; track seasonOption.value) {
                <button
                  type="button"
                  class="choice-button season-choice"
                  [class.choice-button-active]="season() === seasonOption.value"
                  (click)="season.set(seasonOption.value)"
                  [attr.aria-pressed]="season() === seasonOption.value"
                >
                  <span aria-hidden="true">{{ seasonIcon[seasonOption.value] }}</span>
                  {{ seasonOption.label }}
                </button>
              }
            </div>
          </div>
        </section>

        @if (!isEdit()) {
          <section class="panel starter-panel">
            <div class="section-heading">
              <h2>La tua lista</h2>
              <span class="soft-pill">{{ startingItems().length }} elementi</span>
            </div>
            @if (startingItems().length > 0) {
              <ul class="starter-items">
                @for (item of startingItems().slice(0, 5); track item.name) {
                  <li>
                    <span>{{ item.name }}</span>
                    <span class="muted">{{ item.quantity ? '×' + item.quantity : '✓' }}</span>
                  </li>
                }
              </ul>
              @if (startingItems().length > 5) {
                <p class="helper-text">e altri {{ startingItems().length - 5 }} elementi</p>
              }
            } @else {
              <p class="helper-text">Lista vuota · potrai aggiungere gli elementi dopo.</p>
            }
          </section>
        }

        <button type="submit" [disabled]="!name().trim()" class="primary-button full-width">
          {{ isEdit() ? 'Salva modifiche' : 'Crea lista' }} <span aria-hidden="true">→</span>
        </button>
      </form>
    </section>
  `,
  styles: `
    .template-grid,
    .reuse-list {
      display: grid;
      gap: 9px;
    }

    .template-choice {
      min-height: 69px;
    }

    .form-stack > .primary-button {
      position: sticky;
      z-index: 2;
      bottom: calc(12px + env(safe-area-inset-bottom));
      box-shadow: 0 5px 16px rgb(15 118 110 / 22%);
    }

    .form-stack > .primary-button:disabled {
      opacity: 1;
      color: #fff;
      background: #9ccbc5;
      box-shadow: none;
    }

    .template-choice-copy {
      display: grid;
      min-width: 0;
      flex: 1;
      gap: 3px;
      text-align: left;
    }

    .template-choice-copy small {
      color: var(--muted);
      font-size: 12px;
      font-weight: 500;
      line-height: 1.35;
    }

    .template-check {
      color: var(--brand);
      font-weight: 800;
    }

    .reuse-panel,
    .form-panel,
    .starter-panel {
      display: grid;
      gap: 16px;
    }

    .reuse-panel .helper-text,
    .starter-panel .helper-text {
      margin: -10px 0 0;
    }

    .reuse-button {
      display: flex;
      min-height: 44px;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      border: 0;
      border-bottom: 1px solid #eeeae1;
      padding: 8px 0;
      background: transparent;
      font-size: 13px;
      font-weight: 650;
      text-align: left;
    }

    .reuse-button:last-child {
      border-bottom: 0;
    }

    .reuse-button .muted {
      font-size: 12px;
      white-space: nowrap;
    }

    .assistant-callout {
      display: flex;
      min-height: 66px;
      align-items: center;
      gap: 11px;
      padding: 12px;
      border: 1px solid #c0ded7;
      border-radius: 16px;
      color: var(--brand-dark);
      background: linear-gradient(110deg, #e1f3ed, #f3f5e9);
    }

    .assistant-callout > span:nth-child(2) {
      display: grid;
      flex: 1;
      gap: 2px;
    }

    .assistant-callout strong {
      font-size: 13px;
    }

    .assistant-callout small {
      color: var(--muted);
      font-size: 11px;
    }

    .assistant-icon {
      display: grid;
      width: 38px;
      height: 38px;
      place-items: center;
      border-radius: 12px;
      color: #a06b16;
      background: #fff;
      font-size: 20px;
    }

    .season-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
    }

    .season-choice {
      min-height: 43px;
      justify-content: flex-start;
      padding: 0 10px;
      font-size: 12px;
    }

    .starter-items {
      display: grid;
      gap: 9px;
      margin: -4px 0 0;
      padding: 0;
      list-style: none;
    }

    .starter-items li {
      display: flex;
      justify-content: space-between;
      gap: 10px;
      font-size: 13px;
    }
  `,
})
export default class ListCreatePage {
  readonly id = input<string>();
  readonly isEdit = computed(() => !!this.id());

  private readonly svc = inject(ListsService);
  private readonly router = inject(Router);

  readonly templates = PACKING_TEMPLATES;
  readonly seasons = SEASONS;
  readonly lists = this.svc.lists;
  readonly name = signal('');
  readonly days = signal(3);
  readonly season = signal<Season>('any');
  readonly selectedTemplate = signal('empty');
  readonly startingItems = signal(templateItems(PACKING_TEMPLATES[0]));
  readonly seasonIcon: Record<Season, string> = {
    summer: '☀️',
    winter: '❄️',
    'spring-autumn': '🌿',
    any: '✦',
  };

  ngOnInit(): void {
    const id = this.id();
    if (!id) return;
    const list = this.svc.lists().find((existing) => existing.id === id);
    if (!list) {
      void this.router.navigate(['/']);
      return;
    }
    this.name.set(list.name);
    this.days.set(list.days);
    this.season.set(list.season);
  }

  selectTemplate(template: PackingTemplate): void {
    this.selectedTemplate.set(template.id);
    this.startingItems.set(templateItems(template));
    this.days.set(template.days);
    this.season.set(template.season);
    if (template.id !== 'empty') {
      this.name.set(
        template.name === 'Weekend'
          ? 'Weekend ' + SEASON_LABELS[template.season].toLowerCase()
          : template.name,
      );
    } else {
      this.name.set('');
    }
  }

  reuse(id: string): void {
    const previous = this.lists().find((list) => list.id === id);
    if (!previous) return;
    this.selectedTemplate.set('reused');
    this.startingItems.set(
      previous.items.map(({ name, category, quantity }) => ({
        name,
        category,
        ...(quantity === undefined ? {} : { quantity }),
      })),
    );
    this.days.set(previous.days);
    this.season.set(previous.season);
    this.name.set(`${previous.name} (copia)`);
  }

  changeDays(delta: number): void {
    this.days.update((days) => Math.min(60, Math.max(1, days + delta)));
  }

  save(): void {
    const name = this.name().trim();
    if (!name) return;
    const data = { name, days: this.days(), season: this.season() };
    const id = this.id();
    if (id) {
      this.svc.updateListInfo(id, data);
      void this.router.navigate(['/']);
      return;
    }

    const list = this.svc.createList({ ...data, items: this.startingItems() });
    void this.router.navigate(['/list', list.id]);
  }
}
