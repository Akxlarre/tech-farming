import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Alerta } from '../../models/index';

@Component({
  selector: 'app-active-alerts',
  standalone: true,
  imports: [CommonModule],
  template: `
    <table class="table w-full">
      <thead>
        <tr class="text-base-content font-bold">
          <th>Fecha</th>
          <th>Sensor</th>
          <th>Parámetro</th>
          <th>Nivel</th>
          <th>Mensaje</th>
          <th class="text-right">Acciones</th>
        </tr>
      </thead>
      <tbody *ngIf="!loading; else loadingRows">
        <tr *ngFor="let a of alertas">
          <td>{{ a.fecha_hora | date:'short' }}</td>
          <td>{{ a.sensor_nombre || '-' }}</td>
          <td>{{ a.tipo_parametro || '-' }}</td>
          <td>
            <span
              class="badge badge-md"
              [ngClass]="{
                'badge-warning': a.nivel === 'Advertencia',
                'badge-error': a.nivel === 'Crítico'
              }"
            >
              {{ a.nivel }}
            </span>
          </td>
          <td>{{ a.mensaje }}</td>
          <td class="text-right">
            <button
              class="btn btn-outline btn-sm"
              (click)="resolver.emit(a)"
              [disabled]="resolviendoId === a.id"
            >
              <ng-container *ngIf="resolviendoId === a.id; else texto">
                <span class="loading loading-spinner loading-sm"></span>
              </ng-container>
              <ng-template #texto>Resolver</ng-template>
            </button>
          </td>
        </tr>
      </tbody>
      <ng-template #loadingRows>
        <tr *ngFor="let _ of skeletonArray">
          <td colspan="6">
            <div class="skeleton h-6 w-full rounded bg-base-300 animate-pulse opacity-60"></div>
          </td>
        </tr>
      </ng-template>
    </table>
  `
})
export class ActiveAlertsComponent {
  @Input() alertas: Alerta[] = [];
  @Input() resolviendoId: number | null = null;
  @Input() loading = false;
  @Input() rowCount = 5;
  @Output() resolver = new EventEmitter<Alerta>();

  get skeletonArray() {
    return Array.from({ length: this.rowCount });
  }
}
