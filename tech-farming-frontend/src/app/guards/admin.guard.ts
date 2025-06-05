import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { SupabaseService } from '../services/supabase.service';

export const adminGuard: CanActivateFn = async () => {
  const supabase = inject(SupabaseService).supabase;
  const router = inject(Router);
  const { data } = await inject(AuthService).session();

  const user = data?.session?.user;
  if (!user) {
    router.navigateByUrl('/login');
    return false;
  }

  // Obtener datos del usuario desde la base de datos
  const { data: usuarioDB, error } = await supabase
    .from('usuarios')
    .select('rol_id')
    .eq('supabase_uid', user.id)
    .single();

  if (error || !usuarioDB || usuarioDB.rol_id !== 1) {
    router.navigateByUrl('/dashboard');
    return false;
  }

  return true;
};
