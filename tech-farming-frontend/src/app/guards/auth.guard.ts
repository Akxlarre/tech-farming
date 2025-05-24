import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';
import { AuthService } from '../services/auth.service';

const routerInjection = () => inject(Router);

const authService = () => inject(AuthService);

export const privateGuard: CanActivateFn = async () => {
  const router = routerInjection();

  const { data } = await authService().session();

  if (!data.session) {
    router.navigateByUrl('/login');
  }

  return !!data.session;
};

export const publicGuard: CanActivateFn = async () => {
  const router = routerInjection();

  const { data } = await authService().session();

  if (data.session) {
    router.navigateByUrl('/');
  }

  return !data.session;
};

export const resetPasswordGuard: CanActivateFn = async (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const token = route.queryParamMap.get('token');
  const email = route.queryParamMap.get('email');
  const type = route.queryParamMap.get('type');
  const router = inject(Router);
  const _supabaseClient = inject(SupabaseService).supabase;

  if (!token || !email || type !== 'recovery') {
    router.navigateByUrl('/login');
    return false;
  }

  const { data, error } = await _supabaseClient.auth.verifyOtp({
    type: 'recovery',
    email: email,
    token: token
  });

  if (error) {
    console.error("Error al verificar el token en el Guard:", error);
    router.navigateByUrl('/login');
    return false;
  }

  return true;
};