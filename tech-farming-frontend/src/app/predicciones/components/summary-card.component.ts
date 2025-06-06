// src/app/predicciones/components/summary-card.component.ts

import { Component, Input } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { MatCardModule }     from '@angular/material/card';

// Definición de la interfaz Summary (igual al modelo en TS)
export interface Summary {
  updated: string;
  text:    string;
  action?: string;
}

@Component({
  selector: 'app-summary-card',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <mat-card class="summary-card h-full bg-base-100 p-6 rounded-lg shadow-sm flex flex-col">
      <ng-container *ngIf="summary; else noSummaryTpl">
        <h2 class="text-xl font-semibold mb-4">Resumen Predictivo</h2>
        <div class="flex-1">
          <p class="text-base mb-2">
            <strong>Actualizado:</strong>
            {{ summary.updated | date:'short' }}
          </p>
          <p class="text-base mb-4">{{ summary.text }}</p>
          <p *ngIf="summary.action" class="text-sm text-primary">
            {{ summary.action }}
          </p>
        </div>
      </ng-container>
      <ng-template #noSummaryTpl>
        <div class="text-gray-400 italic p-4 text-center">
          No hay un resumen disponible.
        </div>
      </ng-template>
    </mat-card>
  `,
  styles: [`
    :host { display: block; height: 100%; }
    .summary-card {
      border: 1px solid var(--p-base-200);
    }
    .text-primary {
      color: var(--p-primary);
    }
  `]
})
export class SummaryCardComponent {
  @Input() summary?: Summary;
}
