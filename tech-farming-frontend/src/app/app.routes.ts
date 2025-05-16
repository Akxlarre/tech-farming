import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'sensores', loadComponent: () => import('./sensores/sensores.component').then(m => m.SensoresComponent) },
      { path: 'invernaderos', loadComponent: () => import('./invernaderos/invernaderos.component').then(m => m.InvernaderosComponent) },
      { path: 'alertas', loadComponent: () => import('./alertas/alertas.component').then(m => m.AlertasComponent) },
      { path: 'historial', loadComponent: () => import('./historial/historial.component').then(m => m.HistorialComponent) },
      { path: 'admin', loadComponent: () => import('./admin/admin.component').then(m => m.AdminComponent) },
      { path: 'predicciones', loadComponent: () => import('./predicciones/predicciones.component').then(m => m.PrediccionesComponent) },
    ]
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];