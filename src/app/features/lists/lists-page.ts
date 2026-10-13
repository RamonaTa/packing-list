import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PackingList } from '../../core/models/packing.models';
import { ListsService } from '../../core/services/lists.service';
import { SEASON_LABELS } from '../../shared/utils/labels';

@Component({
  selector: 'app-lists-page',
  imports: [RouterLink],
  template: `
    <section class="screen">
      <header class="screen-header">
        <p class="screen-kicker">La partenza si avvicina?</p>
        <h1 class="screen-title">Le mie valigie</h1>
        <p class="screen-subtitle">Tutto quello che ti serve, senza dimenticare niente.</p>
      </header>

      @if (lists().length === 0) {
        <section class="card empty-state">
          <div class="empty-illustration" aria-hidden="true">🧳</div>
          <h2>La prima avventura inizia qui</h2>
          <p>Crea una lista da zero, scegli un modello o lascia che ti aiutiamo a prepararla.</p>
          <a routerLink="/new" class="secondary-button full-width">Scegli un modello</a>
          <a routerLink="/assistant" class="text-link">Prova l’assistente</a>
        </section>
      } @else {
        <section class="summary-card">
          <div class="summary-icon" aria-hidden="true">✈️</div>
          <div>
            <p class="summary-label">Riepilogo per la prossima partenza</p>
            <p class="summary-value">{{ readyCount() }} di {{ lists().length }} valigie complete</p>
          </div>
          <span class="summary-sparkle" aria-hidden="true">✦</span>
        </section>

        <div class="section-heading">
          <h2>Le tue liste</h2>
          <span class="count-pill">{{ lists().length }}</span>
        </div>

        <ul class="list-stack">
          @for (list of lists(); track list.id) {
            <li class="card list-card">
              <a [routerLink]="['/list', list.id]" class="list-card-link">
                <div class="list-card-top">
                  <div class="list-card-icon" aria-hidden="true">{{ seasonIcon[list.season] }}</div>
                  <div class="list-card-copy">
                    <h2 class="list-card-title">{{ list.name }}</h2>
                    <p class="list-card-meta">
                      {{ list.days }} giorni <span aria-hidden="true">·</span>
                      {{ seasonLabel[list.season] }}
                    </p>
                  </div>
                  @if (progress(list).pct === 100 && progress(list).total > 0) {
                    <span class="status-pill">✓ Completa!</span>
                  } @else {
                    <span class="list-percent">{{ progress(list).pct }}%</span>
                  }
                </div>
                <div
                  class="progress-track"
                  role="progressbar"
                  [attr.aria-valuenow]="progress(list).pct"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  [attr.aria-label]="'Completamento ' + list.name"
                >
                  <div class="progress-fill" [style.width.%]="progress(list).pct"></div>
                </div>
                <p class="list-count">
                  {{ progress(list).done }} di {{ progress(list).total }} elementi
                </p>
              </a>
              <div class="card-actions">
                <a [routerLink]="['/list', list.id, 'edit']" class="card-action">Modifica</a>
                <button type="button" (click)="remove(list)" class="card-action card-action-danger">
                  Elimina
                </button>
              </div>
            </li>
          }
        </ul>
      }
      <a routerLink="/new" class="primary-button floating-action">＋ Nuova lista</a>
    </section>
  `,
  styles: `
    .list-stack {
      display: grid;
      gap: 13px;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .summary-card {
      position: relative;
      display: flex;
      align-items: center;
      gap: 13px;
      overflow: hidden;
      padding: 15px;
      border: 1px solid #c0ded7;
      border-radius: 16px;
      background: linear-gradient(110deg, #e1f3ed, #f4f6e9);
    }

    .summary-icon,
    .list-card-icon {
      display: grid;
      width: 44px;
      height: 44px;
      flex: 0 0 auto;
      place-items: center;
      border-radius: 14px;
      background: rgb(255 255 255 / 72%);
      font-size: 22px;
    }

    .summary-label,
    .summary-value {
      margin: 0;
    }

    .summary-label {
      color: var(--muted);
      font-size: 12px;
    }

    .summary-value {
      margin-top: 3px;
      font-size: 14px;
      font-weight: 750;
    }

    .summary-sparkle {
      margin-left: auto;
      color: #c2883c;
      font-size: 24px;
    }

    .list-card-link {
      display: block;
    }

    .list-card-copy {
      min-width: 0;
      flex: 1;
    }

    .list-percent {
      color: var(--brand);
      font-size: 14px;
      font-weight: 800;
    }
  `,
})
export default class ListsPage {
  private readonly svc = inject(ListsService);
  readonly lists = this.svc.lists;
  readonly seasonLabel = SEASON_LABELS;
  readonly seasonIcon: Record<string, string> = {
    summer: '☀️',
    winter: '❄️',
    'spring-autumn': '🌿',
    any: '🧳',
  };
  readonly progress = (list: PackingList) => this.svc.progress(list);
  readonly readyCount = () =>
    this.lists().filter((list) => {
      const { done, total } = this.progress(list);
      return total > 0 && done === total;
    }).length;

  remove(list: PackingList): void {
    if (confirm(`Eliminare "${list.name}"?`)) {
      this.svc.deleteList(list.id);
    }
  }
}
