import { Injectable, inject } from '@angular/core';
import { SupabaseService } from '../services/supabase.service';
import { SignUpWithPasswordCredentials } from '@supabase/supabase-js';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _supabaseClient = inject(SupabaseService).supabase;

  session() {
    return this._supabaseClient.auth.getSession();
  }

  login(credentials: SignUpWithPasswordCredentials) {
    return this._supabaseClient.auth.signInWithPassword(credentials);
  }

  logout() {
    return this._supabaseClient.auth.signOut();
  }

  async resetPassword(email: string): Promise<{ error: any | null }> {
    try {
      const redirectTo = window.location.origin + '/reset-password';
      const { error } = await this._supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo
      });

      return { error: error || null };
    } catch (err) {
      console.error('Error en resetPassword:', err);
      return { error: err };
    }
  }

  async updatePassword(email:string, password: string, token: string) {
    try {
      const { data, error: verifyError } = await this._supabaseClient.auth.verifyOtp({
        type: 'recovery',
        email: email,
        token: token
      });

      if (verifyError) {
        console.error("Error al verificar el token de recuperación:", verifyError);
        return { error: verifyError };
      }

      const { error: updateError } = await this._supabaseClient.auth.updateUser({
        password
      });

      if (updateError) {
        console.error("Error al actualizar la contraseña:", updateError);
        return { error: updateError };
      }

      return { error: null };
    } catch (err) {
      console.error("Error en updatePassword:", err);
      return { error: err };
    }
  }
}