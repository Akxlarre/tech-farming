// src/app/core/components/header.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-header',
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html'
})
export class HeaderComponent {
    constructor(private router: Router) {}
  
    isActive(path: string): boolean {
      return this.router.url.includes(path);
    }

    cerrarSesion() {
        // Aquí puedes limpiar el token, cerrar sesión, redirigir, etc.
        localStorage.clear();
        this.router.navigate(['/login']);
      }
  }