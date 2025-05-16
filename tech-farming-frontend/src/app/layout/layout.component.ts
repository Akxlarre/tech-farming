import { Component, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../core/components/header.component';
import { SplashComponent } from '../core/components/splash/splash.component';
import { AuthService } from '../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-layout',
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    SplashComponent,
  ],
  templateUrl: './layout.component.html',
})
export class LayoutComponent {
  showSplash = signal(true);
  showToast = signal(false);
  authService = inject(AuthService);

  constructor() {
    this.authService.isLoading().subscribe((loading) => {
      this.showSplash.set(loading);
    });
  }

  logout() {
    this.authService.logout();
    this.showToast.set(true);
    setTimeout(() => this.showToast.set(false), 3000);
  }
}

