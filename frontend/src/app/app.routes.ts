import { Routes } from '@angular/router';
import { Home } from './pages/home';

export const routes: Routes = [
  { path: '', pathMatch: 'full', component: Home },
  {
    path: 'work/:slug',
    loadComponent: () => import('./pages/project-detail').then((module) => module.ProjectDetail),
  },
  {
    path: 'not-found',
    loadComponent: () => import('./pages/not-found').then((module) => module.NotFound),
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found').then((module) => module.NotFound),
  },
];
