// src/app/predicciones/components/trend-card.component.ts

import { Component, Input } from '@angular/core';
import { CommonModule }      from '@angular/common';

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
  imports: [CommonModule, TrendGaugeComponent],
  template: `
    <div
      class="card w-full sm:w-48 bg-base-100 shadow-lg rounded-lg p-4 flex flex-col items-center gap-2 hover:shadow-xl hover:-translate-y-1 transition-transform transition-shadow focus:ring-2 focus:ring-primary"
    >
      <app-trend-gauge [pct]="pct" [size]="40"></app-trend-gauge>
      <h4 class="text-lg font-medium">Tendencia</h4>
      <p class="text-xl font-bold flex items-center gap-1" [ngClass]="riskMsgClass">
        <i [class]="trendIcon"></i>
        {{ pct | number:'1.0-1' }}%
      </p>
      <p *ngIf="action" class="text-sm text-gray-500/75 text-center">{{ action }}</p>
    </div>
  `,
  styles: [`
    :host { display: block; }

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

  /** Icono según la tendencia */
  get trendIcon(): string {
    switch (this.trend?.type) {
      case 'up':
        return 'fas fa-arrow-up text-success';
      case 'down':
        return 'fas fa-arrow-down text-error';
      default:
        return 'fas fa-minus text-warning';
    }
  }
}
