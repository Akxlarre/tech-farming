import { ApplicationRef, inject, Injectable } from '@angular/core';
import { createClient, AuthResponse } from '@supabase/supabase-js';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import {
  Observable,
  BehaviorSubject,
  from,
  map,
  of,
  switchMap,
  catchError,
} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private static supabaseInstance: ReturnType<typeof createClient> | null = null;
  private initialized$ = new BehaviorSubject<boolean>(false);
  private loading$ = new BehaviorSubject<boolean>(true);
  currentUser = new BehaviorSubject<string | null>(null);
  router = inject(Router);

  constructor() {
    this.initializeSupabase();
  }

  private initializeSupabase(): void {
    inject(ApplicationRef).isStable
      .pipe(
        switchMap((stable) => {
          if (stable) {
            if (!AuthService.supabaseInstance) {
              AuthService.supabaseInstance = createClient(
                environment.supabaseUrl,
                environment.supabaseKey
              );
              console.log('✅ Supabase está listo');
            }
            this.initialized$.next(true);
            this.loading$.next(false);
            return of(true);
          }
          return of(false);
        })
      )
      .subscribe({
        next: () => this.initialized$.next(true),
        error: (err) => {
          console.warn('SSR context: Supabase no inicializado', err);
          this.initialized$.next(false);
          this.loading$.next(false);
        },
      });
  }

  private getSupabaseClient() {
    if (!AuthService.supabaseInstance) {
      throw new Error('Supabase no inicializado');
    }
    return AuthService.supabaseInstance;
  }

  private listenToAuthChanges() {
  const supabase = this.getSupabaseClient();
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('Cambio de estado de autenticación:', event, session);
    this.currentUser.next(session?.user?.email ?? null);
  });
}

  isInitialized(): Observable<boolean> {
    return this.initialized$.asObservable();
  }

  isLoading(): Observable<boolean> {
    return this.loading$.asObservable();
  }

  login(email: string, password: string): Observable<AuthResponse> {
    const supabase = this.getSupabaseClient();
    const promise = supabase.auth.signInWithPassword({ email, password });
    return from(promise);
  }

  logout(): void {
    const supabase = this.getSupabaseClient();
    supabase.auth.signOut();
    this.router.navigateByUrl('/login');
  }

  estaAutenticado(): Observable<boolean> {
    console.log('Verificando autenticación...');
    return this.isInitialized().pipe(
      switchMap((ready) => {
        console.log('¿Supabase está inicializado?', ready);
        if (!ready || !AuthService.supabaseInstance) {
          console.warn('Supabase aún no está listo');
          return of(false);
        }
        return from(AuthService.supabaseInstance.auth.getSession()).pipe(
          map(({ data }) => {
            console.log('Sesión obtenida:', data);
            const isAuthenticated = !!data.session;
            this.loading$.next(false); // Fin de carga tras autenticación
            return isAuthenticated;
          })
        );
      }),
      catchError((err) => {
        console.error('Error en estaAutenticado:', err);
        this.loading$.next(false);
        return of(false);
      })
    );
  }
  
}
