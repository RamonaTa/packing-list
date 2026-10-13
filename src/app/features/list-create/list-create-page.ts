import { Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Season } from '../../core/models/packing.models';
import { ListsService } from '../../core/services/lists.service';
import { SEASONS } from '../../shared/utils/labels';

@Component({
  selector: 'app-list-create-page',
  imports: [FormsModule, RouterLink],
  template: `
    <a routerLink="/" class="mb-4 inline-flex text-sm font-medium text-brand-700"> ← Indietro </a>
    <h1 class="mb-6 text-2xl font-bold tracking-tight">
      {{ isEdit() ? 'Modifica lista' : 'Nuova lista' }}
    </h1>

    <form (ngSubmit)="save()" class="space-y-6">
      <div>
        <label for="name" class="mb-1.5 block text-sm font-medium">Nome</label>
        <input
          id="name"
          name="name"
          [(ngModel)]="name"
          placeholder="es. Weekend 2 giorni estate"
          autocomplete="off"
          class="w-full rounded-xl bg-white px-4 py-3 text-base shadow-sm outline-none ring-1 ring-line focus:ring-2 focus:ring-brand-500"
        />
      </div>

      <div>
        <span class="mb-1.5 block text-sm font-medium">Durata</span>
        <div class="flex items-center gap-4">
          <button
            type="button"
            (click)="changeDays(-1)"
            class="size-11 rounded-full bg-white text-xl shadow-sm ring-1 ring-line active:bg-sand-50"
            aria-label="Un giorno in meno"
          >
            −
          </button>
          <span class="min-w-24 text-center text-lg font-semibold">{{ days() }} giorni</span>
          <button
            type="button"
            (click)="changeDays(1)"
            class="size-11 rounded-full bg-white text-xl shadow-sm ring-1 ring-line active:bg-sand-50"
            aria-label="Un giorno in più"
          >
            +
          </button>
        </div>
      </div>

      <div>
        <span class="mb-1.5 block text-sm font-medium">Stagione</span>
        <div class="flex flex-wrap gap-2">
          @for (s of seasons; track s.value) {
            <button
              type="button"
              (click)="season.set(s.value)"
              class="chip"
              [class.chip-active]="season() === s.value"
            >
              {{ s.label }}
            </button>
          }
        </div>
      </div>

      <button type="submit" [disabled]="!name().trim()" class="btn-primary w-full">
        {{ isEdit() ? 'Salva modifiche' : 'Crea lista' }}
      </button>
    </form>
  `,
})
export default class ListCreatePage {
  readonly id = input<string>();
  readonly isEdit = computed(() => !!this.id());

  private readonly svc = inject(ListsService);
  private readonly router = inject(Router);

  readonly seasons = SEASONS;
  readonly name = signal('');
  readonly days = signal(3);
  readonly season = signal<Season>('any');

  ngOnInit(): void {
    const id = this.id();
    if (!id) return;
    const list = this.svc.lists().find((l) => l.id === id);
    if (!list) {
      this.router.navigate(['/']);
      return;
    }
    this.name.set(list.name);
    this.days.set(list.days);
    this.season.set(list.season);
  }

  changeDays(delta: number): void {
    this.days.update((d) => Math.min(60, Math.max(1, d + delta)));
  }

  save(): void {
    const name = this.name().trim();
    if (!name) return;
    const data = { name, days: this.days(), season: this.season() };

    const id = this.id();
    if (id) {
      this.svc.updateListInfo(id, data);
      this.router.navigate(['/']);
    } else {
      const list = this.svc.createList(data);
      this.router.navigate(['/list', list.id]);
    }
  }
}
