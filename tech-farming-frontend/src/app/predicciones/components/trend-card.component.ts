// src/app/predicciones/components/trend-card.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { MatCardModule }     from '@angular/material/card';

export interface Trend {
  title:   string;
  message: string;
  type:    'up' | 'down' | 'stable';
}

@Component({
  selector: 'app-trend-card',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <mat-card class="trend-card h-full bg-base-100 p-6 rounded-lg shadow-sm flex flex-col">
      <div class="flex flex-col flex-1 relative">
        <!-- Icono + Título arriba -->
        <div class="flex items-center mb-4">
          <div class="icon-wrapper mr-3" [ngClass]="iconBgClass">
            <i [ngClass]="iconClass"></i>
          </div>
          <h2 class="text-xl font-semibold">Tendencia</h2>
        </div>
        <!-- Cuerpo -->
        <div class="flex-1">
          <p class="text-lg font-medium mb-2" [ngClass]="messageClass">
            {{ trend?.title }}
          </p>
          <p *ngIf="trend?.message" class="text-sm text-neutral-content">
            {{ trend?.message }}
          </p>
        </div>
      </div>
    </mat-card>
  `,
  styles: [`
    :host { display: block; height: 100%; }

    .trend-card {
      border: 1px solid var(--p-base-200);
    }

    .icon-wrapper {
      width: 3rem;
      height: 3rem;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 9999px;
      font-size: 1.25rem;
    }
    .bg-up     { background: var(--p-success-100); color: var(--p-success); }
    .bg-down   { background: var(--p-error-100);   color: var(--p-error);   }
    .bg-stable { background: var(--p-base-200);    color: var(--p-primary-content); }

    .msg-up     { color: var(--p-success); }
    .msg-down   { color: var(--p-error);   }
    .msg-stable { color: var(--p-base-content); }
  `]
})
export class TrendCardComponent {
  @Input() trend?: Trend;

  /** Determina el icono según tipo */
  get iconClass(): string {
    switch (this.trend?.type) {
      case 'up':     return 'fas fa-arrow-up';
      case 'down':   return 'fas fa-arrow-down';
      default:       return 'fas fa-minus';
    }
  }

  /** Clase de fondo del icon-wrapper según tipo */
  get iconBgClass(): string {
    switch (this.trend?.type) {
      case 'up':     return 'bg-up';
      case 'down':   return 'bg-down';
      default:       return 'bg-stable';
    }
  }

  /** Clase de color del texto principal según tipo */
  get messageClass(): string {
    switch (this.trend?.type) {
      case 'up':     return 'msg-up';
      case 'down':   return 'msg-down';
      default:       return 'msg-stable';
    }
  }
}
