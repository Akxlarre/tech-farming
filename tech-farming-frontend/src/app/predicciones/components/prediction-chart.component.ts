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
  import Chart, { ChartConfiguration, ChartType } from 'chart.js/auto';
  
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
  
      // Extraer colores de DaisyUI
      const styles    = getComputedStyle(document.documentElement);
      const histColor = styles.getPropertyValue('--p-primary').trim()      || '#3B82F6';
      const futColor  = styles.getPropertyValue('--p-secondary').trim()    || '#F59E0B';
      const textColor = styles.getPropertyValue('--p-base-content').trim() || '#111827';
      const gridColor = styles.getPropertyValue('--p-base-300').trim()     || '#E5E7EB';
  
      const cfg: ChartConfiguration = {
        type: 'line' as ChartType,
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
              backgroundColor: histColor,
              tension: 0.3,
              fill: false,
              pointRadius: 2
            },
            {
              label: 'Predicción',
              data: Array(this.historical.length).fill(null).concat(this.future.map(p => p.value)),
              borderColor: futColor,
              backgroundColor: futColor,
              borderDash: [5,5],
              tension: 0.3,
              fill: false,
              pointRadius: 3
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              title: { display: true, text: 'Fecha / Hora', color: textColor },
              ticks: { color: textColor },
              grid:  { color: gridColor }
            },
            y: {
              title: { display: true, text: this.label, color: textColor },
              ticks: { color: textColor },
              grid:  { color: gridColor }
            }
          },
          plugins: {
            legend: {
              labels: { color: textColor }
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
  }
  