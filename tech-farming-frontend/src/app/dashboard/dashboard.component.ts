// src/app/dashboard/dashboard-page.component.ts
import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { KpiCardComponent } from './components/kpi-card.component';
import { LineChartComponent } from './components/line-chart.component';
import { AlertCardComponent } from './components/alert-card.component';
import { TabsPanelComponent } from './components/tabs-panel.component';
import { FooterComponent } from './components/footer.component';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    KpiCardComponent,
    LineChartComponent,
    AlertCardComponent,
    TabsPanelComponent,
    FooterComponent,
  ],
  template: `
    <div class="flex flex-col h-full bg-base-200">

      <!-- ─────── 1) HEADER MEJORADO ─────── -->
      <header class="sticky top-0 z-20 bg-base-200">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 my-5 mx-6">
          <!-- Título Principal -->
          <h1 class="text-4xl font-bold text-success tracking-tight">
            Monitoreo de Invernaderos
          </h1>

          <!-- Filtros Rápidos -->
          <div class="mt-4 md:mt-0 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <!-- Select Invernadero -->
            <div class="form-control w-48">
              <label class="label label-text text-sm">Invernadero</label>
              <select
                id="invernaderoSelect"
                class="select select-bordered select-sm w-full"
                [(ngModel)]="filtros.invernaderoId"
                (change)="onInvernaderoChange()"
                aria-label="Selecciona Invernadero"
              >
                <option [ngValue]="null" disabled selected>— Invernadero —</option>
                <option *ngFor="let inv of invernaderos" [ngValue]="inv.id">
                  {{ inv.nombre }}
                </option>
              </select>
            </div>

            <!-- Select Zona -->
            <div class="form-control w-48">
              <label class="label label-text text-sm">Zona</label>
              <select
                id="zonaSelect"
                class="select select-bordered select-sm w-full"
                [(ngModel)]="filtros.zonaId"
                [disabled]="!filtros.invernaderoId"
                [ngClass]="{ 'opacity-50 cursor-not-allowed': !filtros.invernaderoId }"
                aria-label="Selecciona Zona"
              >
                <option [ngValue]="null" disabled selected>— Zona —</option>
                <option *ngFor="let z of zonasMap[filtros.invernaderoId!]" [ngValue]="z.id">
                  {{ z.nombre }}
                </option>
              </select>
            </div>

            <!-- Botón Aplicar Filtros -->
            <button
              class="btn btn-success btn-sm mt-2 sm:mt-0"
              (click)="aplicarFiltros()"
              aria-label="Aplicar filtros generales"
            >
              Aplicar
            </button>
          </div>
        </div>
      </header>

      <!-- ─────── 2) KPI CARDS ─────── -->
      <section class="flex-none bg-base-200 px-4 md:px-8 py-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <!-- Temperatura -->
          <app-kpi-card
            icon="ri-temperature-line"
            [value]="tempActual"
            unit="°C"
            unitTitle="grados Celsius"
            label="Temperatura"
          ></app-kpi-card>

          <!-- Humedad -->
          <app-kpi-card
            icon="ri-droplet-line"
            [value]="humedadActual"
            unit="%"
            unitTitle="por ciento"
            label="Humedad"
          ></app-kpi-card>

          <!-- Nitrógeno -->
          <app-kpi-card
            icon="ri-flask-line"
            [value]="nitrogenoActual"
            unit="ppm"
            unitTitle="partes por millón"
            label="Nitrógeno"
          ></app-kpi-card>

          <!-- Sensores Activos -->
          <app-kpi-card
            icon="ri-hardware-chip-line"
            [value]="sensoresActivos + ' / ' + totalSensores"
            label="Sensores activos"
          ></app-kpi-card>

          <!-- Estado General -->
          <app-kpi-card
            [icon]="estadoIcono"
            [value]="estadoTexto"
            label="Estado"
            [customClasses]="estadoClasses"
          ></app-kpi-card>
        </div>
      </section>

      <!-- ─────── 3) CONTENEDOR PRINCIPAL (Gráfica + Panel Derecho) ─────── -->
      <section class="flex flex-grow overflow-hidden px-4 md:px-8">
        <!-- ─── 3A) Gráfica 24h ─── -->
        <div class="w-full lg:w-7/12 card bg-base-100 shadow-lg border border-base-200 flex flex-col mr-4">
          <!-- Card Header (Título + Controles + Última actualización) -->
          <div class="card-body p-4 border-b flex flex-col md:flex-row md:items-center justify-between gap-4">
            <!-- Título Gráfico -->
            <div>
              <h2 class="text-xl font-semibold">
                Gráfico – Últimas {{ intervaloSeleccionado }}h
              </h2>
            </div>

            <!-- Controles Internos -->
            <div class="flex flex-wrap items-center gap-3">
              <!-- Select Sensor -->
              <div class="form-control w-40">
                <label class="label label-text text-sm">Sensor</label>
                <select
                  id="sensorSelect"
                  class="select select-bordered select-sm w-full"
                  [(ngModel)]="sensorSeleccionado"
                  aria-label="Selecciona Sensor"
                >
                  <option [ngValue]="null" disabled selected>— Sensor —</option>
                  <option *ngFor="let s of sensoresDisponibles" [ngValue]="s">{{ s }}</option>
                </select>
              </div>

              <!-- Select Variable -->
              <div class="form-control w-40">
                <label class="label label-text text-sm">Variable</label>
                <select
                  id="varSelect"
                  class="select select-bordered select-sm w-full"
                  [(ngModel)]="variableSeleccionada"
                  (change)="onVariableChange()"
                  aria-label="Selecciona Variable"
                >
                  <option [ngValue]="null" disabled selected>— Variable —</option>
                  <option *ngFor="let v of variablesDisponibles" [ngValue]="v">{{ v }}</option>
                </select>
              </div>

              <!-- Toggle Intervalo -->
              <div class="btn-group btn-group-sm ml-2" role="group" aria-label="Intervalo de tiempo">
                <button
                  class="btn btn-sm"
                  [ngClass]="{
                    'btn-success': intervaloSeleccionado === 6,
                    'btn-outline': intervaloSeleccionado !== 6
                  }"
                  (click)="cambiarIntervalo(6)"
                  [attr.aria-pressed]="intervaloSeleccionado === 6"
                  aria-label="Ver últimos 6 horas"
                >
                  6h
                </button>
                <button
                  class="btn btn-sm"
                  [ngClass]="{
                    'btn-success': intervaloSeleccionado === 12,
                    'btn-outline': intervaloSeleccionado !== 12
                  }"
                  (click)="cambiarIntervalo(12)"
                  [attr.aria-pressed]="intervaloSeleccionado === 12"
                  aria-label="Ver últimos 12 horas"
                >
                  12h
                </button>
                <button
                  class="btn btn-sm"
                  [ngClass]="{
                    'btn-success': intervaloSeleccionado === 24,
                    'btn-outline': intervaloSeleccionado !== 24
                  }"
                  (click)="cambiarIntervalo(24)"
                  [attr.aria-pressed]="intervaloSeleccionado === 24"
                  aria-label="Ver últimos 24 horas"
                >
                  24h
                </button>
              </div>
            </div>

            <!-- Última actualización -->
            <div class="text-sm text-base-content/60 italic mt-2 md:mt-0" aria-live="polite">
              Actualizado: {{ formattedLastUpdate }}
            </div>
          </div>

          <!-- Card Content: Gráfico + Tooltip fijo -->
          <div class="card-body p-4 relative">
            <!-- Si no hay variable seleccionada, mostramos mensaje de espera -->
            <ng-container *ngIf="!variableSeleccionada">
              <div class="h-64 flex items-center justify-center text-base-content/50">
                Selecciona una variable para ver el gráfico.
              </div>
            </ng-container>

            <!-- Cuando hay variable seleccionada, mostramos line-chart -->
            <ng-container *ngIf="variableSeleccionada">
              <div class="relative w-full h-96">
                <app-line-chart
                  #lineChart
                  [labels]="graficaData.labels"
                  [data]="graficaData.valores"
                  [variable]="variableSeleccionada"
                  [intervalo]="intervaloSeleccionado"
                  class="w-full h-full"
                ></app-line-chart>
              </div>

              <!-- Tooltip Fijo (Último valor) como Badge de DaisyUI -->
              <div class="absolute bottom-4 right-4">
                <span class="badge badge-lg badge-success flex items-center space-x-1">
                  <i class="ri-flashlight-line"></i>
                  <span>Último: {{ tooltipFijo }}</span>
                </span>
              </div>
            </ng-container>
          </div>
        </div>

        <!-- ─── 3B) Panel Derecho con Tabs ─── -->
        <div class="w-full lg:w-5/12 bg-base-100 rounded-lg shadow-lg border border-base-200 flex flex-col">
          <!-- Header Tabs (ya no envolvemos con p-4 innecesario) -->
          <app-tabs-panel
            [activeTab]="tabActiva"
            (activeTabChange)="tabActiva = $event"
          ></app-tabs-panel>

          <!-- Contenido Tabs -->
          <div
            class="flex-grow overflow-y-auto p-4"
            role="tabpanel"
            [attr.aria-labelledby]="'tab-' + tabActiva + '-btn'"
            tabindex="0"
          >
            <!-- Tab “Alertas” -->
            <ng-container *ngIf="tabActiva === 'alertas'">
              <ng-container *ngIf="alertas.length; else sinAlertas">
                <div class="space-y-3 pb-4">
                  <app-alert-card
                    *ngFor="let a of alertas"
                    [nivel]="a.nivel"
                    [mensaje]="a.mensaje"
                    [fecha]="a.fecha"
                    [zona]="a.zona"
                  ></app-alert-card>
                </div>
              </ng-container>
              <ng-template #sinAlertas>
                <div class="text-center text-base-content/60 py-8">
                  <i class="ri-shield-check-line text-3xl text-success mb-2" aria-hidden="true"></i>
                  <p>No hay alertas activas.</p>
                </div>
              </ng-template>
            </ng-container>

            <!-- Tab “Predicciones” -->
            <ng-container *ngIf="tabActiva === 'predicciones'">
              <ng-container *ngIf="predicciones.length; else sinPredicciones">
                <div class="space-y-3 pb-4">
                  <div
                    *ngFor="let p of predicciones"
                    class="bg-base-100 border border-base-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    <p class="font-semibold text-base-content">
                      Predicción a {{ p.intervalo }}h: {{ p.valor }} {{ getUnidad(p.variable) }}
                    </p>
                    <p class="text-sm text-base-content/60">Confianza: {{ p.confianza }}%</p>
                    <p class="text-sm text-base-content/60">Recomendación: {{ p.recomendacion }}</p>
                  </div>
                </div>
              </ng-container>
              <ng-template #sinPredicciones>
                <div class="text-center text-base-content/60 py-8">
                  <i class="ri-calendar-event-line text-3xl text-info mb-2" aria-hidden="true"></i>
                  <p>Selecciona intervalo para ver predicciones.</p>
                </div>
              </ng-template>
            </ng-container>

            <!-- Tab “Acciones” -->
            <ng-container *ngIf="tabActiva === 'acciones'">
              <div class="space-y-3 pb-4">
                <div
                  class="bg-base-100 border border-base-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <p class="font-semibold text-base-content">
                    Aumentar ventilación si temperatura > 28 °C
                  </p>
                  <p class="text-sm text-base-content/60">Recomendación generada automáticamente.</p>
                </div>
                <div
                  class="bg-base-100 border border-base-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <p class="font-semibold text-base-content">
                    Revisar nivel de fertilizante si Nitrógeno > 10 ppm
                  </p>
                  <p class="text-sm text-base-content/60">Recomendación IA basada en histórico.</p>
                </div>
              </div>
            </ng-container>
          </div>
        </div>
      </section>

      <!-- ─────── 4) AGREGAMOS MÁRGEN SUPERIOR PARA SEPARAR DEL FOOTER ─────── -->
      <div class="mt-6"></div>

      <!-- ─────── 5) FOOTER (AHORA ENVUELTO EN PX PARA COINCIDIR CON SECCIONES) ─────── -->
      <div class="px-4 md:px-8">
        <app-footer [ultimaActualizacion]="ultimaActualizacion"></app-footer>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
        overflow: hidden;
      }
    `,
  ],
})
export class DashboardPageComponent implements OnInit, AfterViewInit {
  // ───────── FILTROS ─────────
  invernaderos = [
    { id: 1, nombre: 'Invernadero A' },
    { id: 2, nombre: 'Invernadero B' },
    { id: 3, nombre: 'Invernadero C' },
  ];
  zonasMap: Record<number, { id: number; nombre: string }[]> = {
    1: [
      { id: 11, nombre: 'Zona Norte' },
      { id: 12, nombre: 'Zona Sur' },
    ],
    2: [{ id: 21, nombre: 'Zona Centro' }],
    3: [
      { id: 31, nombre: 'Zona Este' },
      { id: 32, nombre: 'Zona Oeste' },
    ],
  };
  filtros = { invernaderoId: null as number | null, zonaId: null as number | null };

