import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { privateGuard, publicGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    canActivate: [privateGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardPageComponent) },
      { path: 'sensores', loadComponent: () => import('./sensores/sensores.component').then(m => m.SensoresComponent) },
      { path: 'invernaderos', loadComponent: () => import('./invernaderos/invernaderos.component').then(m => m.InvernaderosComponent) },
      { path: 'alertas', loadComponent: () => import('./alertas/alertas.component').then(m => m.AlertasComponent) },
      { path: 'historial', loadComponent: () => import('./historial/historial.component').then(m => m.HistorialComponent) },
      { path: 'admin', loadComponent: () => import('./admin/admin.component').then(m => m.AdminComponent), canActivate: [adminGuard] },
      { path: 'predicciones', loadComponent: () => import('./predicciones/predicciones.component').then(m => m.PrediccionesComponent) },
      { path: 'perfil', loadComponent: () => import('./perfil/perfil.component').then(m => m.PerfilComponent) }
    ]
  },
  {
    path: 'login',
    canActivate: [publicGuard],
    loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'perfil/reset-password',
    loadComponent: () => import('./perfil/components/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
  },
  {
    path: 'set-password',
    loadComponent: () => import('./auth/set-password/set-password.component').then(m => m.SetPasswordComponent)
  },
  {
    path: 'confirm-email',
    loadComponent: () => import('./auth/confirm-email/confirm-email.component').then(m => m.ConfirmEmailComponent)
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];