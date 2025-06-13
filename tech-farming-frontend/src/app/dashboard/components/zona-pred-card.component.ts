import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Summary, Trend } from '../../models';
import { SummaryCardComponent } from '../../predicciones/components/summary-card.component';
import { TrendCardComponent, Trend as UITrend } from '../../predicciones/components/trend-card.component';

@Component({
  selector: 'app-zona-pred-card',
  standalone: true,
  imports: [CommonModule, SummaryCardComponent, TrendCardComponent],
  template: `
    <div class="card bg-base-100 border border-base-200 shadow-sm p-4 space-y-4">
      <h3 class="text-lg font-semibold">{{ zonaNombre }}</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ng-container *ngFor="let p of preds">
          <div class="space-y-2">
            <h4 class="font-medium text-sm">{{ p.parametro }}</h4>
            <app-summary-card [summary]="p.summary" [projectionLabel]="projectionLabel"></app-summary-card>
            <app-trend-card [trend]="mapTrend(p.trend)"></app-trend-card>
          </div>
        </ng-container>
      </div>
    </div>
  `,
})
export class ZonaPredCardComponent {
  @Input() zonaNombre = '';
  @Input() projectionLabel = '';
  @Input() preds: Array<{ parametro: string; summary: Summary; trend: Trend }> = [];

  mapTrend(api: Trend): UITrend {
    let type: UITrend['type'] = 'stable';
    if (api.icon === 'arrow-up') type = 'up';
    if (api.icon === 'arrow-down') type = 'down';
    return { title: api.text, message: api.comparison, type };
  }
}
