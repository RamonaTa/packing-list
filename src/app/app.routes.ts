import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Ready, Set, Pack!',
    loadComponent: () => import('./features/lists/lists-page').then((m) => m.default),
  },
  {
    path: 'new',
    title: 'Nuova lista',
    loadComponent: () => import('./features/list-create/list-create-page').then((m) => m.default),
  },
  {
    path: 'list/:id',
    title: 'Checklist',
    loadComponent: () => import('./features/list-detail/list-detail-page').then((m) => m.default),
  },
  {
    path: 'list/:id/suggestions',
    title: 'Suggerimenti',
    loadComponent: () => import('./features/suggestions/suggestions-page').then((m) => m.default),
  },
  {
    path: 'assistant/preview',
    title: 'Anteprima valigia',
    loadComponent: () =>
      import('./features/assistant/assistant-preview-page').then((m) => m.default),
  },
  {
    path: 'assistant',
    title: 'Assistente',
    loadComponent: () => import('./features/assistant/assistant-page').then((m) => m.default),
  },
  {
    path: 'list/:id/edit',
    title: 'Modifica lista',
    loadComponent: () => import('./features/list-create/list-create-page').then((m) => m.default),
  },
  { path: '**', redirectTo: '' },
];
