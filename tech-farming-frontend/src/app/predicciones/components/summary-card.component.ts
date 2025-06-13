// src/app/predicciones/components/summary-card.component.ts

import { Component, Input } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { Summary }           from '../../models';

@Component({
  selector: 'app-summary-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ng-container *ngIf="summary; else noSummaryTpl">
      <div
        class="card w-full bg-base-100 shadow-lg rounded-lg p-4
               hover:shadow-xl hover:-translate-y-1 transition-transform transition-shadow
               focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <h4 class="font-semibold mb-2 text-center break-words" *ngIf="param">{{ param }}</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Última medida -->
          <div class="flex flex-col">
            <span class="text-lg font-medium">Última medida</span>
            <span class="text-2xl font-bold whitespace-nowrap">
              {{ summary.lastValue != null ? (summary.lastValue | number:'1.2-2') : '—' }} {{ unit }}
            </span>
          </div>
          <!-- Predicción -->
          <div class="flex flex-col">
            <span class="text-lg font-medium">Predicción ({{ projectionLabel }})</span>
            <span class="text-2xl font-bold whitespace-nowrap">
              {{ summary.prediction != null ? (summary.prediction | number:'1.2-2') : '—' }} {{ unit }}
            </span>
          </div>
          <!-- Rango histórico -->
          <div class="flex flex-col">
            <span class="text-lg font-medium">Rango histórico</span>
            <span class="text-2xl font-bold whitespace-nowrap">
              [{{ summary.histMin != null ? (summary.histMin | number:'1.1-1') : '—' }}
               – {{ summary.histMax != null ? (summary.histMax | number:'1.1-1') : '—' }}]
            </span>
          </div>
          <!-- Variación -->
          <div class="flex flex-col">
            <span class="text-lg font-medium">Variación</span>
            <span
              class="text-2xl font-bold whitespace-nowrap"
              [ngClass]="{
                'text-success': summary.diff != null && summary.diff > 0,
                'text-error':   summary.diff != null && summary.diff < 0
              }"
            >
              {{ summary.diff != null ? (summary.diff | number:'1.2-2') : '—' }}
            </span>
            <span *ngIf="summary.action" class="text-sm text-gray-500">
              {{ summary.action }}
            </span>
          </div>
        </div>
      </div>
    </ng-container>

    <ng-template #noSummaryTpl>
      <div class="text-gray-400 italic p-4 text-center">
        No hay un resumen disponible.
      </div>
    </ng-template>
  `,
  styles: [`
    :host { display: block; height: 100%; }
  `]
})
export class SummaryCardComponent {
  @Input() summary?: Summary;
  @Input() projectionLabel: string = '';
  @Input() param?: string;
  get unit(): string {
    if (!this.param) return '°C';
    const p = this.param.toLowerCase();
    if (p.includes('hum')) return '%';
    if (p.includes('nitr')) return 'ppm';
    if (p.includes('fósfo') || p === 'p') return 'mg/kg';
    if (p.includes('potas') || p === 'k') return 'mg/kg';
    return '°C';
  }
}
