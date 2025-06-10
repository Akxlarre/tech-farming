import { Injectable, inject } from '@angular/core';
import { SupabaseService } from '../services/supabase.service';
import { Session, SignUpWithPasswordCredentials } from '@supabase/supabase-js';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _supabaseClient = inject(SupabaseService).supabase;

  private _currentSession: Session | null = null;

  get currentSession() {
    return this._currentSession;
  }

  async restoreSession() {
    const { data } = await this._supabaseClient.auth.getSession();
    this._currentSession = data.session;
  }

  async session() {
    const { data } = await this._supabaseClient.auth.getSession();
    this._currentSession = data.session;
    return { data };
  }

  getClient() {
    return this._supabaseClient;
  }

  async login(credentials: SignUpWithPasswordCredentials) {
    const result = await this._supabaseClient.auth.signInWithPassword(credentials);
    this._currentSession = result.data.session;
    return result;
  }

  async logout() {
    await this._supabaseClient.auth.signOut();
    this._currentSession = null;
  }

  async resetPassword(email: string): Promise<{ error: any | null }> {
    try {
      const redirectTo = `${window.location.origin}/perfil/reset-password`;
      const { error } = await this._supabaseClient.auth.resetPasswordForEmail(email, { redirectTo });
      return { error: error || null };
    } catch (err) {
      console.error('Error en resetPassword:', err);
      return { error: err };
    }
  }

  async updatePassword(newPassword: string) {
    return this._supabaseClient.auth.updateUser({ password: newPassword });
  }
}