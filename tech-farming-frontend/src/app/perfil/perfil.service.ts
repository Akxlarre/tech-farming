import { Injectable, inject } from '@angular/core';
import { SupabaseService } from '../services/supabase.service';

@Injectable({ providedIn: 'root' })
export class PerfilService {
  private _supabaseClient = inject(SupabaseService).supabase;

  async getUsuarioAutenticado() {
    const { data, error } = await this._supabaseClient.auth.getUser();
    return { user: data?.user, error };
  }

  async getDatosPerfil(uid: string) {
    const { data, error } = await this._supabaseClient
      .from('usuarios')
      .select<string, any>('*')
      .eq('supabase_uid', uid)
      .single();

    return { usuario: data, error };
  }

  async actualizarUsuario(uid: string, cambios: Partial<{
    nombre: string;
    apellido: string;
    telefono: string;
    avatar_url: string
  }>) {
    const { error } = await this._supabaseClient
      .from('usuarios')
      .update(cambios)
      .eq('supabase_uid', uid);

    return { error };
  }

  async actualizarCorreo(nuevoCorreo: string) {
    const emailRedirectTo = `${window.location.origin}/confirm-email`;
    const { error: authError } = await this._supabaseClient.auth.updateUser({ email: nuevoCorreo }, { emailRedirectTo });
    if (authError) {
      return { error: authError };
    }

    return { error: null };
  }

  async actualizarNotificaciones(uid: string, cambios: {
    recibe_notificaciones: boolean;
    alertas_cada_minutos: number;
    cooldown_post_resolucion: number;
  }) {
    const { error } = await this._supabaseClient
      .from('usuarios')
      .update(cambios)
      .eq('supabase_uid', uid);

    return { error };
  }
}



