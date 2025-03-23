import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'pokemon-table',
    loadComponent: () => import('./features/pokemon-table/pokemon-table.component')
  },
  {
    path: '',
    redirectTo: 'pokemon-table',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'pokemon-table',
    pathMatch: 'full'
  }
];
