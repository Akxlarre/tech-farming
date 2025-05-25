import { Component, HostListener, ElementRef, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-profile-menu',
  imports: [CommonModule, RouterModule],
  template: `
    <div class="relative" #menuContainer>
      <button (click)="toggleMenu()"
              aria-label="Perfil"
              class="flex items-center btn btn-ghost px-2 space-x-2 focus:ring-2 focus:ring-primary">
        <div class="w-10 h-10 rounded-full overflow-hidden ring ring-success ring-offset-base-100 ring-offset-2">
          <img src="https://i.pravatar.cc/150?img=12" alt="Avatar" />
        </div>
        <span class="hidden lg:inline-block font-medium">Nicol</span>
        <i class="hidden lg:inline-block fas fa-caret-down"></i>
      </button>

      <ul *ngIf="showMenu"
          class="menu dropdown-content absolute right-0 mt-2 p-2 shadow-lg bg-base-100 rounded-box w-56">
        <li>
          <a (click)="goProfile()"
             class="flex items-center space-x-2 hover:bg-success hover:text-base-content">
            <i class="fas fa-user"></i>
            <span>Perfil</span>
          </a>
        </li>
        <li>
          <a (click)="openLogoutModal()"
             class="flex items-center space-x-2 text-error hover:bg-error/10">
            <i class="fas fa-sign-out-alt"></i>
            <span>Cerrar sesión</span>
          </a>
        </li>
      </ul>
    </div>

    <!-- Modal de Confirmación de Cierre de Sesión (Diseño Mejorado) -->
    <input type="checkbox" id="modal-cerrar-sesion" class="modal-toggle" [checked]="showLogoutModal()" />
    <div class="modal z-[9999]">
      <div class="modal-box rounded-2xl shadow-xl bg-white/80 backdrop-blur-md border border-gray-200">
        <div class="flex items-center gap-3 mb-4">
          <span class="text-3xl animate-bounce">🌿</span>
          <h3 class="font-bold text-xl text-gray-800 tracking-tight">Confirmar Salida</h3>
        </div>
        <p class="text-sm text-gray-600 leading-snug">
          Estás a punto de cerrar sesión.<br />
          ¡Te esperamos pronto de vuelta!
        </p>
        <div class="modal-action mt-6 flex justify-end gap-2">
          <button (click)="cancelLogout()"
                  class="btn btn-outline hover:bg-gray-100 text-gray-700 font-medium">
            Cancelar
          </button>
          <button (click)="confirmLogout()"
                  class="btn flex items-center justify-center gap-2 bg-pink-600 hover:bg-pink-700 text-white font-semibold shadow-md transition-all duration-200 px-4 py-2 text-center">
            <span class="text-center">Cerrar sesión</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Toast de cierre de sesión -->
    <div id="toast-logout" class="toast toast-top toast-end z-[9999] hidden">
      <div class="alert alert-success shadow-md">
        <span>🌿 Sesión cerrada correctamente</span>
      </div>
    </div>
  `
})
export class ProfileMenuComponent {
  showMenu = false;
  showLogoutModal = signal(false);

  private router = inject(Router);
  private host = inject(ElementRef);
  private authService = inject(AuthService);

  toggleMenu() {
    this.showMenu = !this.showMenu;
  }

  goProfile() {
    this.showMenu = false;
    this.router.navigate(['/profile']);
  }

  openLogoutModal() {
    this.showMenu = false;
    this.showLogoutModal.set(true);
  }

  async confirmLogout() {
    this.showLogoutModal.set(false);
    await this.authService.logout();
    this.mostrarToast();
    this.router.navigate(['/login']);
  }

  cancelLogout() {
    this.showLogoutModal.set(false);
  }

  mostrarToast() {
    const toast = document.getElementById('toast-logout');
    if (toast) {
      toast.classList.remove('hidden');
      setTimeout(() => toast.classList.add('hidden'), 3000);
    }
  }

  @HostListener('document:click', ['$event.target'])
  onClickOutside(target: HTMLElement) {
    if (!this.host.nativeElement.contains(target)) {
      this.showMenu = false;
    }
  }
}
