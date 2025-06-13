import { inject, Injectable, NgZone } from '@angular/core';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

function loadSupabaseKey(): string {
  if (typeof window !== 'undefined' && (window as any).SUPABASE_KEY) {
    return (window as any).SUPABASE_KEY as string;
  }
  if (typeof process !== 'undefined' && process.env && process.env['SUPABASE_KEY']) {
    return process.env['SUPABASE_KEY'] as string;
  }
  throw new Error('SUPABASE_KEY not defined');
}

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  public supabase!: SupabaseClient;
  private readonly ngZone = inject(NgZone);

  constructor() {
    this.supabase = this.ngZone.runOutsideAngular(() =>
      createClient(environment.supabaseUrl, loadSupabaseKey())
    );
  }
}