  // ───────── KPI PRINCIPALES ─────────
  tempActual = 24.5;
  humedadActual = 66;
  nitrogenoActual = 8;
  totalSensores = 12;
  sensoresActivos = 12; // Simulado
  estadoSistema: 'sinRiesgo' | 'advertencia' | 'critica' = 'sinRiesgo';

  sparkTemp = { labels: this.generarNDias(3), data: [23, 24.1, 24.5] };
  sparkHum = { labels: this.generarNDias(3), data: [65, 66, 66] };
  sparkNit = { labels: this.generarNDias(3), data: [7, 8, 8] };
  sparkSens = { labels: this.generarNDias(3), data: [10, 11, 12] };

  get estadoIcono(): string {
    switch (this.estadoSistema) {
      case 'critica':
        return 'ri-error-warning-line';
      case 'advertencia':
        return 'ri-alert-line';
      default:
        return 'ri-checkbox-circle-line';
    }
  }
  get estadoTexto(): string {
    switch (this.estadoSistema) {
      case 'critica':
        return 'Crítico';
      case 'advertencia':
        return 'Advertencia';
      default:
        return 'Sin riesgo';
    }
  }
  get estadoClasses(): string {
    switch (this.estadoSistema) {
      case 'critica':
        return 'border-error bg-error/10';
      case 'advertencia':
        return 'border-warning bg-warning/10';
      default:
        return 'border-success bg-success/10';
    }
  }

