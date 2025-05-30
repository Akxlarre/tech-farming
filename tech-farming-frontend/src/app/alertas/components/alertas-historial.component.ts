import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { Alerta } from '../../models/index';

@Component({
  selector: 'app-alerts-history',
  standalone: true,
  imports: [CommonModule, MatTableModule],
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
        <td mat-cell *matCellDef="let a">{{ a.sensor_nombre || '-' }}</td>
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

      <!-- Resuelta por -->
      <ng-container matColumnDef="resuelta_por">
        <th mat-header-cell *matHeaderCellDef><span class="text-base-content font-bold">Resuelta por</span></th>
        <td mat-cell *matCellDef="let a">{{ a.resuelta_por }}</td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
      <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
    </table>
  `
})
export class AlertsHistoryComponent {
  @Input() alertas: Alerta[] = [];
  displayedColumns: string[] = ['fecha_hora', 'tipo_parametro', 'sensor_nombre', 'nivel', 'mensaje', 'resuelta_por'];
}
