// src/app/sensores/components/sensor-view-modal.component.ts
import {
  Component, Input, Output, EventEmitter,
  OnInit, OnDestroy,
  ViewChildren, QueryList, ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration } from 'chart.js/auto';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { Sensor } from '../models/sensor.model';
import {
  TimeSeriesService,
  HistorialResponse
} from '../time-series.service';

@Component({
  selector: 'app-sensor-view-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
      <div *ngIf="!loading; else loadingTpl">
      <div
        class="p-6 bg-base-100 rounded-lg shadow-xl w-full
               max-w-md sm:max-w-3xl lg:max-w-4xl
               max-h-[90vh] overflow-y-auto space-y-6"
      >
        <!-- HEADER -->
        <header class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-bold text-success">{{ sensor.nombre }}</h2>
          <button class="btn btn-ghost p-2" (click)="close.emit()">✕</button>
        </header>
  
        <!-- DETALLES / ÚLTIMA LECTURA -->
        <section class="border-t border-base-300 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
          <div class="flex flex-col justify-between h-full space-y-2">
            <div><strong>Descripción:</strong> {{ sensor.descripcion || '—' }}</div>
            <div><strong>Instalado en:</strong> {{ sensor.fecha_instalacion | date:'dd/MM/yyyy' }}</div>
            <div>
              <strong>Ubicación:</strong>
              {{ sensor.invernadero?.nombre || '—' }}
              <span *ngIf="sensor.zona">/ {{ sensor.zona.nombre }}</span>
            </div>
            <div>
              <strong>Estado: </strong>
              <span
                class="badge"
                [ngClass]="{
                  'badge-success': sensor.estado==='Activo',
                  'badge-warning': sensor.estado==='Inactivo',
                  'badge-error':   sensor.estado==='Mantenimiento'
                }"
              >
                {{ sensor.estado }}
              </span>
            </div>
          </div>
          <div>
            <h3 class="text-xl font-medium mb-2">Última lectura</h3>
            <table class="table table-fixed w-full text-sm odd:bg-base-200">
              <thead>
                <tr>
                  <th class="w-1/4">Parámetro</th>
                  <th class="w-1/4">Valor</th>
                  <th class="w-1/4">Unidad</th>
                  <th class="w-1/4">Hora</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let p of sensor.ultimaLectura?.parametros; let i = index">
                  <td>{{ p }}</td>
                  <td>{{ sensor.ultimaLectura?.valores?.[i] }}</td>
                  <td>{{ getUnidad(p) }}</td>
                  <td>{{ sensor.ultimaLectura?.time | date:'short' }}</td>
                </tr>
                <tr *ngIf="!(sensor.ultimaLectura?.parametros?.length)">
                  <td colspan="4" class="text-center">— sin datos —</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
  
        <!-- HISTORIAL -->
        <section class="border-t border-base-300 pt-4 space-y-4">
          <h3 class="text-xl font-medium">Historial</h3>
  
          <!-- BOTONES DE RANGO -->
          <div class="inline-flex rounded-lg bg-base-200 p-1 shadow-inner">
            <button
                *ngFor="let o of rangeOptions"
                (click)="selectRange(o.days)"
                [ngClass]="{
                'bg-success text-success-content shadow-md' : selectedRange === o.days,
                'text-base-content hover:bg-base-300': selectedRange !== o.days
                }"
                class="px-4 py-2 mx-2 text-sm font-medium rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-secondary"
            >
                {{ o.label }}
            </button>
            </div>
  
          <!-- Spinner -->
          <!-- placeholder removed; spinner now handled globally -->
  
          <!-- GRÁFICOS -->
          <ng-container *ngIf="!loading && series.length">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ng-container *ngFor="let serie of series; let idx = index">
                <div>
                  <h4 class="font-medium">{{ serie.parametro }}</h4>
                  <canvas #chartCanvas class="w-full h-48"></canvas>
                  <p class="mt-2 ml-4 text-sm text-base-content/70">
                    Promedio: {{ stats[idx].promedio   | number:'1.2-2' }} ·
                    Mín:      {{ stats[idx].minimo?.value | number:'1.2-2' }} ·
                    Máx:      {{ stats[idx].maximo?.value | number:'1.2-2' }} ·
                    Desv.:    {{ stats[idx].desviacion | number:'1.2-2' }}
                  </p>
                </div>
              </ng-container>
            </div>
          </ng-container>
  
          <div *ngIf="!loading && !series.length" class="text-center text-gray-500">
            No hay datos en el rango seleccionado.
          </div>
        </section>
      </div>
      </div>
      <ng-template #loadingTpl>
        <div class="p-8 text-center">
          <svg class="animate-spin w-8 h-8 text-success mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
        </div>
      </ng-template>
    `
})
export class SensorViewModalComponent implements OnInit, OnDestroy {
  @Input() sensor!: Sensor;
  @Output() close = new EventEmitter<void>();

  @ViewChildren('chartCanvas') chartCanvases!: QueryList<ElementRef<HTMLCanvasElement>>;

  // opciones de rango
  rangeOptions = [
    { label: 'Hoy', days: 0 },
    { label: '5 días', days: 5 },
    { label: '15 días', days: 15 },
    { label: '30 días', days: 30 }
  ];
  selectedRange = 0;

  loading = false;
  series: { parametro: string; points: { timestamp: string; value: number }[] }[] = [];
  stats: Array<{
    promedio: number;
    minimo: { value: number; fecha: string } | null;
    maximo: { value: number; fecha: string } | null;
    desviacion: number;
  }> = [];

  private charts: Chart<'line'>[] = [];
  private liveSub?: Subscription;

  constructor(private tsSvc: TimeSeriesService) { }

  ngOnInit() {
    // al abrir, carga “Hoy” y arranca live si está activo
    this.selectRange(0);
  }

  ngOnDestroy() {
    this.liveSub?.unsubscribe();
    this.charts.forEach(c => c.destroy());
  }

  getUnidad(param: string): string {
    const meta = this.sensor.parametros.find(p => p.nombre === param);
    return meta?.unidad || '';
  }

  selectRange(days: number) {
    // 1) detiene cualquier live anterior
    this.liveSub?.unsubscribe();

    // 2) calcula from/to
    this.selectedRange = days;
    const now = new Date();
    let from: Date;
    if (days === 0) {
      from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else {
      from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    }
    const fromISO = from.toISOString();
    const toISO = now.toISOString();

    // 3) carga historial
    this.loadHistorial(fromISO, toISO).then(() => {
      // 4) si “Hoy” y sensor activo, arranca streaming
      if (days === 0 && this.sensor.estado === 'Activo') {
        this.startLiveUpdates();
      }
    });
  }

  private async loadHistorial(fromISO: string, toISO: string) {
    this.loading = true;
    this.series = [];
    this.stats = [];

    const calls = this.sensor.parametros.map(p =>
      this.tsSvc.getHistorial({
        invernaderoId: this.sensor.invernadero!.id,
        sensorId: this.sensor.id,
        tipoParametroId: p.id,
        desde: fromISO,
        hasta: toISO
      }).toPromise()
    );

    try {
      const results = await Promise.all(calls as Promise<HistorialResponse>[]);
      results.forEach((res, i) => {
        this.series.push({
          parametro: this.sensor.parametros[i].nombre,
          points: res.series
        });
        this.stats.push(res.stats);
      });
      setTimeout(() => this.renderCharts(), 0);
    } catch {
      alert('❌ Error al cargar historial');
    } finally {
      this.loading = false;
    }
  }

  private renderCharts() {
    this.charts.forEach(c => c.destroy());
    this.charts = [];
    const isDarkMode = document.documentElement.classList.contains('dark');
    const color = this.getTailwindColor('--color-success');
    const textbase = this.getTailwindColor('--color-base-content');

    this.chartCanvases.forEach((elRef, idx) => {
      const ctx = elRef.nativeElement.getContext('2d');
      if (!ctx) return;

      const pts = this.series[idx].points;
      const data = pts.map(pt => pt.value);
      const labels = pts.map(pt =>
        new Date(pt.timestamp).toLocaleString('es-ES', {
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit'
        })
      );


    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels,
        datasets: [{
          data,
          label: this.series[idx].parametro,
          borderColor: color,
          backgroundColor: color + '33',
          borderWidth: 2,
          fill: false
        }]
      },
      options: {
        responsive: true,
        aspectRatio: 2,
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        },
        hover: {
          mode: 'index',
          intersect: false
        },
        scales: {
          x: {
            ticks: {
              autoSkip: true,
              maxRotation: 0,
              maxTicksLimit: 6,
              color: isDarkMode ? color : textbase
            }
          },
          y: {
            grace: '10%',
            ticks: {
              color: isDarkMode ? color : textbase
            }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(0,0,0,0.8)',
            titleFont: { size: 14 },
            bodyFont: { size: 13 },
            padding: 10,
            cornerRadius: 6,
            displayColors: false,
            callbacks: {
              label: (ctx) => {
                const label = ctx.dataset.label || '';
                const unidad = this.getUnidad(label);
                const valor = ctx.formattedValue;
                const fecha = new Date(ctx.label).toLocaleString('es-ES', {
                  weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                });
                return [`${label}: ${valor} ${unidad}`, `Hora: ${fecha}`];
              }
            }
          }
        },
        elements: {
          point: { radius: 0 },
          line: { tension: 0.3 }
        }
      }
    };

    this.charts.push(new Chart(ctx, config));
  });
}
  
    private startLiveUpdates() {
  this.liveSub = interval(10_000).pipe(
    switchMap(() => this.tsSvc.getBatchLecturas([this.sensor.id]))
  ).subscribe(batch => {
    const b = batch.find(x => +x.sensor_id === this.sensor.id);
    if (!b) return;

    // 1) actualiza última lectura
    this.sensor.ultimaLectura = {
      parametros: b.parametros,
      valores: b.valores,
      time: b.time || ''
    };

    // 2) sólo si seguimos en “Hoy”, añadimos punto y desplazamos ventana
    if (this.selectedRange !== 0) return;

    b.parametros.forEach((param, i) => {
      const valor = b.valores[i] ?? NaN;
      const time = b.time || new Date().toISOString();
      const si = this.series.findIndex(s => s.parametro === param);
      if (si < 0) return;

      // push a data + chart
      this.series[si].points.push({ timestamp: time, value: valor });
      const chart = this.charts[si];
      chart.data.labels!.push(new Date(time).toLocaleString());
      (chart.data.datasets[0].data as number[]).push(valor);

      // mantener máximo 200 puntos
      if (chart.data.labels!.length > 200) {
        chart.data.labels!.shift();
        (chart.data.datasets[0].data as any[]).shift();
      }
      chart.update();
    });
  });
}
getTailwindColor(varName: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(varName)?.trim() || '#22c55e'; // fallback a green-500
}
  }
