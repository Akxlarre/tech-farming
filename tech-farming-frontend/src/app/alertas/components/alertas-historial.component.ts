import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Alerta } from '../../models/index';

@Component({
  selector: 'app-alerts-history',
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
          <th>Resuelta por</th>
        </tr>
      </thead>
      <tbody>
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
          <td>{{ a.resuelta_por }}</td>
        </tr>
      </tbody>
    </table>
  `
})
export class AlertsHistoryComponent {
  @Input() alertas: Alerta[] = [];
}
