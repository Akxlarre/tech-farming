import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

const routerInjection = () => inject(Router);

const authService = () => inject(AuthService);

export const privateGuard: CanActivateFn = async () => {
  const router = routerInjection();

  const { data } = await authService().session();
  const session = data.session;

  if (!session) {
    router.navigateByUrl('/login');
    return false;
  }

  return true;
};

export const publicGuard: CanActivateFn = async () => {
  const router = routerInjection();

  const { data } = await authService().session();
  const session = data.session;

  if (session) {
    router.navigateByUrl('/');
    return false;
  }

  return true;
};