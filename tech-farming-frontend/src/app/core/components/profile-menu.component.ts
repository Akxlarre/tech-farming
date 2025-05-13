import { Component, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-profile-menu',
  imports: [CommonModule, RouterModule],
  template: `
    <div class="relative" #menuContainer>
      <button (click)="toggleMenu()"
              aria-label="Perfil"
              class="flex items-center btn btn-ghost px-2 space-x-2 focus:ring-2 focus:ring-primary">
        <div class="w-10 h-10 rounded-full overflow-hidden ring ring-secondary ring-offset-base-100 ring-offset-2">
          <img src="https://i.pravatar.cc/150?img=12" alt="Avatar" />
        </div>
        <span class="hidden lg:inline-block font-medium">Nicol</span>
        <i class="hidden lg:inline-block fas fa-caret-down"></i>
      </button>

      <ul *ngIf="showMenu"
          class="menu dropdown-content absolute right-0 mt-2 p-2 shadow-lg bg-base-100 rounded-box w-56">
        <li>
          <a (click)="goProfile()"
             class="flex items-center space-x-2 hover:bg-secondary hover:text-secondary-content">
            <i class="fas fa-user"></i>
            <span>Perfil</span>
          </a>
        </li>
        <li>
          <a (click)="cerrarSesion()"
             class="flex items-center space-x-2 text-error hover:bg-error/10">
            <i class="fas fa-sign-out-alt"></i>
            <span>Cerrar sesión</span>
          </a>
        </li>
      </ul>
    </div>
  `
})
export class ProfileMenuComponent {
  showMenu = false;
  constructor(private router: Router, private host: ElementRef) {}

  toggleMenu() {
    this.showMenu = !this.showMenu;
  }

  goProfile() {
    this.showMenu = false;
    this.router.navigate(['/profile']);
  }

  cerrarSesion() {
    this.showMenu = false;
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  @HostListener('document:click', ['$event.target'])
  onClickOutside(target: HTMLElement) {
    if (!this.host.nativeElement.contains(target)) {
      this.showMenu = false;
    }
  }
}
