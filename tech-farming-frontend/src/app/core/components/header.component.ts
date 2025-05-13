// src/app/core/components/header.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppLogoComponent } from './app-logo.component';
import { ThemeToggleComponent } from './theme-toggle.component';
import { ProfileMenuComponent } from './profile-menu.component';
import { DesktopNavComponent } from './desktop-nav.component';
import { MobileNavComponent } from './mobile-nav.component';

@Component({
  standalone: true,
  selector: 'app-header',
  imports: [
    CommonModule,
    RouterModule,
    AppLogoComponent,
    ThemeToggleComponent,
    ProfileMenuComponent,
    DesktopNavComponent,
    MobileNavComponent
  ],
  templateUrl: './header.component.html'
})
export class HeaderComponent {
  navItems = [
    { label: 'Dashboard',     path: '/dashboard'    },
    { label: 'Sensores',      path: '/sensores'     },
    { label: 'Invernaderos',  path: '/invernaderos' },
    { label: 'Historial',     path: '/historial'    },
    { label: 'Alertas',       path: '/alertas'      },
    { label: 'Predicciones',  path: '/predicciones' },
    { label: 'Usuarios',      path: '/admin'         },
  ];
}