// src/app/predicciones/components/summary-card.component.ts

import { Component, Input } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { Summary }           from '../../models';

@Component({
  selector: 'app-summary-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="summary-card card relative overflow-hidden h-full bg-base-100 p-6 rounded-xl shadow-sm flex flex-col hover:shadow-md hover:-translate-y-1 transition"
    >
      <div class="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 pointer-events-none"></div>

      <ng-container *ngIf="summary; else noSummaryTpl">
        <div class="relative z-10 flex items-center mb-4">
          <i class="fas fa-chart-bar text-accent text-2xl mr-2"></i>
          <h2 class="text-xl font-semibold">Resumen Predictivo</h2>
        </div>

        <div class="relative z-10 flex-1 space-y-2">
          <p>
            <strong>Última medida:</strong>
            {{ summary.lastValue != null ? summary.lastValue.toFixed(2) : '—' }}
          </p>
          <p>
            <strong>Predicción ({{ projectionLabel }}):</strong>
            {{ summary.prediction != null ? summary.prediction.toFixed(2) : '—' }}
          </p>
          <p>
            <strong>Rango histórico:</strong>
            [
              {{ summary.histMin != null ? summary.histMin.toFixed(1) : '—' }}
              –
              {{ summary.histMax != null ? summary.histMax.toFixed(1) : '—' }}
            ]
          </p>
          <p>
            <strong>Variación:</strong>
            {{ summary.diff != null
               ? (summary.diff >= 0 ? '+' : '') + summary.diff.toFixed(2)
               : '—'
            }}
          </p>
          <p *ngIf="summary.action" class="text-sm text-primary">
            {{ summary.action }}
          </p>
        </div>
      </ng-container>

      <ng-template #noSummaryTpl>
        <div class="relative z-10 text-gray-400 italic p-4 text-center">
          No hay un resumen disponible.
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }
    .summary-card { border: 1px solid var(--p-base-200); }
    .text-primary { color: var(--p-primary); }
  `]
})
export class SummaryCardComponent {
  @Input() summary?: Summary;
  @Input() projectionLabel: string = '';
}
