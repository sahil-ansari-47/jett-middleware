import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard'; // Assuming you have an authGuard.ts file

export const routes: Routes = [
  // Lazy-loaded route for the home page.
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./home/home').then(m => m.Home),
  },
  // Protected, lazy-loaded route for the dashboard.
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./dashboard/dashboard').then(m => m.Dashboard),
  },
  // Wildcard route to redirect to the home page for any unknown URLs.
  {
    path: '**',
    redirectTo: '',
  },
];
