// src/app/predicciones/predicciones.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { FormsModule }       from '@angular/forms';
import { HttpClientModule }  from '@angular/common/http';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule }    from '@angular/material/select';
import { MatButtonModule }    from '@angular/material/button';
import { MatCardModule }      from '@angular/material/card';

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
import { SummaryCardComponent } from './components/summary-card.component';
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
        <div class="grid gap-4" style="grid-template-columns: calc(100% * var(--inv-phi)) 1fr minmax(auto, 20rem);">
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
          <app-summary-card
            class="h-full"
            [summary]="data?.summary"
            [projectionLabel]="selectedProjectionLabel"
          ></app-summary-card>
          <app-trend-card class="h-full" [trend]="uiTrend"></app-trend-card>
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

  selectedInvernadero?: number;
  selectedZona?:         number;
  selectedProjection = 6;

  data?: PredicResult;
  uiTrend?: UITrend;

  constructor(private svc: PrediccionesService) {}

  ngOnInit() {
    this.svc.getInvernaderos().subscribe(list => {
      this.invernaderos   = list;
      this.optInvernadero = list.map(x => ({ id: x.id, label: x.nombre }));
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
    this.svc.getZonasByInvernadero(id).subscribe(list => {
      this.zonas   = list;
      this.optZona = list.map(z => ({ id: z.id, label: z.nombre }));
    });
  }

  onZonaChange(id: number | undefined) {
    this.selectedZona = id ?? undefined;
  }

  onProjectionChange(h: number | undefined) {
    if (h != null) this.selectedProjection = h as 6|12|24;
  }

  reload() {
    if (!this.selectedInvernadero) return;

    const params: PredicParams = {
      invernaderoId: this.selectedInvernadero!,
      zonaId:        this.selectedZona,
      horas:         this.selectedProjection as 6|12|24
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
        if (!res.historical?.length) {
          this.data = undefined;
          this.uiTrend = undefined;
          return;
        }

        this.data = res;
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
        if (diff <= -2) {
          action = '⚠️ Temperatura bajará: revisar calefacción';
        } else if (diff >= 2) {
          action = '⚠️ Temperatura subirá: verificar ventilación';
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
        console.error('Error al obtener predicciones:', err);
        this.data = undefined;
        this.uiTrend = undefined;
      }
    });
  }

  private mapTrend(api: APITrend): UITrend {
    let type: UITrend['type'] = 'stable';
    if (api.icon === 'arrow-up')   type = 'up';
    if (api.icon === 'arrow-down') type = 'down';
    return { title: api.text, message: api.comparison, type };
  }
}
