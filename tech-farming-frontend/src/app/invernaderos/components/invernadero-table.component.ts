import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Invernadero } from '../models/invernadero.model';

@Component({
  selector: 'app-invernadero-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="overflow-x-auto hidden md:block px-6">
      <table class="table table-zebra w-full">
        <thead>
          <tr class="text-base-content font-bold">
            <th>Nombre</th>
            <th>Zonas activas</th>
            <th>Sensores activos</th>
            <th>Estado</th>
            <th>Creación</th>
            <th class="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let inv of invernaderos" class="hover">
            <td>{{ inv.nombre }}</td>
            <td>{{ inv.zonasActivas ?? 0 }}</td>
            <td>{{ inv.sensoresActivos ?? 0 }}</td>
            <td>
              <span
                class="badge badge-md"
                [ngClass]="{
                  'badge-success': inv.estado === 'Activo',
                  'badge-warning': inv.estado === 'Inactivo',
                  'badge-error':   inv.estado === 'Mantenimiento',
                  'badge-outline': inv.estado === 'Sin sensores'
                }"
              >
                {{ inv.estado }}
              </span>
            </td>
            <td>{{ inv.creado_en | date: 'short' }}</td>
            <td class="flex justify-center gap-1">
              <!-- Ver -->
              <button
                class="btn btn-sm btn-ghost btn-circle border border-transparent hover:border-success hover:bg-success/10 transition-colors duration-200"
                (click)="viewInvernadero.emit(inv)"
                aria-label="Ver invernadero"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 stroke-base-content group-hover:stroke-success" fill="none"
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
                class="btn btn-sm btn-ghost btn-circle border border-transparent hover:border-success hover:bg-success/10 transition-colors duration-200"
                (click)="editInvernadero.emit(inv)"
                aria-label="Editar invernadero"
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
                class="btn btn-sm btn-ghost btn-circle border border-transparent hover:border-error hover:bg-error/10 transition-colors duration-200"
                (click)="deleteInvernadero.emit(inv)"
                aria-label="Eliminar invernadero"
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
      </table>
    </div>
  `
})
export class InvernaderoTableComponent {
  @Input() invernaderos: Invernadero[] = [];
  @Output() viewInvernadero   = new EventEmitter<Invernadero>();
  @Output() editInvernadero   = new EventEmitter<Invernadero>();
  @Output() deleteInvernadero = new EventEmitter<Invernadero>();
}
