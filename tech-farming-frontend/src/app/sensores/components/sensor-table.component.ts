import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sensor } from '../models/sensor.model';

@Component({
  selector: 'app-sensor-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="overflow-x-auto hidden md:block">
      <table class="table table-zebra w-full">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Tipo de sensor</th>
            <th>Zona</th>
            <th>Invernadero</th>
            <th>Estado</th>
            <th>Última lectura</th>
            <th>Parámetros</th>
            <th>Valores</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let s of sensores; trackBy: trackByFn" class="hover">
            <td>{{ s.nombre }}</td>
            <td>{{ s.tipo_sensor.nombre }}</td>
            <td>{{ getZonaName(s) }}</td>
            <td>{{ getInvernaderoName(s) }}</td>
            <td>
              <span class="badge badge-md"
                    [ngClass]="{
                      'badge-success': s.estado === 'Activo',
                      'badge-warning': s.estado === 'Inactivo',
                      'badge-error':   s.estado === 'Mantenimiento'
                    }">
                {{ s.estado }}
              </span>
            </td>
            <td>
              <ng-container *ngIf="s.ultimaLectura?.time as t; else noTime">
                {{ t | date:'short' }}
              </ng-container>
              <ng-template #noTime>— sin datos —</ng-template>
            </td>

            <!-- Lista de Parámetros embellecida -->
            <td>
              <ul class="space-y-1">
                <li *ngFor="let param of s.parametros" class="flex items-center">
                  <span>{{ param.nombre }}</span>
                </li>
              </ul>
            </td>

            <td>
              <ng-container *ngIf="s.ultimaLectura?.parametros?.length; else noData">
                <div *ngFor="let line of getValorLines(s)">
                  {{ line }}
                </div>
              </ng-container>
              <ng-template #noData>—</ng-template>
            </td>

            <td>
              <button class="btn btn-sm btn-ghost"
                      (click)="accion.emit({ tipo: 'more', sensor: s })"
                      aria-label="Más opciones">
                ⋯
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    :host { display: block; }
    ul { margin: 0; padding: 0; }
  `]
})
export class SensorTableComponent {
  @Input() sensores: Sensor[] = [];
  @Input() trackByFn!: (_: number, item: Sensor) => any;
  @Output() accion = new EventEmitter<{ tipo: string; sensor: Sensor }>();

  getZonaName(s: Sensor): string {
    return s.zona ? s.zona.nombre : '— sin zona —';
  }

  getInvernaderoName(s: Sensor): string {
    return s.invernadero ? s.invernadero.nombre : '— sin invernadero —';
  }

  getValorLines(s: Sensor): string[] {
    const ult = s.ultimaLectura;
    if (!ult?.parametros?.length) {
      return [];
    }
    return ult.parametros.map((nombre, idx) => {
      const raw = Array.isArray(ult.valores) && ult.valores[idx] != null
        ? ult.valores[idx]
        : '—';
      const meta = s.parametros.find(p => p.nombre === nombre);
      const unidad = meta?.unidad ? ` ${meta.unidad}` : '';
      return `${nombre}: ${raw}${unidad}`.trim();
    });
  }
}