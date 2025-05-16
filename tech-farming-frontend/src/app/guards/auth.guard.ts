import { inject, Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  router = inject(Router);
  authService = inject(AuthService);

  canActivate(): Observable<boolean> {
    return this.authService.estaAutenticado().pipe(
      tap((session) => {
        console.log('AuthGuard: ¿Usuario autenticado?', session);
        if (!session) {
          this.router.navigateByUrl('/login');
        }
      }),
    );
  }
}