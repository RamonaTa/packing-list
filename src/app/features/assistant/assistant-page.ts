import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Season } from '../../core/models/packing.models';
import { ListsService } from '../../core/services/lists.service';
import { SEASONS, SEASON_LABELS } from '../../shared/utils/labels';

@Component({
  selector: 'app-assistant-page',
  imports: [FormsModule, RouterLink],
  template: `
    <section class="screen">
      <a routerLink="/" class="back-link"><span aria-hidden="true">←</span> Le mie valigie</a>
      <header class="screen-header">
        <p class="screen-kicker">La tua compagna di viaggio</p>
        <h1 class="screen-title">Assistente</h1>
        <p class="screen-subtitle">Prepariamo insieme una valigia fatta per il tuo viaggio.</p>
      </header>

      <div class="steps-indicator" aria-label="Passo 1 di 3">
        <span class="step-current"></span><span></span><span></span>
      </div>

      <section class="assistant-intro">
        <div class="assistant-orbit" aria-hidden="true">
          <span class="orbit-sparkle">✦</span>
          <span class="orbit-case">🧳</span>
          <span class="orbit-dot">✧</span>
        </div>
        <p class="eyebrow">Passo 1 di 3</p>
        <h2>Genera la tua valigia</h2>
        <p class="helper-text">
          Creiamo un punto di partenza usando le tue liste e suggerimenti stagionali. Funziona anche
          offline.
        </p>
      </section>

      <form (ngSubmit)="continue()" class="form-stack">
        <section class="panel form-panel">
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
              @for (option of seasons; track option.value) {
                <button
                  type="button"
                  class="choice-button season-choice"
                  [class.choice-button-active]="season() === option.value"
                  (click)="season.set(option.value)"
                  [attr.aria-pressed]="season() === option.value"
                >
                  <span aria-hidden="true">{{ seasonIcon[option.value] }}</span>
                  {{ option.label }}
                </button>
              }
            </div>
          </div>

          <label class="field">
            <span class="field-label">Nome della valigia</span>
            <input
              name="name"
              [(ngModel)]="name"
              class="text-input"
              [placeholder]="suggestedName()"
              autocomplete="off"
            />
          </label>
        </section>

        @if (listCount() > 0) {
          <aside class="assistant-history">
            <span class="history-icon" aria-hidden="true">↗</span>
            <p>
              Useremo le tue <strong>{{ listCount() }} valigie</strong> come riferimento, insieme ai
              suggerimenti utili per la stagione.
            </p>
          </aside>
        } @else {
          <aside class="notice">
            I tuoi dati restano sul dispositivo. Nessun account necessario.
          </aside>
        }

        <button type="submit" class="primary-button full-width">
          Prepara l’anteprima <span aria-hidden="true">→</span>
        </button>
      </form>
    </section>
  `,
  styles: `
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

    .assistant-intro {
      display: grid;
      justify-items: center;
      gap: 8px;
      padding: 18px 18px 22px;
      border: 1px solid #c0ded7;
      border-radius: 20px;
      background:
        radial-gradient(circle at 25% 22%, rgb(255 255 255 / 75%), transparent 34%),
        linear-gradient(135deg, #e0f3ed, #f4f3e7);
      text-align: center;
    }

    .assistant-intro h2 {
      margin: 0;
      font-size: 22px;
      letter-spacing: -0.03em;
    }

    .assistant-intro .helper-text {
      max-width: 300px;
      margin: 0;
      line-height: 1.5;
    }

    .assistant-orbit {
      position: relative;
      display: grid;
      width: 92px;
      height: 76px;
      place-items: center;
      margin-bottom: 5px;
    }

    .assistant-orbit::before {
      position: absolute;
      width: 70px;
      height: 54px;
      border: 1px solid rgb(15 118 110 / 24%);
      border-radius: 50%;
      content: '';
      transform: rotate(-20deg);
    }

    .orbit-case {
      font-size: 44px;
    }

    .orbit-sparkle,
    .orbit-dot {
      position: absolute;
      color: #b37b28;
      font-size: 19px;
    }

    .orbit-sparkle {
      top: 2px;
      right: 8px;
    }

    .orbit-dot {
      bottom: 5px;
      left: 4px;
      color: var(--brand);
    }

    .assistant-history {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 12px 14px;
      border: 1px solid var(--line);
      border-radius: 14px;
      background: rgb(255 255 255 / 58%);
    }

    .assistant-history p {
      margin: 0;
      color: var(--muted);
      font-size: 13px;
    }

    .assistant-history strong {
      color: var(--ink);
    }

    .history-icon {
      color: var(--brand);
      font-size: 18px;
    }
  `,
})
export default class AssistantPage {
  private readonly router = inject(Router);
  private readonly listsService = inject(ListsService);

  readonly seasons = SEASONS;
  readonly days = signal(10);
  readonly season = signal<Season>('summer');
  readonly name = signal('');
  readonly listCount = () => this.listsService.lists().length;
  readonly seasonIcon: Record<Season, string> = {
    summer: '☀️',
    winter: '❄️',
    'spring-autumn': '🌿',
    any: '✦',
  };

  readonly suggestedName = () => `${SEASON_LABELS[this.season()]}, ${this.days()} giorni`;

  changeDays(delta: number): void {
    this.days.update((value) => Math.min(60, Math.max(1, value + delta)));
  }

  continue(): void {
    void this.router.navigate(['/assistant/preview'], {
      queryParams: {
        name: this.name().trim() || this.suggestedName(),
        days: this.days(),
        season: this.season(),
      },
    });
  }
}
