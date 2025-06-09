// src/app/predicciones/components/trend-card.component.ts

import { Component, Input } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { MatCardModule }     from '@angular/material/card';
import { MatTooltipModule }  from '@angular/material/tooltip';

export interface Trend {
  /** Texto principal: “Tendencia al alza” / “Tendencia a la baja” / “Estable” */
  title:   string;
  /** Porcentaje de cambio: p.ej. “5.8%” */
  message: string;
  /** Tipo básico: 'up' | 'down' | 'stable' */
  type:    'up' | 'down' | 'stable';
}

@Component({
  selector: 'app-trend-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTooltipModule],
  template: `
    <mat-card class="trend-card h-full bg-base-100 p-6 rounded-lg shadow-sm flex flex-col">
      <!-- HEADER -->
      <div class="flex items-center mb-4">
        <div class="icon-wrapper mr-3" [ngClass]="riskBgClass">
          <i [ngClass]="iconClass"></i>
        </div>
        <h2 class="text-xl font-semibold">Tendencia</h2>
        <i
          class="fas fa-info-circle ml-2 text-sm text-gray-500"
          matTooltip="Este porcentaje compara el promedio de las próximas horas vs. el promedio de las últimas horas."
          matTooltipPosition="above"
        ></i>
      </div>

      <!-- CUERPO -->
      <div class="flex-1">
        <p class="text-lg font-medium mb-2" [ngClass]="riskMsgClass">
          {{ trend?.title }} ({{ trend?.message }})
        </p>
        <p *ngIf="extraContext" class="text-sm text-neutral-content">
          {{ extraContext }}
        </p>
      </div>
    </mat-card>
  `,
  styles: [`
    :host { display: block; height: 100%; }
    .trend-card { border: 1px solid var(--p-base-200); }

    .icon-wrapper {
      width: 3rem; height: 3rem;
      display: flex; align-items: center; justify-content: center;
      border-radius: 9999px; font-size: 1.25rem;
    }

    /* Semáforo por nivel de riesgo */
    .bg-success { background: var(--p-success-100); color: var(--p-success); }
    .bg-warning { background: var(--p-warning-100); color: var(--p-warning); }
    .bg-error   { background: var(--p-error-100);   color: var(--p-error);   }

    /* Color del mensaje según riesgo */
    .msg-success { color: var(--p-success); }
    .msg-warning { color: var(--p-warning); }
    .msg-error   { color: var(--p-error);   }
  `]
})
export class TrendCardComponent {
  @Input() trend?: Trend;

  /** Icono según tipo up/down/stable */
  get iconClass() {
    if (this.trend?.type === 'up')    return 'fas fa-arrow-up';
    if (this.trend?.type === 'down')  return 'fas fa-arrow-down';
    return 'fas fa-minus';
  }

  /** Nivel de riesgo según porcentaje absoluto */
  private get pct(): number {
    if (!this.trend) return 0;
    const num = parseFloat(this.trend.message.replace('%',''));
    return isNaN(num) ? 0 : Math.abs(num);
  }

  /** Contexto extra: “Moderado”, “Alto”, etc. */
  get extraContext(): string {
    if (this.pct >= 10) return 'Alta variación esperada';
    if (this.pct >= 5)  return 'Variación moderada';
    return 'Variación baja';
  }

  /** Clase de fondo del icon‐wrapper según riesgo */
  get riskBgClass(): string {
    if (this.pct >= 10) return 'bg-error';
    if (this.pct >= 5)  return 'bg-warning';
    return 'bg-success';
  }

  /** Clase del texto principal según riesgo */
  get riskMsgClass(): string {
    if (this.pct >= 10) return 'msg-error';
    if (this.pct >= 5)  return 'msg-warning';
    return 'msg-success';
  }
}
