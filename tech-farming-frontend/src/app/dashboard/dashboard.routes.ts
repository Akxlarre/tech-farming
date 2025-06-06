// src/app/dashboard/dashboard.routes.ts
import { Routes } from '@angular/router';
import { DashboardPageComponent } from './dashboard.component';

export const dashboardRoutes: Routes = [
  {
    path: '',
    component: DashboardPageComponent,
  },
];