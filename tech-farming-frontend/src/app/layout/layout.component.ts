import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
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
  templateUrl: './layout.component.html'
})
export class LayoutComponent {
  constructor(
    public authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  showSplash = true;
  hideSplash = false;

  ngOnInit() {
    setTimeout(() => {
      this.hideSplash = true;
      setTimeout(() => {
        this.showSplash = false;

      this.route.queryParams.subscribe(params => {
        const vieneDeInvitacion = params['invitacion'] === 'true';

        if (!vieneDeInvitacion && this.router.url === '/') {
          this.router.navigateByUrl('/dashboard');
        }
      });
      }, 500);


    }, 4000);
  }
}