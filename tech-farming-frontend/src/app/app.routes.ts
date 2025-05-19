import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { privateGuard, publicGuard, resetPasswordGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    canActivate: [privateGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent)},
      { path: 'sensores', loadComponent: () => import('./sensores/sensores.component').then(m => m.SensoresComponent) },
      { path: 'invernaderos', loadComponent: () => import('./invernaderos/invernaderos.component').then(m => m.InvernaderosComponent) },
      { path: 'alertas', loadComponent: () => import('./alertas/alertas.component').then(m => m.AlertasComponent) },
      { path: 'historial', loadComponent: () => import('./historial/historial.component').then(m => m.HistorialComponent) },
      { path: 'admin', loadComponent: () => import('./admin/admin.component').then(m => m.AdminComponent) },
      { path: 'predicciones', loadComponent: () => import('./predicciones/predicciones.component').then(m => m.PrediccionesComponent) },
    ]
  },
  {
    path: 'login',
    canActivate: [publicGuard],
    loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'reset-password',
    canActivate: [resetPasswordGuard],
    loadComponent: () => import('./auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];