import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

const routerInjection = () => inject(Router);

const authService = () => inject(AuthService);

export const privateGuard: CanActivateFn = () => {
  const router = routerInjection();

  const session = authService().currentSession;

  if (!session) {
    router.navigateByUrl('/login');
  }

  return !!session;
};

export const publicGuard: CanActivateFn = () => {
  const router = routerInjection();

  const session = authService().currentSession;

  if (session) {
    router.navigateByUrl('/');
  }

  return !session;
};