// src/app/predicciones/predicciones.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { FormsModule }       from '@angular/forms';
import { HttpClientModule }  from '@angular/common/http';


import { PrediccionesService } from './predicciones.service';
import {
  Invernadero,
  Zona,
  SeriesPoint,
  PredicParams,
  PredicResult,
  Trend as APITrend
} from '../models';

import { FiltroSelectComponent }    from '../historial/components/filtro-select.component';
import { PredictionChartComponent } from './components/prediction-chart.component';
import { SummaryCardComponent }     from './components/summary-card.component';
import { Trend as UITrend, TrendCardComponent } from './components/trend-card.component';
import { PrediccionesHeaderComponent } from './components/predicciones-header.component';

@Component({
  selector: 'app-predicciones',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    PrediccionesHeaderComponent,
    FiltroSelectComponent,
    PredictionChartComponent,
    SummaryCardComponent,
    TrendCardComponent
  ],
  template: `
    <div *ngIf="firstLoad; else loadedTpl" class="min-h-screen flex items-center justify-center bg-base-200">
      <svg class="animate-spin w-8 h-8 text-success mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
    </div>
    <ng-template #loadedTpl>
      <div class="flex flex-col" style="height: calc(100vh - var(--header-height));">
        <!-- HEADER -->
        <app-predicciones-header></app-predicciones-header>

        <div class="flex-1 overflow-y-auto p-6 space-y-6 bg-base-200">
          <div *ngIf="showNoDataMsg" class="alert alert-warning mb-4">
            ⚠️ No hay datos disponibles para esa selección.
          </div>

          <!-- FILTROS -->
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">

            <!-- Invernadero -->
            <app-filtro-select
              label="Invernadero"
              [options]="optInvernadero"
              [selectedId]="selectedInvernadero"
              (selectionChange)="onInvernaderoChange($event)"
              [allowUndefined]="false"
            ></app-filtro-select>

            <!-- Zona -->
            <app-filtro-select
              label="Zona"
              [options]="optZona"
              [selectedId]="selectedZona"
              (selectionChange)="onZonaChange($event)"
            ></app-filtro-select>

            <!-- Parámetro -->
            <app-filtro-select
              label="Parámetro"
              [options]="optParametros"
              [selectedId]="selectedParametro"
              (selectionChange)="onParametroChange($event)"
              [allowUndefined]="false"
            ></app-filtro-select>

            <!-- Proyección -->
            <app-filtro-select
              label="Proyección"
              [options]="optProjection"
              [selectedId]="selectedProjection"
              (selectionChange)="onProjectionChange($event)"
              [allowUndefined]="false"
            ></app-filtro-select>
          </div>

          <ng-container *ngIf="loading; else dataTpl">
            <div class="flex items-center justify-center min-h-[20rem]">
              <svg class="animate-spin w-8 h-8 text-success mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            </div>
          </ng-container>
          <ng-template #dataTpl>
            <div class="space-y-4">
              <!-- Chart -->
              <div class="relative w-full h-96 bg-base-100 rounded-lg overflow-hidden shadow-xl p-6 animate-fade-in-down">
                <app-prediction-chart
                  class="w-full h-full"
                  [historical]="data?.historical ?? []"
                  [future]    ="data?.future     ?? []"
                  [label]     ="selectedProjectionLabel"
                ></app-prediction-chart>
              </div>

              <!-- Resumen y Tendencia -->
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 justify-center">
                <div class="col-span-12 sm:col-span-1 lg:col-span-6">
                  <app-summary-card
                    [summary]="data?.summary"
                    [projectionLabel]="selectedProjectionLabel"
                    [param]="selectedParametroLabel"
                  ></app-summary-card>
                </div>
                <div
                  class="col-span-12 sm:col-span-1 lg:col-span-6 flex sm:justify-center lg:justify-start"
                  *ngIf="uiTrend"
                >
                  <app-trend-card [trend]="uiTrend"></app-trend-card>
                </div>
              </div>
            </div>
          </ng-template>
        </div>
      </div>
    </ng-template>
  `,
  styles: [`
    :host { display: block; position: relative; }
    :root {
      --header-height: 3rem;
    }
  `]
  
})
export class PrediccionesComponent implements OnInit {
  invernaderos:    Invernadero[] = [];
  zonas:            Zona[]         = [];
  optInvernadero:  { id: number; label: string }[] = [];
  optZona:         { id: number; label: string }[] = [];

  optProjection = [
    { id: 6,  label: '6 horas'  },
    { id: 12, label: '12 horas' },
    { id: 24, label: '24 horas' }
  ];

  // — Nuevo filtro "Parámetro" —
  optParametros = [
    { id: 'Temperatura', label: 'Temperatura' },
    { id: 'Humedad',     label: 'Humedad'     },
    { id: 'N',           label: 'Nitrógeno'   },
    { id: 'P',           label: 'Fósforo'     },
    { id: 'K',           label: 'Potasio'     }
  ];

  selectedInvernadero?: number;
  selectedZona?:         number;
  selectedProjection = 6;
  selectedParametro  = 'Temperatura';

  data?:   PredicResult;
  uiTrend?: UITrend;
  showNoDataMsg = false;
  loading = true;
  /** Muestra spinner de página completa durante la carga inicial */
  firstLoad = true;

  constructor(private svc: PrediccionesService) {}

