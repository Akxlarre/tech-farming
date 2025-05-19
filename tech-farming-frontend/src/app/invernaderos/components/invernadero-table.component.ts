import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Invernadero } from '../models/invernadero.model';

@Component({
  selector: 'app-invernadero-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="overflow-x-auto hidden md:block">
      <table class="table table-zebra w-full">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Sensores Activos</th>
            <th>Estado</th>
            <th>Creación</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let inv of invernaderos" class="hover">
            <td>{{ inv.nombre }}</td>
            <td>{{ inv.sensoresActivos ?? 0 }}</td>
            <td>
              <span
                class="badge badge-md"
                [ngClass]="{
                  'badge-success': inv.estado === 'Activo',
                  'badge-warning': inv.estado === 'Inactivo',
                  'badge-error': inv.estado === 'Mantenimiento'
                }"
              >
                {{ inv.estado }}
              </span>
            </td>
            <td>{{ inv.creado_en | date:'short' }}</td>
            <td class="space-x-2">
              <button
                class="btn btn-sm btn-ghost"
                (click)="viewInvernadero.emit(inv)"
                aria-label="Ver"
              >👁️</button>
              <button
                class="btn btn-sm btn-ghost"
                (click)="editInvernadero.emit(inv)"
                aria-label="Editar"
              >✏️</button>
              <button
                class="btn btn-sm btn-error"
                (click)="deleteInvernadero.emit(inv)"
                aria-label="Eliminar"
              >🗑️</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class InvernaderoTableComponent {
  @Input() invernaderos: Invernadero[] = [];
  @Output() viewInvernadero   = new EventEmitter<Invernadero>();
  @Output() editInvernadero   = new EventEmitter<Invernadero>();
  @Output() deleteInvernadero = new EventEmitter<Invernadero>();
}
