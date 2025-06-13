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
import { SummaryCardComponent } from '../predicciones/components/summary-card.component';
import { DashboardService } from './services/dashboard.service';
import { NotificationService } from '../shared/services/notification.service';
import { Invernadero, Zona, Sensor, Alerta, Summary } from '../models';
import { finalize, forkJoin, map } from 'rxjs';

interface ZoneSummary {
  zone: Zona;
  summaries: Array<{
    param: string;
    summary: Summary;
  }>;
}

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
    SummaryCardComponent,
  ],
  template: `
    <div *ngIf="!loading; else loadingTpl" class="flex flex-col h-full bg-base-200">

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
            <div class="form-control w-full sm:w-48">
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
            <div class="form-control w-full sm:w-48">
              <label class="label label-text text-sm">Zona</label>
              <select
                id="zonaSelect"
                class="select select-bordered select-sm w-full"
                [(ngModel)]="filtros.zonaId"
                (change)="onZonaChange()"
                [disabled]="!filtros.invernaderoId"
                [ngClass]="{ 'opacity-50 cursor-not-allowed': !filtros.invernaderoId }"
                aria-label="Selecciona Zona"
                (change)="onZonaChange()"
              >
                <option [ngValue]="null">— Zona —</option>
                <option *ngFor="let z of zonasMap[filtros.invernaderoId!]" [ngValue]="z.id">
                  {{ z.nombre }}
                </option>
              </select>
            </div>

          </div>
        </div>
      </header>

      <!-- ─────── 2) KPI CARDS ─────── -->
      <section class="flex-none bg-base-200 px-4 md:px-8 py-4">
        <div class="grid grid-cols-[repeat(auto-fit,minmax(10rem,1fr))] gap-4">
          <app-kpi-card
            *ngFor="let card of kpiCards"
            [icon]="card.icon"
            [value]="card.value"
            [unit]="card.unit"
            [unitTitle]="card.unitTitle"
            [label]="card.label"
            [customClasses]="card.customClasses"
          ></app-kpi-card>
        </div>
      </section>

      <!-- ─────── 3) CONTENEDOR PRINCIPAL (Gráfica + Panel Derecho) ─────── -->
      <section class="flex flex-col lg:flex-row flex-grow overflow-hidden px-4 md:px-8">
        <!-- ─── 3A) Gráfica 24h ─── -->
        <div class="w-full lg:w-7/12 card bg-base-100 shadow-lg border border-base-200 flex flex-col lg:mr-4">
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
                  (change)="onSensorChange()"
                  aria-label="Selecciona Sensor"
                >
                  <option [ngValue]="null" disabled selected>— Sensor —</option>
                  <option *ngFor="let s of sensoresDisponibles" [ngValue]="s.id">{{ s.nombre }}</option>
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
                  <option *ngFor="let v of variablesDisponibles" [ngValue]="v">{{ v.nombre }}</option>
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
                  [variable]="variableSeleccionada!.nombre"

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
        <div class="w-full lg:w-5/12 bg-base-100 rounded-lg shadow-lg border border-base-200 flex flex-col mt-4 lg:mt-0">
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
                    [showResolve]="true"
                    [resolviendo]="resolviendoId === a.id"
                    (resolver)="resolverAlerta(a.id)"
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
              <div class="flex justify-end mb-4">
                <div class="btn-group btn-group-sm" role="group" aria-label="Intervalo predicción">
                  <button
                    class="btn btn-sm"
                    [ngClass]="{ 'btn-info': predIntervalo === 6, 'btn-outline': predIntervalo !== 6 }"
                    (click)="cambiarPredIntervalo(6)"
                  >6h</button>
                  <button
                    class="btn btn-sm"
                    [ngClass]="{ 'btn-info': predIntervalo === 12, 'btn-outline': predIntervalo !== 12 }"
                    (click)="cambiarPredIntervalo(12)"
                  >12h</button>
                  <button
                    class="btn btn-sm"
                    [ngClass]="{ 'btn-info': predIntervalo === 24, 'btn-outline': predIntervalo !== 24 }"
                    (click)="cambiarPredIntervalo(24)"
                  >24h</button>
                </div>
              </div>
              <ng-container *ngIf="zoneSummaries.length; else sinPredicciones">
                <div class="space-y-6">
                  <div *ngFor="let zs of zoneSummaries" class="bg-base-100 border rounded-lg p-4">
                    <h3 class="text-lg font-semibold mb-2">{{ zs.zone.nombre }}</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      <app-summary-card
                        *ngFor="let s of zs.summaries"
                        [summary]="s.summary"
                        [projectionLabel]="predIntervalo + 'h'"
                        [param]="s.param"
                      ></app-summary-card>
                    </div>
                  </div>
                </div>
              </ng-container>
              <ng-template #sinPredicciones>
                <div class="text-center text-base-content/60 py-8">
                  <i class="ri-calendar-event-line text-3xl text-info mb-2" aria-hidden="true"></i>
                  <p>No hay predicciones para la zona seleccionada.</p>
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
    <ng-template #loadingTpl>
      <div class="min-h-screen flex items-center justify-center bg-base-200">
        <svg
          class="animate-spin w-8 h-8 text-success mx-auto"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8z"
          ></path>
        </svg>
      </div>
    </ng-template>
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
  invernaderos: Invernadero[] = [];
  zonasMap: Record<number, Zona[]> = {};
  filtros = { invernaderoId: null as number | null, zonaId: null as number | null };
  loading = true;
  private loadCount = 0;
  private initialLoad = true;

  // ───────── KPI PRINCIPALES ─────────
  tempActual = 0;
  humedadActual = 0;
  nitrogenoActual = 0;
  totalSensores = 0;
  sensoresActivos = 0;
  estadoSistema: 'sinRiesgo' | 'advertencia' | 'critica' = 'sinRiesgo';
  sparkTemp = { labels: [] as string[], data: [] as number[] };
  sparkHum = { labels: [] as string[], data: [] as number[] };
  sparkNit = { labels: [] as string[], data: [] as number[] };
  sparkSens = { labels: [] as string[], data: [] as number[] };
  private readonly LECTURA_MAX_AGE_MS = 60 * 60 * 1000; // 1h

  kpiCards: Array<{
    label: string;
    icon: string;
    value: any;
    unit?: string;
    unitTitle?: string;
    customClasses?: string;
  }> = [];

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

  private peorEstado(a: 'sinRiesgo' | 'advertencia' | 'critica', b: 'sinRiesgo' | 'advertencia' | 'critica'): 'sinRiesgo' | 'advertencia' | 'critica' {
    const order: Record<'sinRiesgo' | 'advertencia' | 'critica', number> = {
      sinRiesgo: 0,
      advertencia: 1,
      critica: 2
    };
    return order[a] >= order[b] ? a : b;
  }

  private updateEstadoCard(): void {
    const card = this.kpiCards.find((c) => c.label === 'Estado');
    if (card) {
      card.icon = this.estadoIcono;
      card.value = this.estadoTexto;
      card.customClasses = this.estadoClasses;
    }
  }

  // ───────── GRÁFICA 24H ─────────
  sensoresDisponibles: Sensor[] = [];
  variablesDisponibles: Array<{ id: number; nombre: 'Temperatura' | 'Humedad' | 'Nitrógeno'; unidad?: string }> = [];
  sensorSeleccionado: number | null = null;
  variableSeleccionada: { id: number; nombre: 'Temperatura' | 'Humedad' | 'Nitrógeno'; unidad?: string } | null = null;
  intervaloSeleccionado: 6 | 12 | 24 = 24;

  graficaData = {
    labels: [] as string[],
    valores: [] as number[],
  };
  ultimaActualizacion = new Date();
  tooltipFijo = '';
  formattedLastUpdate: string = '';

  @ViewChild('lineChart', { static: false })
  lineChartComp!: LineChartComponent;

  // ───────── ALERTAS ACTIVAS ─────────
  alertas: Array<{
    id: number;
    nivel: 'critica' | 'advertencia';
    mensaje: string;
    fecha: Date;
    zona: string;
  }> = [];
  resolviendoId: number | null = null;

  // ───────── PREDICCIONES POR ZONA ─────────
  zoneSummaries: ZoneSummary[] = [];
  predIntervalo: 6 | 12 | 24 = 6;

  // ───────── TAB ACTIVA ─────────
  tabActiva: 'alertas' | 'predicciones' | 'acciones' = 'alertas';

  constructor(
    private dashSvc: DashboardService,
    private notify: NotificationService
  ) {}

  ngOnInit(): void {
    this.cargarInvernaderos();
    this.updateFormattedLastUpdate();
  }

  ngAfterViewInit(): void {
    // Forzamos que el gráfico se redibuje con estilo y datos iniciales
    this.cambiarIntervalo(this.intervaloSeleccionado);
  }

  // ───────── FILTROS ─────────
  onInvernaderoChange(): void {
    this.filtros.zonaId = null;
    this.estadoSistema = 'sinRiesgo';
    this.updateEstadoCard();
    this.cargarZonasYsensores();
    this.cargarAlertas();
  }

  onZonaChange(): void {
    this.cargarAlertas();
    this.cambiarIntervalo(this.intervaloSeleccionado);
    this.loadZoneSummaries();
  }

  aplicarFiltros(): void {
    this.cargarZonasYsensores();
    this.cargarAlertas();
    this.cambiarIntervalo(this.intervaloSeleccionado);
  }

  onSensorChange(): void {
    const sensor = this.sensoresDisponibles.find((s) => s.id === this.sensorSeleccionado);
    this.variablesDisponibles = sensor ? sensor.parametros.map((p) => ({ id: p.id, nombre: p.nombre as 'Temperatura' | 'Humedad' | 'Nitrógeno', unidad: p.unidad })) : [];
    this.variableSeleccionada = this.variablesDisponibles[0] ?? null;
    if (this.variableSeleccionada) {
      this.cambiarIntervalo(this.intervaloSeleccionado);
    }
  }


  // ───────── CAMBIAR VARIABLE ─────────
  onVariableChange(): void {
    this.cambiarIntervalo(this.intervaloSeleccionado);
  }

  // ───────── CAMBIAR INTERVALO Y ACTUALIZAR GRÁFICA ─────────
  cambiarIntervalo(horas: 6 | 12 | 24): void {
    this.intervaloSeleccionado = horas;

    if (!this.filtros.invernaderoId || !this.variableSeleccionada || !this.sensorSeleccionado) return;

    const hasta = new Date();
    const desde = new Date(hasta.getTime() - horas * 60 * 60 * 1000);
    const tipoId = this.variableSeleccionada ? this.variableSeleccionada.id : 0;

    this.startLoading();
    this.dashSvc
      .getHistorial({
        invernaderoId: this.filtros.invernaderoId,
        zonaId: this.filtros.zonaId ?? undefined,
        sensorId: this.sensorSeleccionado ?? undefined,
        tipoParametroId: tipoId,
        desde: desde.toISOString(),
        hasta: hasta.toISOString(),
      })
      .pipe(finalize(() => this.endLoading()))
      .subscribe({
        next: (resp) => {
          this.graficaData = {
            labels: resp.series.map((s) =>
              new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            ),
            valores: resp.series.map((s) => s.value),
          };

          if (this.lineChartComp && this.variableSeleccionada) {
            this.lineChartComp.actualizarData(
              this.graficaData.labels,
              this.graficaData.valores,
              this.variableSeleccionada.nombre
            );
          }

          const ultimoVal = this.graficaData.valores[this.graficaData.valores.length - 1];
          const unidad = this.getUnidad(this.variableSeleccionada?.nombre ?? 'Temperatura');
          this.tooltipFijo = `${ultimoVal ?? '-'} ${unidad}`;
          this.ultimaActualizacion = new Date();
          this.updateFormattedLastUpdate();
          this.loadZoneSummaries();
        },
      error: () => this.notify.error('Error al cargar historial')
      });
  }

  cambiarPredIntervalo(horas: 6 | 12 | 24): void {
    this.predIntervalo = horas;
    this.loadZoneSummaries();
  }

  resolverAlerta(id: number) {
    this.resolviendoId = id;
    this.dashSvc.resolverAlerta(id).subscribe({
      next: () => {
        this.notify.success('Alerta resuelta');
        this.cargarAlertas();
      },
      error: () => this.notify.error('Error al resolver alerta'),
      complete: () => (this.resolviendoId = null)
    });
  }


  private getIconForParam(nombre: string): string {
    const n = nombre.toLowerCase();
    if (n.includes('temper')) return 'ri-temperature-line';
    if (n.includes('hum')) return 'ri-droplet-line';
    if (n.includes('nitr')) return 'ri-flask-line';
    return 'ri-dashboard-2-line';
  }

  private cargarInvernaderos() {
    this.startLoading();
    this.dashSvc
      .getInvernaderos()
      .pipe(finalize(() => this.endLoading()))
      .subscribe({
        next: (list) => {
          this.invernaderos = list;
          if (list.length) {
            this.filtros.invernaderoId = list[0].id;
            this.onInvernaderoChange();
          }
        },
        error: () => {
          this.notify.error('Error al cargar invernaderos');
        }
      });
  }

  private cargarZonasYsensores() {
    const id = this.filtros.invernaderoId;
    if (!id) return;
    this.startLoading();
    this.dashSvc
      .getZonas(id)
      .pipe(finalize(() => this.endLoading()))
      .subscribe({
        next: (z) => (this.zonasMap[id] = z),
        error: () => this.notify.error('Error al cargar zonas'),
      });

    const sensoresObs = this.filtros.zonaId
      ? this.dashSvc.getSensoresPorZona(this.filtros.zonaId)
      : this.dashSvc.getSensores(id);
    this.startLoading();
    sensoresObs
      .pipe(finalize(() => this.endLoading()))
      .subscribe({
        next: (sens) => {
        this.sensoresDisponibles = sens;
        this.totalSensores = sens.length;
        this.sensoresActivos = sens.filter((s) => s.estado === 'Activo').length;

        this.sensorSeleccionado = this.sensoresDisponibles[0]?.id ?? null;
        this.onSensorChange();

        const paramMap = new Map<string, string | undefined>();
        sens.forEach((s) =>
          s.parametros.forEach((p) => {
            if (!paramMap.has(p.nombre)) paramMap.set(p.nombre, p.unidad);
          })
        );

        this.kpiCards = [];
        paramMap.forEach((unidad, nombre) => {
          this.kpiCards.push({
            label: nombre,
            icon: this.getIconForParam(nombre),
            value: 0,
            unit: unidad,
            unitTitle: unidad,
          });
        });

        this.kpiCards.push({
          label: 'Sensores activos',
          icon: 'ri-hardware-chip-line',
          value: `${this.sensoresActivos} / ${this.totalSensores}`,
        });

        this.kpiCards.push({
          label: 'Estado',
          icon: this.estadoIcono,
          value: this.estadoTexto,
          customClasses: this.estadoClasses,
        });

        const ids = sens.map((s) => s.id);
        if (ids.length) {
          this.startLoading();
          this.dashSvc
            .getLecturas(ids)
            .pipe(finalize(() => this.endLoading()))
            .subscribe({
              next: (lects) => {
              let desactualizados = 0;
              const ahora = Date.now();
              lects.forEach((l) => {
                const lecturaTime = l.time ? new Date(l.time).getTime() : 0;
                if (!lecturaTime || ahora - lecturaTime > this.LECTURA_MAX_AGE_MS) {
                  desactualizados++;
                }
                l.parametros.forEach((p, i) => {
                  const val = l.valores[i];
                  const card = this.kpiCards.find(
                    (c) => c.label.toLowerCase() === p.toLowerCase()
                  );
                  if (card) card.value = val;
                  const name = p.toLowerCase();
                  if (name.includes('temper')) this.tempActual = val;
                  if (name.includes('hum')) this.humedadActual = val;
                  if (name.includes('nitr')) this.nitrogenoActual = val;
                });
              });

              if (desactualizados) {
                const nuevo: 'critica' | 'advertencia' =
                  desactualizados === lects.length ? 'critica' : 'advertencia';
                this.estadoSistema = this.peorEstado(this.estadoSistema, nuevo);
                this.updateEstadoCard();
              }
            },
              error: () => this.notify.error('Error al obtener lecturas'),
            });
        }
      },
      error: () => this.notify.error('Error al cargar sensores')
    });
  }

  private loadZoneSummaries() {
    if (!this.filtros.invernaderoId) return;
    this.loading = true;

    const allZones = this.zonasMap[this.filtros.invernaderoId!] || [];
    const targetZones = this.filtros.zonaId
      ? allZones.filter(z => z.id === this.filtros.zonaId)
      : allZones;

    const calls = targetZones.map(zone => {
      const paramCalls = this.variablesDisponibles.map(v =>
        this.dashSvc.getPredicciones({
          invernaderoId: this.filtros.invernaderoId!,
          zonaId: zone.id,
          parametro: v.nombre,
          horas: this.predIntervalo
        }).pipe(
          map(res => ({
            param: v.nombre,
            summary: {
              lastValue: res.historical.slice(-1)[0]?.value,
              prediction: res.future.slice(-1)[0]?.value,
              diff: (res.future.slice(-1)[0]?.value ?? 0) - (res.historical.slice(-1)[0]?.value ?? 0),
              action: res.summary.action,
            } as Summary
          }))
        )
      );

      return forkJoin(paramCalls).pipe(
        map(summaries => ({ zone, summaries }))
      );
    });

    forkJoin(calls).pipe(
      finalize(() => this.loading = false)
    ).subscribe(results => {
      this.zoneSummaries = results;
    });
  }

  private cargarAlertas() {
    this.startLoading();
    this.dashSvc
      .getAlertas({
        estado: 'Activa',
        invernadero_id: this.filtros.invernaderoId ?? undefined,
        zona_id: this.filtros.zonaId ?? undefined,
        perPage: 5,
      })
      .pipe(finalize(() => this.endLoading()))
      .subscribe({
        next: (resp) => {
          this.alertas = resp.data.map((a) => ({
            id: a.id,
            nivel: a.nivel === 'Crítico' ? 'critica' : 'advertencia',
            mensaje: a.mensaje,
            fecha: new Date(a.fecha_hora),
            zona: a.sensor_nombre || '',
          }));

          const niveles = resp.data.map((a) => a.nivel);
          let nuevoEstado: 'sinRiesgo' | 'advertencia' | 'critica' = 'sinRiesgo';
          if (niveles.includes('Crítico')) {
            nuevoEstado = 'critica';
          } else if (niveles.length) {
            nuevoEstado = 'advertencia';
          }
          this.estadoSistema = this.peorEstado(this.estadoSistema, nuevoEstado);
          this.updateEstadoCard();
        },
        error: () => this.notify.error('Error al cargar alertas')
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

  private startLoading(): void {
    if (!this.initialLoad) return;
    this.loadCount++;
    this.loading = true;
  }

  private endLoading(): void {
    if (!this.initialLoad) return;
    if (this.loadCount > 0) {
      this.loadCount--;
    }
    if (this.loadCount === 0) {
      this.loading = false;
      this.initialLoad = false;
    }
  }

  private updateFormattedLastUpdate(): void {
    const opts: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };
    this.formattedLastUpdate = this.ultimaActualizacion.toLocaleTimeString([], opts);
  }
}
