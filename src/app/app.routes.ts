import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Le mie valigie',
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
    path: 'list/:id/edit',
    title: 'Modifica lista',
    loadComponent: () => import('./features/list-create/list-create-page').then((m) => m.default),
  },
  { path: '**', redirectTo: '' },
];
