// src/app/predicciones/components/summary-card.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { MatCardModule }     from '@angular/material/card';

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
    <h2 class="text-xl font-semibold mb-4">Resumen Predictivo</h2>
    <div class="flex-1">
      <p class="text-base mb-2">
        <strong>Actualizado:</strong> {{ summary?.updated }}
      </p>
      <p class="text-base mb-4">{{ summary?.text }}</p>
      <p *ngIf="summary?.action" class="text-sm text-primary">{{ summary?.action }}</p>
    </div>
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