  // ───────── GRÁFICA 24H ─────────
  sensoresDisponibles = ['Sensor 1', 'Sensor 2', 'Sensor 3'];
  variablesDisponibles: ('Temperatura' | 'Humedad' | 'Nitrógeno')[] = [
    'Temperatura',
    'Humedad',
    'Nitrógeno',
  ];
  sensorSeleccionado: string | null = 'Sensor 1';
  variableSeleccionada: 'Temperatura' | 'Humedad' | 'Nitrógeno' = 'Temperatura';
  intervaloSeleccionado: 6 | 12 | 24 = 24;

  graficaData = {
    labels: this.generarLabelsHoras(24),
    valores: this.generarRandomArray(24, 18, 30),
  };
  ultimaActualizacion = new Date();
  tooltipFijo = `${this.graficaData.valores[this.graficaData.valores.length - 1]} °C`;
  formattedLastUpdate: string = '';

  @ViewChild('lineChart', { static: false })
  lineChartComp!: LineChartComponent;

  // ───────── ALERTAS ACTIVAS ─────────
  alertas: {
    id: number;
    nivel: 'critica' | 'advertencia';
    mensaje: string;
    fecha: Date;
    zona: string;
  }[] = [
    {
      id: 1,
      nivel: 'critica',
      mensaje: 'Alta temperatura detectada',
      fecha: new Date('2025-06-05T11:45:00'),
      zona: 'Zona Norte',
    },
    {
      id: 2,
      nivel: 'advertencia',
      mensaje: 'Nivel de humedad bajo',
      fecha: new Date('2025-06-05T10:15:00'),
      zona: 'Zona Norte',
    },
    {
      id: 3,
      nivel: 'critica',
      mensaje: 'Nivel de nitrógeno alto',
      fecha: new Date('2025-06-05T09:30:00'),
      zona: 'Zona Sur',
    },
  ];

