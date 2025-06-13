// src/app/historial/historial.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

import { HistorialService } from './historial.service';
import {
  HistorialParams,
  HistorialData,
  TipoParametro
} from '../models';

import { FiltroComponent } from './components/filtro.component';
import { LineChartComponent } from './components/line-chart.component';
import { StatsCardComponent } from './components/stats-card.component';
import { HistorialHeaderComponent } from './components/historial-header.component';
import { ExportService } from '../shared/services/export.service';

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    FiltroComponent,
    LineChartComponent,
    StatsCardComponent,
    HistorialHeaderComponent
  ],
  template: `

      <app-historial-header
        [title]="'Historial de Variables'"
        (exportar)="onExport($event)"
      ></app-historial-header>
      <!-- COMPONENTE DE FILTROS -->
      <app-filtro-global (filtrosSubmit)="onFiltrosAplicados($event)"></app-filtro-global>

      <!-- CONTENEDOR siempre visible del gráfico -->
      <div class="relative w-full h-96 bg-base-100 rounded-lg overflow-hidden">

        <!-- Spinner semitransparente (cargando) -->
        <div *ngIf="isLoading" class="absolute inset-0 flex items-center justify-center bg-base-200/50 z-20">
          <svg class="animate-spin h-10 w-10 text-success" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
          <span class="ml-2 text-base-content/70">Cargando datos…</span>
        </div>

        <!-- Banner “No hay datos” mejorado -->
        <div
          *ngIf="!isLoading && noData"
          class="
            absolute inset-x-0 top-0
            alert alert-warning
            rounded-b-none
            shadow-md
            flex justify-between items-center
            p-4
            z-10
            transition-opacity duration-300
          "
        >
          <div class="flex items-center space-x-2">
            <i class="fas fa-exclamation-triangle text-xl text-warning-content"></i>
            <span class="font-semibold text-warning-content">No hay datos para estos filtros</span>
          </div>
          <button (click)="noData = false" class="btn btn-ghost btn-sm btn-circle">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Placeholder guía inicial (ilustración + texto) -->
        <div
          *ngIf="!isLoading && !historial && !noData"
          class="
            absolute inset-0 flex items-center justify-center
            px-8
            z-0
          "
        >
          <div class="flex items-center space-x-6">
            <!-- Icono representativo de gráfico vacío -->
            <i class="fas fa-chart-line text-6xl text-base-content/30"></i>

            <!-- Texto explicativo -->
            <div class="flex flex-col">
              <p class="text-xl font-semibold text-base-content/70">Tu historial aparecerá aquí</p>
              <p class="text-sm text-base-content/60 mt-1">
                Selecciona un Invernadero y un Parámetro, luego pulsa “Aplicar filtros” para cargar los datos.
              </p>
            </div>
          </div>
        </div>

        <!-- El gráfico real -->
        <div *ngIf="!isLoading && historial" class="w-full h-full z-0">
          <app-line-chart
            [data]="historial.series"
            [label]="textoParametro"
            class="w-full h-full"
          ></app-line-chart>
        </div>
      </div>

      <!-- Tarjetas de estadísticas (sólo con datos) -->
      <div *ngIf="!isLoading && historial" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <app-stats-card title="Promedio" [value]="historial!.stats.promedio"></app-stats-card>
        <app-stats-card
          title="Mínimo"
          [value]="historial!.stats.minimo.value"
          [subtext]="historial!.stats.minimo.fecha"
        ></app-stats-card>
        <app-stats-card
          title="Máximo"
          [value]="historial!.stats.maximo.value"
          [subtext]="historial!.stats.maximo.fecha"
        ></app-stats-card>
        <app-stats-card title="Desvío estándar" [value]="historial!.stats.desviacion"></app-stats-card>
      </div>

      <!-- Placeholder de estadísticas -->
      <div *ngIf="!isLoading && !historial" class="text-center text-base-content/50 italic mt-6">
        Aplica un filtro para ver estadísticas
      </div>
  `,
  styles: [`
    :host { display: block; }

    /* Contenedor siempre visible del gráfico */
    .relative        { position: relative; }
    .w-full          { width: 100%; }
    .h-96            { height: 24rem; } /* equivalente a h-96 en Tailwind */
    .bg-base-100     { background-color: var(--p-base-100); }
    .rounded-lg      { border-radius: 0.5rem; }
    .overflow-hidden { overflow: hidden; }

    /* Placeholder guía inicial */
    .text-base-content\\/30 { color: rgba(55,65,81,0.3); } /* ícono gris opaco 30% */
    .text-base-content\\/70 { color: rgba(55,65,81,0.7); } /* texto principal 70% */
    .text-base-content\\/60 { color: rgba(55,65,81,0.6); } /* subtítulo 60% */
    .text-base-content\\/50 { color: rgba(55,65,81,0.5); } /* texto de estadísticas 50% */

    /* Márgenes y espaciados */
    .space-x-6 { margin-right: 1.5rem; }
    .mt-1      { margin-top: 0.25rem; }
    .mt-6      { margin-top: 1.5rem; }
    .px-8      { padding-left: 2rem; padding-right: 2rem; }
  `]
})
export class HistorialComponent implements OnInit {
  tiposParametro: TipoParametro[] = [];
  historial?: HistorialData;

  /** Indicadores de estado */
  isLoading = false;
  noData = false;

  /** Texto del eje Y (nombre del parámetro seleccionado) */
  textoParametro = '';

  constructor(
    private historialService: HistorialService,
    private exportSvc: ExportService
  ) { }

  ngOnInit() {
    // Pre-cargamos la lista de Tipos de Parámetro
    this.historialService.getTiposParametro().subscribe(list => {
      this.tiposParametro = list;
    });
  }

  /**
   * Se invoca al enviar los filtros completos desde FiltroComponent.
   */
  onFiltrosAplicados(params: HistorialParams) {
    this.isLoading = true;
    this.noData = false;
    this.historial = undefined;

    this.historialService.getHistorial(params).subscribe(
      data => {
        this.isLoading = false;

        if (data.series.length === 0) {
          // Mostrar banner overlay
          this.noData = true;
        } else {
          // Guardar datos y nombre del parámetro
          this.historial = data;
          const tipoSel = this.tiposParametro.find(t => t.id === params.tipoParametroId);
          this.textoParametro = tipoSel ? tipoSel.nombre : '';
        }
      },
      err => {
        console.error('Error al cargar historial:', err);
        this.isLoading = false;
        this.noData = true;
      }
    );
  }

  /**
   * Maneja la exportación según el formato elegido.
   */
  onExport(format: 'pdf' | 'excel' | 'csv') {
    if (!this.historial) return;
    const data = this.historial.series.map(s => ({ timestamp: s.timestamp, value: s.value }));
    switch (format) {
      case 'csv':
        this.exportSvc.toCsv(data, 'historial');
        break;
      case 'excel':
        this.exportSvc.toExcel(data, 'historial');
        break;
      case 'pdf':
        this.exportSvc.toPdf(data, 'historial');
        break;
    }
  }
}
