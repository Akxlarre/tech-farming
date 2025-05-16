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
        <th mat-header-cell *matHeaderCellDef>Fecha</th>
        <td mat-cell *matCellDef="let a">{{ a.fecha_hora | date:'short' }}</td>
      </ng-container>

      <!-- Sensor -->
      <ng-container matColumnDef="sensor_parametro_id">
        <th mat-header-cell *matHeaderCellDef>Sensor</th>
        <td mat-cell *matCellDef="let a">{{ a.sensor_parametro_id }}</td>
      </ng-container>

      <!-- Nivel -->
      <ng-container matColumnDef="nivel">
        <th mat-header-cell *matHeaderCellDef>Nivel</th>
        <td mat-cell *matCellDef="let a">{{ a.nivel }}</td>
      </ng-container>

      <!-- Mensaje -->
      <ng-container matColumnDef="mensaje">
        <th mat-header-cell *matHeaderCellDef>Mensaje</th>
        <td mat-cell *matCellDef="let a">{{ a.mensaje }}</td>
      </ng-container>

      <!-- Estado -->
      <ng-container matColumnDef="estado">
        <th mat-header-cell *matHeaderCellDef>Estado</th>
        <td mat-cell *matCellDef="let a">{{ a.estado }}</td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
      <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
    </table>
  `
})
export class AlertsHistoryComponent {
  @Input() alertas: Alerta[] = [];
  displayedColumns: string[] = ['fecha_hora', 'sensor_parametro_id', 'nivel', 'mensaje', 'estado'];
}
