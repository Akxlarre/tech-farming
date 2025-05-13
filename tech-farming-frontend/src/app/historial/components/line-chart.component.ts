// src/app/historial/components/line-chart.component.ts
import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  AfterViewInit,
  ViewChild,
  ElementRef,
  OnDestroy,
  Inject,
  PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import Chart, { ChartConfiguration, ChartType } from 'chart.js/auto';

@Component({
  selector: 'app-line-chart',
  standalone: true,
  imports: [CommonModule],
  template: `<canvas #chartCanvas *ngIf="isBrowser"></canvas>`,
  styles: [`
    :host { display: block; height: 100%; }
    canvas { width: 100% !important; height: 100% !important; }
  `]
})
export class LineChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('chartCanvas', { static: false }) canvas!: ElementRef<HTMLCanvasElement>;

  @Input() data: Array<{ timestamp: string; value: number }> = [];
  @Input() label = '';

  isBrowser: boolean;
  private chart?: Chart;

  constructor(@Inject(PLATFORM_ID) private platformId: any) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngAfterViewInit() {
    if (!this.isBrowser) return;
    if (!this.canvas) {
      console.error('[LineChart] Canvas ElementRef is undefined');
      return;
    }
    console.log('[LineChart] initChart, data:', this.data, 'label:', this.label);
    this.initChart();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.chart) return;

    if (changes['data'] && !changes['data'].firstChange) {
      console.log('[LineChart] updateChart with new data:', this.data);
      this.updateChart();
    }
    if (changes['label'] && !changes['label'].firstChange) {
      console.log('[LineChart] updateChart label:', this.label);
      this.chart.data.datasets[0].label = this.label;
      (this.chart.options.scales!['y'] as any).title.text = this.label;
      this.chart.update();
    }
  }

  ngOnDestroy() {
    console.log('[LineChart] ngOnDestroy, destroying chart');
    this.chart?.destroy();
  }

  private initChart() {
    const ctx = this.canvas.nativeElement.getContext('2d')!;
    const cfg: ChartConfiguration = {
      type: 'line' as ChartType,
      data: {
        labels: this.data.map(d => new Date(d.timestamp).toLocaleDateString()),
        datasets: [{
          label: this.label,
          data: this.data.map(d => d.value),
          fill: false,
          tension: 0.2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { title: { display: true, text: 'Fecha' } },
          y: { title: { display: true, text: this.label } }
        },
        plugins: { legend: { display: true } }
      }
    };

    this.chart = new Chart(ctx, cfg);
  }

  private updateChart() {
    const labels = this.data.map(d => new Date(d.timestamp).toLocaleDateString());
    const values = this.data.map(d => d.value);
    this.chart!.data.labels = labels;
    this.chart!.data.datasets[0].data = values;
    this.chart!.update();
  }
}
