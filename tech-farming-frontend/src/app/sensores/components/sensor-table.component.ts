import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sensor } from '../models/sensor.model';
import { SensorModalType } from '../sensor-modal.service';

@Component({
  selector: 'app-sensor-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="overflow-x-auto hidden md:block p-6">
      <table class="table table-zebra w-full">
        <thead>
          <tr class="text-base-content font-bold">
            <th>Nombre</th>
            <th>Tipo de sensor</th>
            <th>Zona</th>
            <th>Invernadero</th>
            <th>Estado</th>
            <th>Última lectura</th>
            <th>Parámetros</th>
            <th>Valores</th>
            <th class="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody *ngIf="!loading; else loadingRows">
          <tr *ngFor="let s of sensores; trackBy: trackByFn" class="hover">
            <td>{{ s.nombre }}</td>
            <td>{{ s.tipo_sensor.nombre }}</td>
            <td>{{ getZonaName(s) }}</td>
            <td>{{ getInvernaderoName(s) }}</td>
            <td>
              <span
                class="badge badge-md"
                [ngClass]="{
                  'badge-error': s.alertaActiva,
                  'badge-success': !s.alertaActiva && s.estado === 'Activo',
                  'badge-warning': !s.alertaActiva && s.estado === 'Inactivo',
                  'badge-neutral': !s.alertaActiva && s.estado === 'Mantenimiento'
                }">
                {{ s.alertaActiva ? 'Alerta' : s.estado }}
              </span>
            </td>
            <td>
              <ng-container *ngIf="s.ultimaLectura?.time as t; else noData">
                {{ t | date: 'short' }}
              </ng-container>
              <ng-template #noData>— sin datos —</ng-template>
            </td>
            <td>
              <ul class="space-y-1">
                <li *ngFor="let param of s.parametros">{{ param.nombre }}</li>
              </ul>
            </td>
            <td>
              <ng-container *ngIf="s.ultimaLectura?.parametros?.length; else noVal">
                <div *ngFor="let line of getValorLines(s)">
                  {{ line }}
                </div>
              </ng-container>
              <ng-template #noVal>—</ng-template>
            </td>
            <td class="flex justify-center space-x-1">
              <!-- Ver sensor -->
              <button
                class="btn btn-sm btn-ghost btn-circle border border-transparent hover:border-success hover:bg-success/10 transition-colors duration-200"
                (click)="accion.emit({ tipo: 'view', sensor: s })"
                aria-label="Ver sensor"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 stsroke-base-content group-hover:stroke-success" fill="none"
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
                *ngIf="puedeEditar"
                class="btn btn-sm btn-ghost btn-circle border border-transparent hover:border-success hover:bg-success/10 transition-colors duration-200"
                (click)="accion.emit({ tipo: 'edit', sensor: s })"
                aria-label="Editar sensor"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 stroke-base-content group-hover:stroke-success" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h12
                          a2 2 0 002-2v-5m-7-5l7-7m0 0l-7 7m7-7H11" />
                </svg>
              </button>

              <!-- Eliminar -->
              <button
                *ngIf="puedeEliminar"
                class="btn btn-sm btn-ghost btn-circle border border-transparent hover:border-error hover:bg-error/10 transition-colors duration-200"
                (click)="accion.emit({ tipo: 'delete', sensor: s })"
                aria-label="Eliminar sensor"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 stroke-base-content group-hover:stroke-success" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862
                          a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5
                          a1 1 0 011-1h6a1 1 0 011 1v2" />
                </svg>
              </button>
            </td>
          </tr>
        </tbody>
        <ng-template #loadingRows>
          <tr *ngFor="let _ of skeletonArray" class="hover">
            <td colspan="9">
              <div class="skeleton h-6 w-full rounded bg-base-300 animate-pulse opacity-60"></div>
            </td>
          </tr>
        </ng-template>
      </table>
    </div>
  `,
  styles: [`
    :host { display: block; }
    ul { margin: 0; padding: 0; list-style: none; }
  `]
})
  export class SensorTableComponent {
    @Input() puedeEditar = false;
    @Input() puedeEliminar = false;
    @Input() sensores: Sensor[] = [];
    @Input() loading = false;
    @Input() rowCount = 5;
    @Input() trackByFn!: (_: number, item: Sensor) => any;
    @Output() accion = new EventEmitter<{ tipo: SensorModalType; sensor: Sensor }>();
  getZonaName(s: Sensor): string {
    return s.zona?.nombre ?? '— sin zona —';
  }

  getInvernaderoName(s: Sensor): string {
    return s.invernadero?.nombre ?? '— sin invernadero —';
  }

    getValorLines(s: Sensor): string[] {
      const ult = s.ultimaLectura;
      if (!ult?.parametros?.length) return [];
    return ult.parametros.map((nombre, idx) => {
      const valor = Array.isArray(ult.valores) && ult.valores[idx] != null
        ? ult.valores[idx]
        : '—';
      const meta = s.parametros.find(p => p.nombre === nombre);
      const unidad = meta?.unidad ? ` ${meta.unidad}` : '';
      return `${nombre}: ${valor}${unidad}`.trim();
    });
  }

  get skeletonArray() {
    return Array.from({ length: this.rowCount });
  }
}