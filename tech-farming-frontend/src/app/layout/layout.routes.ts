import { Routes } from '@angular/router';
import { LayoutComponent } from './layout.component';

export const layoutRoutes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
        {
            path: 'dashboard',
            loadChildren: () =>
              import('../dashboard/dashboard.routes').then((m) => m.dashboardRoutes),
        },
      {
        path: 'sensores',
        loadChildren: () =>
          import('../sensores/sensores.routes').then((m) => m.sensoresRoutes),
      },
      {
        path: 'zonas',
        loadChildren: () =>
          import('../invernaderos/zonas.routes').then((m) => m.zonasRoutes),
      },
      {
        path: 'alertas',
        loadChildren: () =>
          import('../alertas/alertas.routes').then((m) => m.alertasRoutes),
      },
      {
        path: 'predicciones',
        loadChildren: () =>
          import('../predicciones/predicciones.routes').then((m) => m.prediccionesRoutes),
      },
      {
        path: 'historial',
        loadChildren: () =>
          import('../historial/historial.routes').then((m) => m.historialRoutes),
      },
      {
        path: 'admin',
        loadChildren: () =>
          import('../admin/admin.routes').then((m) => m.adminRoutes),
      },
    ],
  },
];