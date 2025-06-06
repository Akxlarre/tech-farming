import {
  Component,
  Input,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, ChartConfiguration, ChartItem, registerables, TooltipItem } from 'chart.js/auto';

// Registrar todos los módulos necesarios de Chart.js
Chart.register(...registerables);

@Component({
  selector: 'app-line-chart',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative w-full h-full">
      <canvas #chartCanvas class="w-full h-full"></canvas>

      <!-- Spinner mientras el gráfico no está listo -->
      <div *ngIf="!chartReady" class="absolute inset-0 flex items-center justify-center bg-base-200">
        <span class="loading loading-spinner text-success"></span>
      </div>
    </div>
  `,
})
export class LineChartComponent implements OnInit, AfterViewInit {
  @Input() labels!: string[];    // Por ejemplo: ['00:00','01:00',...]
  @Input() data!: number[];      // Por ejemplo: [22,24,23,...]
  @Input() variable!: 'Temperatura' | 'Humedad' | 'Nitrógeno';
  @Input() intervalo!: 6 | 12 | 24;

  @ViewChild('chartCanvas', { static: false })
  chartCanvas!: ElementRef<HTMLCanvasElement>;

  private chartInstance!: Chart<'line', number[], string>;
  public chartReady = false;

  ngOnInit(): void {
    // No se crea el gráfico aquí porque el canvas aún no está en el DOM
  }

  ngAfterViewInit(): void {
    // Crear el gráfico cuando el canvas esté disponible
    this.createChart();
  }

  private createChart(): void {
    const ctx = this.chartCanvas.nativeElement.getContext('2d') as ChartItem;
    const isDarkMode = document.documentElement.classList.contains('dark');

    // Obtener colores de variables CSS definidas por DaisyUI / Tailwind
    const successColor = this.getTailwindColor('--color-success') || '#2B6B4A';
    const infoColor = this.getTailwindColor('--color-info') || '#3182CE';
    const secondaryColor = this.getTailwindColor('--color-secondary') || '#4C51BF';
    const baseTextColor =
      this.getTailwindColor('--color-base-content') ||
      (isDarkMode ? '#FFFFFF' : '#333333');

    // Elegir color según la variable actual
    let borderColor = successColor;
    let backgroundColor = this.hexToRgba(successColor, 0.2);

    if (this.variable === 'Humedad') {
      borderColor = infoColor;
      backgroundColor = this.hexToRgba(infoColor, 0.2);
    } else if (this.variable === 'Nitrógeno') {
      borderColor = secondaryColor;
      backgroundColor = this.hexToRgba(secondaryColor, 0.2);
    }

    const config: ChartConfiguration<'line', number[], string> = {
      type: 'line',
      data: {
        labels: this.labels,
        datasets: [
          {
            label: this.getLabelWithUnit(),
            data: this.data,
            borderColor: borderColor,
            backgroundColor: backgroundColor,
            borderWidth: 2,
            fill: true,
            tension: 0.3,
            pointRadius: 2,
            pointHoverRadius: 5,
            pointHoverBorderWidth: 2,
            pointHoverBackgroundColor: borderColor,
            pointHoverBorderColor: baseTextColor,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false,
        },
        hover: {
          mode: 'index',
          intersect: false,
        },
        scales: {
          x: {
            display: true,
            grid: {
              display: false
            },
            ticks: {
              autoSkip: true,
              maxRotation: 0,
              maxTicksLimit: 6,
              color: baseTextColor,
              font: { family: 'Inter, sans-serif', size: 12, weight: 500 }
            },
          },
          y: {
            display: true,
            grace: '10%',
            grid: {
              color: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
            },
            ticks: {
              color: baseTextColor,
              stepSize: 5,
              font: { family: 'Inter, sans-serif', size: 12, weight: 500 }
            },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.7)',
            titleFont: { size: 14, family: 'Inter, sans-serif', weight: 600 },
            bodyFont: { size: 13, family: 'Inter, sans-serif', weight: 500 },
            padding: 10,
            cornerRadius: 6,
            displayColors: false,
            callbacks: {
              title: (items: TooltipItem<'line'>[]) => {
                const labelX = items[0].label;
                return `Hora: ${labelX}`;
              },
              label: (ctx: TooltipItem<'line'>) => {
                const rawValue = ctx.parsed.y;
                const unidad = this.getUnidad(this.variable);
                return `${this.variable}: ${rawValue} ${unidad}`;
              },
            },
          },
        },
      },
    };

    this.chartInstance = new Chart(ctx, config);

    // Una vez creado, ocultamos el spinner
    this.chartReady = true;
  }

  /**
   * Devuelve la etiqueta del dataset con fuerza y unidad apropiada.
   */
  private getLabelWithUnit(): string {
    if (this.variable === 'Humedad') return 'Humedad (%)';
    if (this.variable === 'Nitrógeno') return 'Nitrógeno (ppm)';
    return 'Temperatura (°C)';
  }

  /**
   * Obtiene la unidad de la variable para el tooltip.
   */
  private getUnidad(variable: 'Temperatura' | 'Humedad' | 'Nitrógeno'): string {
    if (variable === 'Humedad') return '%';
    if (variable === 'Nitrógeno') return 'ppm';
    return '°C';
  }

  /**
   * Convierte un color en hex (#RRGGBB o #RGB) + alpha en formato rgba().
   */
  private hexToRgba(hex: string, alpha: number): string {
    let c = hex.replace('#', '');
    if (c.length === 3) {
      c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
    }
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  /**
   * Recupera el valor de una variable CSS (p. ej. --color-success) definida en :root.
   */
  private getTailwindColor(varName: string): string | null {
    const val = getComputedStyle(document.documentElement).getPropertyValue(varName);
    return val ? val.trim() : null;
  }

  /**
   * Permite actualizar los datos (invocado desde el componente padre).
   */
  public actualizarData(
    nuevasLabels: string[],
    nuevosValores: number[],
    nuevaVariable: 'Temperatura' | 'Humedad' | 'Nitrógeno'
  ): void {
    this.labels = nuevasLabels;
    this.data = nuevosValores;
    this.variable = nuevaVariable;

    // Si el gráfico aún no se ha inicializado, créalo ahora
    if (!this.chartInstance) {
      this.createChart();
      return;
    }

    // Reconfigurar dataset
    let borderColor = '#2B6B4A';
    let backgroundColor = this.hexToRgba('#2B6B4A', 0.2);

    if (this.variable === 'Humedad') {
      borderColor = '#3182CE';
      backgroundColor = this.hexToRgba('#3182CE', 0.2);
    } else if (this.variable === 'Nitrógeno') {
      borderColor = '#4C51BF';
      backgroundColor = this.hexToRgba('#4C51BF', 0.2);
    }

    this.chartInstance.data.labels = this.labels;
    this.chartInstance.data.datasets[0].data = this.data;
    this.chartInstance.data.datasets[0].label = this.getLabelWithUnit();
    this.chartInstance.data.datasets[0].borderColor = borderColor;
    this.chartInstance.data.datasets[0].backgroundColor = backgroundColor;
    this.chartInstance.update();
  }
}