  ngOnInit() {
    this.svc.getInvernaderos().subscribe({
      next: list => {
        this.invernaderos   = list;
        this.optInvernadero = list.map(x => ({ id: x.id, label: x.nombre }));
        if (list.length > 0) {
          const firstId = list[0].id;
          this.selectedInvernadero = firstId;
          this.loading = true;
          this.svc.getZonasByInvernadero(firstId).subscribe({
            next: zonas => {
              this.zonas   = zonas;
              this.optZona = zonas.map(z => ({ id: z.id, label: z.nombre }));
              this.reload();
            },
            error: () => {
              this.loading = false;
              this.firstLoad = false;
            }
          });
        } else {
          this.loading = false;
          this.firstLoad = false;

        }
      },
      error: () => {
        this.loading = false;
        this.firstLoad = false;

      }
    });
  }

  get selectedProjectionLabel(): string {
    return this.optProjection.find(p => p.id === this.selectedProjection)?.label ?? '';
  }

  get selectedParametroLabel(): string {
    return this.optParametros.find(p => p.id === this.selectedParametro)?.label ?? this.selectedParametro;
  }

  onInvernaderoChange(id: string|number|undefined) {
    const idNum = id == null ? undefined : (typeof id === 'string' ? +id : id);
    if (idNum == null) {
      this.selectedInvernadero = undefined;
      this.selectedZona       = undefined;
      this.zonas               = [];
      return;
    }
    this.selectedInvernadero = idNum;
    this.loading = true;
    this.svc.getZonasByInvernadero(idNum).subscribe({
      next: list => {
        this.zonas   = list;
        this.optZona = list.map(z => ({ id: z.id, label: z.nombre }));
        this.reload();
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onZonaChange(id: string|number|undefined) {
    const idNum = id == null ? undefined : (typeof id === 'string' ? +id : id);
    this.selectedZona = idNum;
    this.reload();
  }

  onParametroChange(param: string|number|undefined) {
    // forzamos a string, ignoramos valores no-string
    if (typeof param === 'string') {
      this.selectedParametro = param;
      this.reload();
    }
  }

  onProjectionChange(h: string|number|undefined) {
    const hNum = h == null ? undefined : (typeof h === 'string' ? +h : h);
    if (hNum != null) {
      this.selectedProjection = hNum as 6|12|24;
      this.reload();
    }
  }

  reload() {
    if (!this.selectedInvernadero) {
      this.loading = false;
      return;
    }

    this.loading = true;

    const params: PredicParams = {
      invernaderoId: this.selectedInvernadero!,
      zonaId:        this.selectedZona,
      horas:         this.selectedProjection as 6|12|24,
      parametro:     this.selectedParametro
    };
    console.log('→ Llamando a predict con params:', params);
    this.svc.getPredicciones(params).subscribe({
      next: (res: PredicResult) => {
        // — Depuración: comprueba que Angular recibe los arrays completos —
        console.log('[DEBUG] historical.length =', res.historical?.length);
        console.log('[DEBUG] future.length     =', res.future?.length);
        if (res.historical?.length) {
          console.log('[DEBUG] historical[0]    =', res.historical[0]);
          console.log('[DEBUG] historical[last] =', res.historical[res.historical.length - 1]);
        }
        if (res.future?.length) {
          console.log('[DEBUG] future[0]        =', res.future[0]);
          console.log('[DEBUG] future[last]     =', res.future[res.future.length - 1]);
        }

        // si no hay historial
        if (!res.historical || res.historical.length === 0) {
          this.data = undefined;
          this.uiTrend = undefined;
          this.mostrarMensajeNoData();
          return;
        }

        // filtrar predicciones según la proyección solicitada
        let sliceUntil = 1;
        if (this.selectedProjection === 12) sliceUntil = 2;
        if (this.selectedProjection === 24) sliceUntil = 3;

        this.data = { ...res, future: res.future.slice(0, sliceUntil) };
        this.uiTrend = this.mapTrend(res.trend);

        // construir summary enriquecido
        const lastValue  = res.historical.slice(-1)[0].value;
        const idx        = [6,12,24].indexOf(this.selectedProjection);
        const prediction = res.future[idx].value;
        const vals       = res.historical.map(p => p.value);
        const histMin    = Math.min(...vals);
        const histMax    = Math.max(...vals);
        const diff       = prediction - lastValue;

        let action: string|undefined;
        switch (this.selectedParametro) {
          case 'Temperatura':
            if (diff <= -2) {
              action = '⚠️ Temperatura bajará: revisar calefacción';
            } else if (diff >= 2) {
              action = '⚠️ Temperatura subirá: verificar ventilación';
            }
            break;

          case 'Humedad':
            // umbral de 5 puntos como ejemplo; ajústalo a lo que necesites
            if (diff <= -5) {
              action = '⚠️ Humedad bajará: revisar sistema de riego';
            } else if (diff >= 5) {
              action = '⚠️ Humedad subirá: verificar ventilación';
            }
            break;

          default:
            action = undefined;  // para N/P/K no mostramos acción
        }

        this.data.summary = {
          updated:    res.summary.updated,
          text:       res.summary.text,    // ← Añade esto
          lastValue,
          prediction,
          histMin,
          histMax,
          diff,
          action
        };
      },
      error: err => {
        console.warn('No se pudieron obtener predicciones:', err);
        this.data = undefined;
        this.uiTrend = undefined;
        this.mostrarMensajeNoData();
        this.loading = false;
        this.firstLoad = false;
      },
      complete: () => {
        this.loading = false;
        if (this.firstLoad) this.firstLoad = false;
      }
    });
  }
   /** Activa showNoDataMsg por 5 segundos */
  private mostrarMensajeNoData() {
    this.showNoDataMsg = true;
    setTimeout(() => {
      this.showNoDataMsg = false;
    }, 5000);
  }
  private mapTrend(api: APITrend): UITrend {
    let type: UITrend['type'] = 'stable';
    if (api.icon === 'arrow-up')   type = 'up';
    if (api.icon === 'arrow-down') type = 'down';
    return { title: api.text, message: api.comparison, type };
  }
}