  // ───────── PREDICCIONES SIMULADAS ─────────
  predicciones: {
    intervalo: 6 | 12 | 24;
    valor: number;
    confianza: number;
    recomendacion: string;
    variable: 'Temperatura' | 'Humedad' | 'Nitrógeno';
  }[] = [];

  // ───────── TAB ACTIVA ─────────
  tabActiva: 'alertas' | 'predicciones' | 'acciones' = 'alertas';

  constructor() {}

  ngOnInit(): void {
    this.simularPredicciones();
    this.updateFormattedLastUpdate();
  }

  ngAfterViewInit(): void {
    // Forzamos que el gráfico se redibuje con estilo y datos iniciales
    this.cambiarIntervalo(this.intervaloSeleccionado);
  }

  // ───────── FILTROS ─────────
  onInvernaderoChange(): void {
    this.filtros.zonaId = null;
  }

  aplicarFiltros(): void {
    this.cambiarIntervalo(this.intervaloSeleccionado);
  }

  // ───────── CAMBIAR VARIABLE ─────────
  onVariableChange(): void {
    this.cambiarIntervalo(this.intervaloSeleccionado);
  }

  // ───────── CAMBIAR INTERVALO Y ACTUALIZAR GRÁFICA ─────────
  cambiarIntervalo(horas: 6 | 12 | 24): void {
    this.intervaloSeleccionado = horas;

    // Generar nuevas etiquetas y datos aleatorios
    this.graficaData = {
      labels: this.generarLabelsHoras(horas),
      valores: this.generarRandomArray(horas, 18, 30),
    };

    // Actualizar el componente hijo (LineChartComponent)
    if (this.lineChartComp) {
      this.lineChartComp.actualizarData(
        this.graficaData.labels,
        this.graficaData.valores,
        this.variableSeleccionada
      );
    }

    // Actualizar tooltip fijo y timestamp
    const ultimoVal = this.graficaData.valores[this.graficaData.valores.length - 1];
    const unidad = this.getUnidad(this.variableSeleccionada);
    this.tooltipFijo = `${ultimoVal} ${unidad}`;

    this.ultimaActualizacion = new Date();
    this.updateFormattedLastUpdate();
  }

