// src/app/historial/historial.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { FormsModule }       from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule }    from '@angular/material/select';
import { MatDatepickerModule }from '@angular/material/datepicker';
import { MatNativeDateModule }from '@angular/material/core';
import { MatCardModule }      from '@angular/material/card';
import { MatButtonModule }    from '@angular/material/button';

import { HistorialService } from './historial.service';
import {
  Invernadero,
  Zona,
  Sensor,
  TipoParametro,
  HistorialParams,
  HistorialData
} from '../models';

import { FiltroSelectComponent    } from './components/FiltroSelect.component';
import { FiltroDateRangeComponent } from './components/FiltroDateRange.component';
import { LineChartComponent       } from './components/line-chart.component';
import { StatsCardComponent       } from './components/stats-card.component';

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
    MatButtonModule,
    FiltroSelectComponent,
    FiltroDateRangeComponent,
    LineChartComponent,
    StatsCardComponent
  ],
  template: `
    <div class="p-6 space-y-6 bg-base-200 rounded-lg shadow">

      <!-- HEADER -->
      <div class="flex items-center justify-between">
        <h1 class="text-3xl font-bold text-base-content">Historial de Variables</h1>
        <button (click)="exportCsv()" class="btn btn-outline btn-sm flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
               viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 12v8M8 16l4 4 4-4M8 12h8" />
          </svg>
          Exportar CSV
        </button>
      </div>

      <!-- FILTROS -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <app-filtro-select
          label="Invernadero"
          [options]="optInvernadero"
          [selectedId]="selectedInvernadero"
          (selectionChange)="onInvernaderoChange($event)"
          [allowUndefined]="false"
        ></app-filtro-select>

        <app-filtro-select
          label="Zona"
          [options]="optZona"
          [selectedId]="selectedZona"
          (selectionChange)="onZonaChange($event)"
        ></app-filtro-select>

        <app-filtro-select
          label="Sensor"
          [options]="optSensor"
          [selectedId]="selectedSensor"
          (selectionChange)="onSensorChange($event)"
        ></app-filtro-select>

        <app-filtro-select
          label="Parámetro"
          [options]="optParametro"
          [selectedId]="selectedTipoParametroId"
          (selectionChange)="onParametroChange($event)"
          [allowUndefined]="false"
        ></app-filtro-select>

        <app-filtro-date-range
          label="Rango de fechas"
          [from]="rango.from"
          [to]="rango.to"
          (rangeChange)="onRangoChange($event)"
        ></app-filtro-date-range>
      </div>

      <!-- BOTÓN ACTUALIZAR -->
      <div class="text-right">
        <button mat-raised-button color="primary"
                class="bg-primary text-primary-content hover:bg-primary-content hover:text-primary"
                (click)="reloadHistorial()">
          Actualizar
        </button>
      </div>

      <!-- ALERTA “NO HAY DATOS” -->
      <div *ngIf="noData" class="border-l-4 border-yellow-500 bg-yellow-100 text-yellow-800 p-4 rounded">
        ⚠️ No hay datos disponibles para los filtros seleccionados.
      </div>

      <!-- GRÁFICO -->
      <mat-card class="bg-base-100 p-4 animate-fade-in-down overflow-hidden">
        <div class="chart-wrapper w-full">
          <app-line-chart
            [data]="historial?.series ?? []"
            [label]="nombreParametroSeleccionado"
            class="w-full h-full"
          ></app-line-chart>
        </div>
      </mat-card>

      <!-- ESTADÍSTICAS -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <app-stats-card title="Promedio"
                        [value]="historial?.stats?.promedio ?? 0">
        </app-stats-card>

        <app-stats-card title="Mínimo"
                        [value]="historial?.stats?.minimo?.value ?? 0"
                        [subtext]="historial?.stats?.minimo?.fecha ?? ''">
        </app-stats-card>

        <app-stats-card title="Máximo"
                        [value]="historial?.stats?.maximo?.value ?? 0"
                        [subtext]="historial?.stats?.maximo?.fecha">
        </app-stats-card>

        <app-stats-card title="Desvío estándar"
                        [value]="historial?.stats?.desviacion ?? 0">
        </app-stats-card>
      </div>

    </div>
  `,
  styles: [`
    :host { display: block; }
    .chart-wrapper { min-height: 300px; max-height: 48vh; height: 48vh; position: relative; }
    mat-card { overflow: hidden; }
  `]
})
export class HistorialComponent implements OnInit {
  invernaderos: Invernadero[]   = [];
  zonas:        Zona[]          = [];
  sensores:     Sensor[]        = [];
  tiposParametro: TipoParametro[] = [];
  historial?:   HistorialData;
  noData = false;

