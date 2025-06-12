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
      <div class="stats bg-base-100 shadow-lg rounded-lg p-4">
        <div class="stat">
          <div class="stat-title text-lg font-medium">Última medida</div>
          <div class="stat-value text-xl font-bold">
            {{ summary.lastValue != null ? summary.lastValue.toFixed(2) : '—' }} °C
          </div>
        </div>
        <div class="stat">
          <div class="stat-title text-lg font-medium">Predicción ({{ projectionLabel }})</div>
          <div class="stat-value text-xl font-bold">
            {{ summary.prediction != null ? summary.prediction.toFixed(2) : '—' }} °C
          </div>
        </div>
        <div class="stat">
          <div class="stat-title text-lg font-medium">Rango histórico</div>
          <div class="stat-value">
            [{{ summary.histMin != null ? summary.histMin.toFixed(1) : '—' }} – {{ summary.histMax != null ? summary.histMax.toFixed(1) : '—' }}]
          </div>
        </div>
        <div class="stat">
          <div class="stat-title text-lg font-medium">Variación</div>
          <div class="stat-value text-xl font-bold" [ngClass]="{'text-error': summary.diff != null && summary.diff < 0}">
            {{ summary.diff != null ? summary.diff.toFixed(2) : '—' }}
          </div>
          <div class="stat-desc text-sm" *ngIf="summary.action">{{ summary.action }}</div>
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
}
