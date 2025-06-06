// src/app/predicciones/predicciones.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { FormsModule }       from '@angular/forms';
import { HttpClientModule }  from '@angular/common/http';

import { MatFormFieldModule }from '@angular/material/form-field';
import { MatSelectModule }   from '@angular/material/select';
import { MatButtonModule }   from '@angular/material/button';
import { MatCardModule }     from '@angular/material/card';

import { PrediccionesService } from './predicciones.service';
import {
  Invernadero,
  Zona,
  SeriesPoint,
  Summary,
  Trend as APITrend,
  PredicParams,
  PredicResult
} from '../models';

import { FiltroSelectComponent }    from '../historial/components/filtro-select.component';
import { PredictionChartComponent } from './components/prediction-chart.component';
import { SummaryCardComponent }     from './components/summary-card.component';
import { Trend as UITrend, TrendCardComponent } from './components/trend-card.component';

@Component({
  selector: 'app-predicciones',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,

    FiltroSelectComponent,
    PredictionChartComponent,
    SummaryCardComponent,
    TrendCardComponent
  ],
  template: `
    <div class="flex flex-col" style="height: calc(100vh - var(--header-height));">
      <!-- HEADER -->
      <div class="flex items-center justify-between px-6 py-4 bg-base-200 border-b border-base-300">
        <h1 class="text-3xl font-bold text-base-content">Predicciones</h1>
        <button
          mat-stroked-button
          color="primary"
          (click)="reload()"
          [disabled]="!selectedInvernadero"
          class="btn btn-sm btn-outline"
        >
          <i class="fas fa-sync-alt mr-2"></i> Actualizar
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-6 space-y-6 bg-base-200">
        <!-- FILTROS -->
        <div class="grid gap-4"
             style="grid-template-columns: calc(100% * var(--inv-phi)) 1fr minmax(auto, 20rem);">
          <app-filtro-select
            label="Invernadero"
            [options]="optInvernadero"
            [selectedId]="selectedInvernadero"
            (selectionChange)="onInvernaderoChange($event)"
          ></app-filtro-select>

          <app-filtro-select
            label="Zona"
            [options]="optZona"
            [selectedId]="selectedZona"
            (selectionChange)="onZonaChange($event)"
          ></app-filtro-select>

          <app-filtro-select
            label="Proyección"
            [options]="optProjection"
            [selectedId]="selectedProjection"
            (selectionChange)="onProjectionChange($event)"
          ></app-filtro-select>
        </div>

        <!-- MENSAJE TEMPORAL “No existen datos…” DURANTE 5s -->
        <div *ngIf="showNoDataMsg"
             class="absolute left-0 right-0 mt-4 mx-auto w-fit px-4 py-2 bg-red-100 border border-red-300 text-red-800 rounded shadow">
          No existen datos para predicción.
        </div>

        <!-- GRÁFICO -->
        <mat-card class="bg-base-100 p-6 shadow-xl animate-fade-in-down relative" style="min-height: 320px;">
          <div class="w-full" style="height: min(max(300px, 40vh), 55vh);">
            <app-prediction-chart
              [historical]="data?.historical ?? []"
              [future]    ="data?.future     ?? []"
              [label]     ="selectedProjectionLabel"
            ></app-prediction-chart>
          </div>
        </mat-card>

        <!-- RESUMEN & TENDENCIA -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          <!-- SummaryCardComponent internamente mostrará “No hay un resumen disponible” 
               si recibe summary = undefined -->
          <app-summary-card class="h-full" [summary]="data?.summary"></app-summary-card>
          <app-trend-card    class="h-full" [trend]="uiTrend"></app-trend-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; position: relative; }
    :root {
      --phi: 1.618;
      --inv-phi: 0.618;
      --header-height: 3rem;
    }
  `]
})
export class PrediccionesComponent implements OnInit {
  invernaderos:    Invernadero[] = [];
  zonas:            Zona[]         = [];
  optInvernadero:  {id:number;label:string}[] = [];
  optZona:         {id:number;label:string}[] = [];

  optProjection = [
    { id: 6,  label: '6 horas'  },
    { id: 12, label: '12 horas' },
    { id: 24, label: '24 horas' }
  ];

  /** Filtros seleccionados */
  selectedInvernadero?: number;
  selectedZona?:         number;
  selectedProjection = 6;

  /** Resultado de la llamada al backend (o undefined si no hay datos) */
  data?: PredicResult;
  uiTrend?: UITrend;

  /** Control para mostrar el mensaje “No existen datos…” durante 5s */
  showNoDataMsg = false;

  constructor(private svc: PrediccionesService) {}

  ngOnInit() {
    // Cargar la lista de invernaderos
    this.svc.getInvernaderos().subscribe({
      next: (list) => {
        this.invernaderos   = list;
        this.optInvernadero = list.map(x => ({ id: x.id, label: x.nombre }));
      },
      error: (err) => {
        console.error('Error al cargar invernaderos:', err);
      }
    });
  }

  get selectedProjectionLabel(): string {
    return this.optProjection.find(p => p.id === this.selectedProjection)?.label ?? '';
  }

  onInvernaderoChange(id: number | undefined) {
    if (id == null) {
      this.selectedZona = undefined;
      this.zonas = [];
      return;
    }
    this.selectedInvernadero = id;
    // Cargar zonas asociadas al invernadero
    this.svc.getZonasByInvernadero(id).subscribe({
      next: (list) => {
        this.zonas   = list;
        this.optZona = list.map(z => ({ id: z.id, label: z.nombre }));
      },
      error: (err) => {
        console.error('Error al cargar zonas:', err);
        this.zonas = [];
      }
    });
  }

  onZonaChange(id: number | undefined) {
    this.selectedZona = id ?? undefined;
  }

  onProjectionChange(h: number | undefined) {
    if (h != null) {
      this.selectedProjection = h as 6|12|24;
    }
  }

  reload() {
    if (!this.selectedInvernadero) {
      // Si no hay invernadero seleccionado, nada que hacer
      return;
    }

    const params: PredicParams = {
      invernaderoId: this.selectedInvernadero,
      zonaId:        this.selectedZona,
      horas:         this.selectedProjection as 6|12|24
    };

    this.svc.getPredicciones(params).subscribe({
      next: (res: PredicResult) => {
        // Si no hay historiales (o están vacíos), activar mensaje temporal
        if (!res.historical || res.historical.length === 0) {
          this.data = undefined;
          this.uiTrend = undefined;
          this.mostrarMensajeNoData();
          return;
        }
        // Si sí hay datos, asignar normalmente
        this.data = res;
        this.uiTrend = this.mapTrend(res.trend);
      },
      error: (err) => {
        // Ante cualquier error, limpiar data y mostrar mensaje
        console.warn('No se pudieron obtener predicciones:', err);
        this.data = undefined;
        this.uiTrend = undefined;
        this.mostrarMensajeNoData();
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
    let type: UITrend['type'];
    switch (api.icon) {
      case 'arrow-up':   type = 'up';     break;
      case 'arrow-down': type = 'down';   break;
      default:           type = 'stable'; break;
    }
    return {
      title:   api.text,
      message: api.comparison,
      type
    };
  }
}