  optInvernadero: Array<{id:number; label:string}> = [];
  optZona:        Array<{id:number; label:string}> = [];
  optSensor:      Array<{id:number; label:string}> = [];
  optParametro:   Array<{id:number; label:string}> = [];

  selectedInvernadero?:    number;
  selectedZona?:           number;
  selectedSensor?:         number;
  selectedTipoParametroId!: number;
  rango = { from: new Date(), to: new Date() };

  constructor(private historialService: HistorialService) {}

  ngOnInit() {
    this.historialService.getInvernaderos()
      .subscribe(list => {
        this.invernaderos = list;
        this.optInvernadero = list.map(i => ({ id: i.id, label: i.nombre }));
        if (list.length) this.onInvernaderoChange(list[0].id);
      });

    this.historialService.getTiposParametro()
      .subscribe(list => {
        this.tiposParametro = list;
        this.optParametro   = list.map(t => ({ id: t.id, label: t.nombre }));
        if (list.length) this.selectedTipoParametroId = list[0].id;
      });
  }

  get nombreParametroSeleccionado(): string {
    const t = this.tiposParametro.find(t => t.id === this.selectedTipoParametroId);
    return t ? t.nombre : '';
  }

  onInvernaderoChange(id: number|undefined) {
    this.selectedInvernadero = id;
    this.optZona = []; this.zonas = []; this.selectedZona = undefined;
    this.optSensor = []; this.sensores = []; this.selectedSensor = undefined;
    this.noData = false;
    if (id != null) {
      this.historialService.getZonasByInvernadero(id)
        .subscribe(list => {
          this.zonas   = list;
          this.optZona = list.map(z => ({ id: z.id, label: z.nombre }));
          if (list.length) this.onZonaChange(list[0].id);
        });
    }
  }

  onZonaChange(id: number|undefined) {
    this.selectedZona = id;
    this.optSensor = []; this.sensores = []; this.selectedSensor = undefined;
    this.noData = false;
    if (id != null) {
      this.historialService.getSensoresByZona(id)
        .subscribe(list => {
          this.sensores  = list;
          this.optSensor = list.map(s => ({ id: s.id, label: s.nombre }));
          if (list.length) this.onSensorChange(list[0].id);
        });
    }
  }

  onSensorChange(id: number|undefined) {
    this.selectedSensor = id;
  }

  onParametroChange(id: number|undefined) {
    this.selectedTipoParametroId = id!;
  }

  onRangoChange(r: { from: Date; to: Date }) {
    this.rango = r;
  }

  reloadHistorial() {
  // 1) Reset previo: todas las fechas en '' para respetar string
  this.noData    = false;
  this.historial = {
    series: [],
    stats: {
      promedio: 0,
      minimo:   { value: 0, fecha: '' },
      maximo:   { value: 0, fecha: '' },
      desviacion: 0
    }
  };

  // 2) Validación básica
  if (!this.selectedInvernadero || !this.selectedTipoParametroId) {
    return;
  }

  // 3) Preparo params
  const p: HistorialParams = {
    invernaderoId:   this.selectedInvernadero,
    zonaId:          this.selectedZona,
    sensorId:        this.selectedSensor,
    tipoParametroId: this.selectedTipoParametroId,
    fechaDesde:      this.rango.from,
    fechaHasta:      this.rango.to
  };

  // 4) Llamada y manejo de respuesta
  this.historialService.getHistorial(p)
    .subscribe(
      data => {
        if (data.series.length === 0) {
          // no hay datos → mantengo el reset y muestro alerta
          this.noData = true;
          setTimeout(() => this.noData = false, 2500);
        } else {
          // datos reales
          this.historial = data;
        }
      },
      err => {
        console.error('Error al cargar historial:', err);
        this.noData = true;
        setTimeout(() => this.noData = false, 2500);
      }
    );
}


  exportCsv() {
    if (!this.historial) return;
    const csv = this.historial.series.map(s => `${s.timestamp},${s.value}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a   = document.createElement('a');
    a.href    = url;
    a.download = 'historial.csv';
    a.click();
    URL.revokeObjectURL(url);
  }
}
