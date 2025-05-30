import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sensor } from '../models/sensor.model';
import { SensorModalType } from '../sensor-modal.service';

@Component({
  selector: 'app-sensor-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card bg-base-100 shadow-lg p-6">
      <!-- Header -->
      <div class="flex justify-between items-center mb-2">
        <h3 class="text-lg font-semibold">{{ sensor.nombre }}</h3>

        <ng-container *ngIf="sensor.alertaActiva !== undefined; else loadingEstado">
          <span
            class="badge badge-sm"
            [ngClass]="{
              'badge-error': sensor.alertaActiva,
              'badge-success': !sensor.alertaActiva && sensor.estado === 'Activo',
              'badge-warning': !sensor.alertaActiva && sensor.estado === 'Inactivo',
              'badge-neutral': !sensor.alertaActiva && sensor.estado === 'Mantenimiento'
            }"
          >
            {{ sensor.alertaActiva ? 'Alerta' : sensor.estado }}
          </span>
        </ng-container>
        <ng-template #loadingEstado>
          <div class="skeleton h-4 w-24 rounded bg-base-300 animate-pulse opacity-60"></div>
        </ng-template>
      </div>

      <!-- Detalles -->
      <ul class="text-sm mb-2 space-y-1">
        <li><strong>Tipo:</strong> {{ sensor.tipo_sensor.nombre }}</li>
        <li><strong>Zona:</strong> {{ sensor.zona?.nombre ?? '—' }}</li>
        <li><strong>Inv.:</strong> {{ sensor.invernadero?.nombre ?? '—' }}</li>
        <li>
          <ng-container *ngIf="sensor.ultimaLectura !== undefined; else loadingLectura">
            <ng-container *ngIf="sensor.ultimaLectura?.time as t; else noData">
              <strong>Última:</strong> {{ t | date:'short' }}
            </ng-container>
            <ng-template #noData><strong>Última:</strong> — sin datos —</ng-template>
          </ng-container>
          <ng-template #loadingLectura>
            <div class="skeleton h-4 w-24 rounded bg-base-300 animate-pulse opacity-60"></div>
          </ng-template>
        </li>
      </ul>

      <!-- Valores de última lectura -->
      <div *ngIf="sensor.ultimaLectura !== undefined; else loadingValores">
        <div class="text-sm mb-4" *ngIf="sensor.ultimaLectura?.parametros?.length; else noVals">
          <div *ngFor="let p of sensor.ultimaLectura?.parametros || []; let i = index">
            {{ p }}: {{ sensor.ultimaLectura?.valores?.[i] ?? '—' }} {{ getUnidad(p) }}
          </div>
        </div>
        <ng-template #noVals>
          <div class="text-sm text-gray-500">Sin lecturas</div>
        </ng-template>
      </div>

      <ng-template #loadingValores>
        <div class="space-y-1 mb-4">
          <div class="skeleton h-4 w-32 rounded bg-base-300 animate-pulse opacity-60"></div>
        </div>
      </ng-template>

      <!-- Acciones -->
      <div class="flex justify-end space-x-2">
        <!-- Ver -->
        <button
          class="btn btn-sm btn-ghost btn-circle"
          (click)="accion.emit({ tipo: 'view', sensor })"
          aria-label="Ver sensor"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
               viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7
                     -1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>

        <!-- Editar -->
        <button
          class="btn btn-sm btn-ghost btn-circle"
          (click)="accion.emit({ tipo: 'edit', sensor })"
          aria-label="Editar sensor"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
               viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h12
                     a2 2 0 002-2v-5m-7-5l7-7m0 0l-7 7m7-7H11" />
          </svg>
        </button>

        <!-- Eliminar -->
        <button
          class="btn btn-sm btn-ghost btn-circle"
          (click)="accion.emit({ tipo: 'delete', sensor })"
          aria-label="Eliminar sensor"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
               viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862
                     a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5
                     a1 1 0 011-1h6a1 1 0 011 1v2" />
          </svg>
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class SensorCardComponent {
  @Input() sensor!: Sensor;
  @Output() accion = new EventEmitter<{ tipo: SensorModalType; sensor: Sensor }>();

  getUnidad(param: string): string {
    const m = this.sensor.parametros.find(x => x.nombre === param);
    return m?.unidad || '';
  }
}