  // ───────── SIMULAR PREDICCIONES ─────────
  private simularPredicciones(): void {
    this.predicciones = [6, 12, 24].map((h) => {
      const valor = parseFloat((Math.random() * (28 - 20) + 20).toFixed(1));
      const confianza = Math.floor(Math.random() * (99 - 80) + 80);
      const recomendacion = `Ventilar si > ${Math.floor(
        Math.random() * (25 - 22) + 22
      )} °C`;
      return {
        intervalo: h as 6 | 12 | 24,
        valor,
        confianza,
        recomendacion,
        variable: this.variableSeleccionada,
      };
    });
  }

  /** Obtiene unidad según variable seleccionada */
  getUnidad(variable: 'Temperatura' | 'Humedad' | 'Nitrógeno'): string {
    if (variable === 'Humedad') return '%';
    if (variable === 'Nitrógeno') return 'ppm';
    return '°C';
  }

  private generarLabelsHoras(count: number): string[] {
    const arr: string[] = [];
    const now = new Date();
    for (let i = count - 1; i >= 0; i--) {
      const dt = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hh = dt.getHours().toString().padStart(2, '0');
      const mm = dt.getMinutes().toString().padStart(2, '0');
      arr.push(`${hh}:${mm}`);
    }
    return arr;
  }

  private generarRandomArray(length: number, min: number, max: number): number[] {
    return Array.from({ length }, () =>
      Math.round(Math.random() * (max - min) + min)
    );
  }

  private generarNDias(n: number): string[] {
    const hoy = new Date();
    const arr: string[] = [];
    for (let i = n - 1; i >= 0; i--) {
      const dt = new Date(hoy.getTime() - i * 24 * 60 * 60 * 1000);
      const dia = dt.getDate().toString().padStart(2, '0');
      const mes = (dt.getMonth() + 1).toString().padStart(2, '0');
      arr.push(`${dia}/${mes}`);
    }
    return arr;
  }

  private updateFormattedLastUpdate(): void {
    const opts: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };
    this.formattedLastUpdate = this.ultimaActualizacion.toLocaleTimeString([], opts);
  }
}
