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

      <!-- Acciones -->
      <ng-container matColumnDef="acciones">
        <th mat-header-cell *matHeaderCellDef>Acciones</th>
        <td mat-cell *matCellDef="let a">
          <button mat-button color="accent" (click)="resolver.emit(a)">Resolver</button>
        </td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
      <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
    </table>
  `
})
export class ActiveAlertsComponent {
  @Input() alertas: Alerta[] = [];
  @Output() resolver = new EventEmitter<Alerta>();
  displayedColumns: string[] = ['fecha_hora', 'sensor_parametro_id', 'nivel', 'mensaje', 'acciones'];
}
