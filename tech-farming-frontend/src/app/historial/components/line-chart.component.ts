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
import Chart, { ChartConfiguration } from 'chart.js/auto';

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
  private chart?: Chart<'line'>;
  private themeObserver?: MutationObserver;

  constructor(@Inject(PLATFORM_ID) private platformId: any) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    console.log('[LineChart] constructor → isBrowser=', this.isBrowser);
  }

  ngAfterViewInit() {
    if (!this.isBrowser) return;
    console.log('[LineChart] ngAfterViewInit → renderChart()');
    this.renderChart();

    // Observamos cambios en data-theme de <html> para actualizar colores
    this.themeObserver = new MutationObserver(muts => {
      console.log('[LineChart] theme changed', muts);
      this.applyThemeColors();
    });
    this.themeObserver.observe(
      document.documentElement,
      { attributes: true, attributeFilter: ['data-theme'] }
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('[LineChart] ngOnChanges', changes);
    if (!this.chart) return;

    if (changes['data'] && !changes['data'].firstChange) {
      console.log('[LineChart] data changed → updateChartData()');
      this.updateChartData();
    }
    if (changes['label'] && !changes['label'].firstChange) {
      console.log('[LineChart] label changed →', this.label);
      this.chart.data.datasets[0].label = this.label;
      (this.chart.options.scales!['y']!.title as any).text = this.label;
      this.chart.update();
    }
  }

  ngOnDestroy() {
    console.log('[LineChart] ngOnDestroy → cleaning up');
    this.chart?.destroy();
    this.themeObserver?.disconnect();
  }

  private renderChart() {
    console.log('[LineChart] renderChart → buildConfig()');
    const ctx = this.canvas.nativeElement.getContext('2d')!;
    this.chart = new Chart(ctx, this.buildConfig());
    console.log('[LineChart] chart initialized');
  }

  private updateChartData() {
    if (!this.chart) return;
    console.log('[LineChart] updateChartData →', this.data);

    const labels = this.data.map(d =>
      new Date(d.timestamp).toLocaleDateString('es-ES', { month: 'short', day: '2-digit' })
    );
    const values = this.data.map(d => d.value);

    this.chart.data.labels  = labels;
    this.chart.data.datasets[0].data = values;
    this.applyThemeColors();
    this.chart.update();
    console.log('[LineChart] chart updated with new data');
  }

  private buildConfig(): ChartConfiguration<'line'> {
    // Detectamos tema actual (light/dark)
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    console.log('[LineChart] buildConfig → isDark=', isDark);

    // Extraemos colores de Tailwind (DaisyUI los cambia con data-theme)
    const colorSuccess = this.getCSSVar('--color-success', '#22c55e');
    const colorBase    = this.getCSSVar('--color-base-content', isDark ? '#f9fafb' : '#374151');
    console.log('[LineChart] Tailwind colors → success=', colorSuccess, ', base-content=', colorBase);

    // Preparamos etiquetas y valores
    const labels = this.data.map(d =>
      new Date(d.timestamp).toLocaleDateString('es-ES', { month: 'short', day: '2-digit' })
    );
    const values = this.data.map(d => d.value);

    return {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: this.label,
          data: values,
          borderColor: colorSuccess,
          backgroundColor: colorSuccess + '33',
          fill: false,
          tension: 0.3,
          pointRadius: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,

        // ───── Reservamos 16px a izquierda y derecha dentro del gráfico ─────
        layout: {
          padding: {
            left: 16,
            right: 16,
            top: 0,
            bottom: 0
          }
        },

        interaction: { mode: 'nearest', axis: 'x', intersect: false },
        scales: {
          x: {
            offset: true,   // asegura espacio extra entre primer/última etiqueta y el borde
            title: { display: true, text: 'Fecha', color: colorBase },
            ticks: { color: colorBase, maxTicksLimit: 6, autoSkip: true },
            grid:  { color: colorBase + '20' }
          },
          y: {
            title: { display: true, text: this.label, color: colorBase },
            ticks: { color: colorBase },
            grid:  { color: colorBase + '20' }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(0,0,0,0.8)',
            titleFont: { size: 14 },
            bodyFont: { size: 13 },
            padding: 8,
            cornerRadius: 6,
            displayColors: false,
            callbacks: {
              label: ctx => {
                const val = ctx.formattedValue;
                const date = new Date(ctx.label as string).toLocaleString('es-ES', {
                  weekday: 'short', day: '2-digit',
                  month: 'short', hour: '2-digit', minute: '2-digit'
                });
                return [`${this.label}: ${val}`, `Hora: ${date}`];
              }
            }
          }
        }
      }
    };
  }

  private applyThemeColors() {
    if (!this.chart) return;
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const colorBase = this.getCSSVar('--color-base-content', isDark ? '#f9fafb' : '#374151');
    console.log('[LineChart] applyThemeColors → isDark=', isDark, ', base-content=', colorBase);

    const scales = this.chart.options.scales!;
    (scales['x'] as any).title.color = colorBase;
    (scales['y'] as any).title.color = colorBase;
    (scales['x'] as any).ticks.color = colorBase;
    (scales['y'] as any).ticks.color = colorBase;
    (scales['x'] as any).grid.color  = colorBase + '20';
    (scales['y'] as any).grid.color  = colorBase + '20';

    this.chart.update();
    console.log('[LineChart] chart.update() after theme change');
  }

  private getCSSVar(name: string, fallback: string): string {
    const v = getComputedStyle(document.documentElement)
                  .getPropertyValue(name).trim();
    return v || fallback;
  }
}
