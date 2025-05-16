import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../core/components/header.component';
import { SplashComponent } from '../core/components/splash/splash.component';
import { AuthService } from '../services/auth.service';

@Component({
    selector: 'app-layout',
    imports: [
        CommonModule,
        RouterModule,
        HeaderComponent,
        SplashComponent,
    ],
    templateUrl: './layout.component.html'
})
export class LayoutComponent {
  constructor(public authService: AuthService) {}

  showSplash = true;

  ngOnInit() {
    setTimeout(() => {
      this.showSplash = false;
    }, 4000);
  }
}