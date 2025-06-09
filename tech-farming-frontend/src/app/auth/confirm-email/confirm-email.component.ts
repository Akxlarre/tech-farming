import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../services/supabase.service';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-confirm-email',
  imports: [CommonModule, RouterModule],
  template: `
    <div class="flex items-center justify-center min-h-screen">
      <div class="text-center space-y-4">
        <h2 class="text-2xl font-bold">📧 Confirmando cambio...</h2>
        <p *ngIf="estado === 'ok'" class="text-success">¡Tu correo fue actualizado correctamente!</p>
        <p *ngIf="estado === 'error'" class="text-error">Hubo un problema al confirmar el cambio de correo.</p>
        <div class="mt-4">
          <button class="btn btn-success" routerLink="/">Ir al dashboard</button>
        </div>
      </div>
    </div>
  `
})
export class ConfirmEmailComponent implements OnInit {
  private supabase = inject(SupabaseService).supabase;
  estado: 'ok' | 'error' | null = null;

  async ngOnInit() {
    try {
      const { error } = await this.supabase.auth.getSession();
      this.estado = error ? 'error' : 'ok';
    } catch {
      this.estado = 'error';
    }
  }
}
