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
      const { error } = await this._supabaseClient.auth.resetPasswordForEmail(email);
      return { error: error || null };
    } catch (err) {
      console.error('Error en resetPassword:', err);
      return { error: err };
    }
  }
}