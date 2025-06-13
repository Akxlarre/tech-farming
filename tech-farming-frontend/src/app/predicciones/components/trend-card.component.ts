// src/app/predicciones/components/trend-card.component.ts

import { Component, Input } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { MatCardModule }     from '@angular/material/card';

import { TrendGaugeComponent } from './trend-gauge.component';

export interface Trend {
  /** “Tendencia al alza” / “Tendencia a la baja” / “Estable” */
  title:   string;
  /** Porcentaje de cambio, e.g. “12.0%” */
  message: string;
  /** 'up' | 'down' | 'stable' */
  type:    'up' | 'down' | 'stable';
}

@Component({
  selector: 'app-trend-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    TrendGaugeComponent
  ],
  template: `
    <mat-card class="trend-card h-full bg-base-100 p-6 rounded-lg shadow-sm flex flex-col">
      <!-- HEADER -->
      <div class="flex items-center mb-4">
        <app-trend-gauge [pct]="pct" [size]="48" class="mr-3"></app-trend-gauge>
        <h2 class="text-xl font-semibold">Tendencia</h2>
      </div>

      <!-- CUERPO -->
      <div class="flex-1">
        <!-- Título + porcentaje -->
        <p class="text-lg font-medium mb-2" [ngClass]="riskMsgClass">
          {{ trend?.title }} ({{ trend?.message }})
        </p>

        <!-- Mensaje específico de acción -->
        <p *ngIf="action" class="text-sm font-medium mt-2">
          {{ action }}
        </p>
      </div>
    </mat-card>
  `,
  styles: [`
    :host { display: block; height: 100%; }
    .trend-card { border: 1px solid var(--p-base-200); }

    /* Color del texto según nivel de riesgo */
    .msg-success { color: var(--p-success); }
    .msg-warning { color: var(--p-warning); }
    .msg-error   { color: var(--p-error); }
  `]
})
export class TrendCardComponent {
  @Input() trend?: Trend;
  /** Mensaje a mostrar, p.ej. “Se espera que la temperatura baje de 18 °C en 4 h” */
  @Input() action?: string;

  /** % para el gauge */
  get pct(): number {
    if (!this.trend) return 0;
    const num = parseFloat(this.trend.message.replace('%',''));
    return isNaN(num) ? 0 : num;
  }

  /** Clase de color del texto según el % */
  get riskMsgClass(): string {
    const p = Math.abs(this.pct);
    if (p >= 10) return 'msg-error';
    if (p >= 5)  return 'msg-warning';
    return 'msg-success';
  }
}
