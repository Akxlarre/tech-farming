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

  async actualizarUsuario(uid: string, cambios: Partial<{ nombre: string; apellido: string; telefono: string }>) {
    const { error } = await this._supabaseClient
      .from('usuarios')
      .update(cambios)
      .eq('supabase_uid', uid);

    return { error };
  }
}
