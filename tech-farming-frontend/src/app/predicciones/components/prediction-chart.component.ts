// src/app/predicciones/components/prediction-chart.component.ts
import {
    Component,
    Input,
    AfterViewInit,
    OnChanges,
    SimpleChanges,
    ViewChild,
    ElementRef,
    OnDestroy,
    Inject,
    PLATFORM_ID
  } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import Chart, { ChartConfiguration } from 'chart.js/auto';

  export interface SeriesPoint {
    timestamp: string;
    value: number;
  }

  @Component({
    selector: 'app-prediction-chart',
    standalone: true,
    imports: [CommonModule],
    template: `
      <canvas #canvas class="w-full h-full"></canvas>
    `,
    styles: [`
      :host { display: block; height: 100%; }
      canvas { width: 100% !important; height: 100% !important; }
    `]
  })
  export class PredictionChartComponent implements AfterViewInit, OnChanges, OnDestroy {
    @ViewChild('canvas', { static: false }) canvas!: ElementRef<HTMLCanvasElement>;

    /** Datos históricos y futuros */
    @Input() historical: SeriesPoint[] = [];
    @Input() future:     SeriesPoint[] = [];
    /** Etiqueta fija para eje Y */
    @Input() label = '';

    isBrowser: boolean;
    private chart!: Chart;

    constructor(@Inject(PLATFORM_ID) private platformId: any) {
      this.isBrowser = isPlatformBrowser(this.platformId);
    }

    ngAfterViewInit() {
      if (this.isBrowser) {
        this.initChart();
      }
    }

    ngOnChanges(chg: SimpleChanges) {
      // Sólo refresca datos, no toca opciones
      if (!this.chart || !this.isBrowser) return;
      if ((chg['historical'] && !chg['historical'].firstChange) ||
          (chg['future']     && !chg['future'].firstChange)) {
        this.updateData();
      }
    }

    ngOnDestroy() {
      if (this.isBrowser && this.chart) {
        this.chart.destroy();
      }
    }

  private initChart() {
    const ctx = this.canvas.nativeElement.getContext('2d')!;

    const histColor = this.getCSSVar('--color-success', '#22c55e');
    const futColor  = this.getCSSVar('--color-info', '#0ea5e9');
    const baseColor = this.getCSSVar('--color-base-content', '#374151');

    const cfg: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels: [
          ...this.historical.map(p => new Date(p.timestamp).toLocaleString()),
          ...this.future.map(p => new Date(p.timestamp).toLocaleString())
        ],
        datasets: [
          {
            label: 'Histórico',
            data: this.historical.map(p => p.value),
            borderColor: histColor,
            backgroundColor: histColor + '33',
            fill: false,
            tension: 0.3,
            pointRadius: 2
          },
          {
            label: 'Predicción',
            data: Array(this.historical.length).fill(null).concat(this.future.map(p => p.value)),
            borderColor: futColor,
            backgroundColor: futColor,
            borderDash: [5, 5],
            fill: false,
            tension: 0.3,
            pointRadius: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: { left: 16, right: 16, top: 0, bottom: 0 }
        },
        interaction: { mode: 'nearest', axis: 'x', intersect: false },
        scales: {
          x: {
            offset: true,
            title: { display: true, text: 'Fecha / Hora', color: baseColor },
            ticks: { color: baseColor, maxTicksLimit: 6, autoSkip: true },
            grid: { color: baseColor + '20' }
          },
          y: {
            title: { display: true, text: this.label, color: baseColor },
            ticks: { color: baseColor },
            grid: { color: baseColor + '20' }
          }
        },
        plugins: {
          legend: { labels: { color: baseColor } },
          tooltip: {
            backgroundColor: 'rgba(0,0,0,0.8)',
            titleFont: { size: 14 },
            bodyFont: { size: 13 },
            padding: 8,
            cornerRadius: 6,
            displayColors: false,
            callbacks: {
              label: ctx => ctx.formattedValue
            }
          }
        }
      }
    };

    this.chart = new Chart(ctx, cfg);
    }

  private updateData() {
    const hist   = this.historical.map(p => p.value);
    const fut    = this.future.map(p => p.value);
      const labels = [
        ...this.historical.map(p => new Date(p.timestamp).toLocaleString()),
        ...this.future.map(p => new Date(p.timestamp).toLocaleString())
      ];

      this.chart.data.labels           = labels;
      this.chart.data.datasets[0].data = hist;
    this.chart.data.datasets[1].data = Array(hist.length).fill(null).concat(fut);
    this.chart.update();
  }

  private getCSSVar(name: string, fallback: string): string {
    const v = getComputedStyle(document.documentElement)
                .getPropertyValue(name).trim();
    return v || fallback;
  }
}
