// src/app/invernaderos/components/invernadero-table.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Invernadero } from '../models/invernadero.model';

@Component({
  selector: 'app-invernadero-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="overflow-x-auto hidden md:block rounded-xl shadow-sm bg-white border border-gray-100">
      <table class="table w-full">
        <thead class="bg-gray-50 text-gray-700 uppercase text-xs font-semibold tracking-wide">
          <tr>
            <th class="py-3 px-4">Nombre de Invernadero</th>
            <th class="py-3 px-4">Sensores Activos</th>
            <th class="py-3 px-4">Estado</th>
            <th class="py-3 px-4">Fecha de Creación</th>
            <th class="py-3 px-4">Acciones</th>
          </tr>
        </thead>
        <tbody class="text-gray-800 text-sm divide-y divide-gray-100">
          <tr *ngFor="let inv of invernaderos" class="hover:bg-gray-50 transition">
            <td class="py-3 px-4">{{ inv.nombre }}</td>
            <td class="py-3 px-4">{{ inv.sensoresActivos ?? 0 }}</td>
            <td class="py-3 px-4">
              <span
                class="badge"
                [ngClass]="{
                  'badge-success': inv.estado === 'Activo',
                  'badge-warning': inv.estado === 'Inactivo',
                  'badge-error': inv.estado === 'Mantenimiento'
                }"
              >
                {{ inv.estado }}
              </span>
            </td>
            <td class="py-3 px-4">{{ inv.creado_en | date:'short' }}</td>
            <td class="flex flex-wrap gap-2 py-3 px-4">
              <button
                class="btn btn-sm btn-outline"
                (click)="viewInvernadero.emit(inv)"
              >👁️</button>
              <button
                class="btn btn-sm btn-outline"
                (click)="editInvernadero.emit(inv)"
              >✏️</button>
              <button
                class="btn btn-sm btn-error text-white"
                (click)="deleteInvernadero.emit(inv)"
              >🗑️</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [
    `:host { display: block; }`
  ]
})
export class InvernaderoTableComponent {
  @Input() invernaderos: Invernadero[] = [];
  @Output() viewInvernadero = new EventEmitter<Invernadero>();
  @Output() editInvernadero = new EventEmitter<Invernadero>();
  @Output() deleteInvernadero = new EventEmitter<Invernadero>();
}