import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { Alerta } from '../../models/index';

@Component({
  selector: 'app-active-alerts',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule],
  template: `
    <table mat-table [dataSource]="alertas" class="w-full mat-elevation-z1">
      <!-- Fecha -->
      <ng-container matColumnDef="fecha_hora">
        <th mat-header-cell *matHeaderCellDef><span class="text-base-content font-bold">Fecha</span></th>
        <td mat-cell *matCellDef="let a">{{ a.fecha_hora | date:'short' }}</td>
      </ng-container>

      <!-- Sensor -->
      <ng-container matColumnDef="sensor_nombre">
        <th mat-header-cell *matHeaderCellDef><span class="text-base-content font-bold">Sensor</span></th>
        <td mat-cell *matCellDef="let a" >{{ a.sensor_nombre || '-' }}</td>
      </ng-container>

      <!-- Tipo de Parámetro -->
      <ng-container matColumnDef="tipo_parametro">
        <th mat-header-cell *matHeaderCellDef><span class="text-base-content font-bold">Parámetro</span></th>
        <td mat-cell *matCellDef="let a">{{ a.tipo_parametro || '-' }}</td>
      </ng-container>
      
      <!-- Nivel -->
      <ng-container matColumnDef="nivel">
        <th mat-header-cell *matHeaderCellDef><span class="text-base-content font-bold">Nivel</span></th>
        <td mat-cell *matCellDef="let a">
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
      </ng-container>

      <!-- Mensaje -->
      <ng-container matColumnDef="mensaje">
        <th mat-header-cell *matHeaderCellDef><span class="text-base-content font-bold">Mensaje</span></th>
        <td mat-cell *matCellDef="let a">{{ a.mensaje }}</td>
      </ng-container>

      <!-- Acciones -->
      <ng-container matColumnDef="acciones">
        <th mat-header-cell *matHeaderCellDef><span class="text-base-content font-bold">Acciones</span></th>
        <td mat-cell *matCellDef="let a">
          <button
            class="btn btn-outline btn-sm"
            (click)="resolver.emit(a)"
            [disabled]="resolviendoId === a.id">
            <ng-container *ngIf="resolviendoId === a.id; else texto">
              <span class="loading loading-spinner loading-sm"></span>
            </ng-container>
            <ng-template #texto>Resolver</ng-template>
          </button>
        </td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
      <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
    </table>
  `
})
export class ActiveAlertsComponent {
  @Input() alertas: Alerta[] = [];
  @Input() resolviendoId: number | null = null;
  @Output() resolver = new EventEmitter<Alerta>();
  displayedColumns: string[] = ['fecha_hora', 'tipo_parametro', 'sensor_nombre', 'nivel', 'mensaje', 'acciones'];
}
