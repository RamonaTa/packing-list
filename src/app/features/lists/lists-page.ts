import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PackingList } from '../../core/models/packing.models';
import { ListsService } from '../../core/services/lists.service';
import { SEASON_LABELS } from '../../shared/utils/labels';

@Component({
  selector: 'app-lists-page',
  imports: [RouterLink],
  template: `
    <header class="mb-6">
      <p class="text-sm font-medium text-brand-700">Pronta a partire?</p>
      <h1 class="text-3xl font-bold tracking-tight">Le mie valigie</h1>
    </header>

    @if (lists().length === 0) {
      <div class="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-line">
        <p class="text-4xl">🧳</p>
        <h2 class="mt-3 font-semibold">Nessuna valigia, per ora</h2>
        <p class="mt-1 text-sm text-muted">Crea la tua prima lista e non dimenticare più niente.</p>
      </div>
    } @else {
      <ul class="space-y-3">
        @for (list of lists(); track list.id) {
          <li class="card overflow-hidden">
            <a [routerLink]="['/list', list.id]" class="block p-4 transition active:bg-black/5">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <h2 class="wrap-break-word font-semibold">{{ list.name }}</h2>
                  <p class="text-sm text-muted">
                    {{ list.days }} giorni · {{ seasonLabel[list.season] }}
                  </p>
                </div>
                <span class="text-sm font-semibold text-brand-700">
                  {{ progress(list).pct }}%
                </span>
              </div>
              <div class="mt-3 h-2 overflow-hidden rounded-full bg-black/10">
                <div
                  class="h-full rounded-full bg-brand-500 transition-all"
                  [style.width.%]="progress(list).pct"
                ></div>
              </div>
              <p class="mt-2 text-xs text-muted">
                {{ progress(list).done }} di {{ progress(list).total }} elementi
              </p>
            </a>

            <div class="card-footer">
              <a [routerLink]="['/list', list.id, 'edit']" class="card-action">Modifica</a>
              <button type="button" (click)="remove(list)" class="card-action card-action-danger">
                Elimina
              </button>
            </div>
          </li>
        }
      </ul>
    }

    <a routerLink="/new" class="btn-primary fixed inset-x-0 bottom-6 mx-auto w-fit shadow-lg">
      + Nuova lista
    </a>
  `,
})
export default class ListsPage {
  private readonly svc = inject(ListsService);
  readonly lists = this.svc.lists;
  readonly seasonLabel = SEASON_LABELS;
  readonly progress = (l: PackingList) => this.svc.progress(l);

  remove(list: PackingList): void {
    if (confirm(`Eliminare "${list.name}"?`)) {
      this.svc.deleteList(list.id);
    }
  }
}
