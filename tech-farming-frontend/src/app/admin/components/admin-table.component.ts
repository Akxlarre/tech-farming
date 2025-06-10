import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  puedeEditar: boolean;
  puedeCrear: boolean;
  puedeEliminar: boolean;
}

@Component({
  selector: 'app-admin-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="overflow-x-auto p-6">
      <table class="table table-zebra w-full">
        <thead>
          <tr class="text-base-content font-bold">
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Correo</th>
            <th>Teléfono</th>
            <th>Editar</th>
            <th>Crear</th>
            <th>Eliminar</th>
            <th class="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody *ngIf="!loading; else loadingRows">
          <tr *ngFor="let u of usuarios">
            <td>{{ u.nombre }}</td>
            <td>{{ u.apellido }}</td>
            <td>{{ u.email }}</td>
            <td>{{ u.telefono }}</td>
            <td>{{ u.puedeEditar ? '✔️' : '❌' }}</td>
            <td>{{ u.puedeCrear ? '✔️' : '❌' }}</td>
            <td>{{ u.puedeEliminar ? '✔️' : '❌' }}</td>
            <td class="text-center">
              <button class="btn btn-sm btn-outline" (click)="editarUsuario.emit(u)">Editar</button>
            </td>
          </tr>
        </tbody>
        <ng-template #loadingRows>
          <tr *ngFor="let _ of skeletonArray">
            <td colspan="8">
              <div class="skeleton h-6 w-full rounded bg-base-300 animate-pulse opacity-60"></div>
            </td>
          </tr>
        </ng-template>
      </table>

      <!-- Paginación -->
      <div class="flex items-center justify-between mt-6 bg-base-200 p-4 rounded-lg">
        <div class="text-sm text-base-content/70">
          Página {{paginaActual}} de {{totalPaginas}} · {{totalUsuarios}} usuarios
        </div>

        <div class="flex items-center gap-2">
          <button class="btn btn-sm btn-outline rounded-full" (click)="irPagina(1)" [disabled]="paginaActual === 1">«</button>
          <button class="btn btn-sm btn-outline rounded-full" (click)="irPagina(paginaActual - 1)" [disabled]="paginaActual === 1">‹</button>

          <ng-container *ngFor="let item of obtenerItemsPaginacion()">
            <ng-container *ngIf="item !== '…'; else dots">
              <button
                class="btn btn-sm rounded-full"
                [ngClass]="{
                  'btn-success text-base-content border-success cursor-default': item === paginaActual,
                  'btn-outline': item !== paginaActual
                }"
                (click)="irPagina(+item)"
                [disabled]="item === paginaActual">
                {{ item }}
              </button>
            </ng-container>
            <ng-template #dots>
              <span class="px-2 text-base-content/60 select-none">…</span>
            </ng-template>
          </ng-container>

          <button class="btn btn-sm btn-outline rounded-full" (click)="irPagina(paginaActual + 1)" [disabled]="paginaActual === totalPaginas">›</button>
          <button class="btn btn-sm btn-outline rounded-full" (click)="irPagina(totalPaginas)" [disabled]="paginaActual === totalPaginas">»</button>
        </div>
      </div>
    </div>
  `,
})
export class AdminTableComponent {
  @Input() usuarios: Usuario[] = [];
  @Input() paginaActual = 1;
  @Input() totalPaginas = 1;
  @Input() totalUsuarios = 0;
  @Input() loading = false;
  @Input() rowCount = 5;
  @Output() paginaCambiada = new EventEmitter<number>();
  @Output() editarUsuario = new EventEmitter<Usuario>();

  irPagina(p: number) {
    if (p < 1 || p > this.totalPaginas) return;
    this.paginaCambiada.emit(p);
  }

  obtenerItemsPaginacion(): Array<number | string> {
    const total = this.totalPaginas;
    const actual = this.paginaActual;
    const delta = 1;
    const items: Array<number | string> = [];
    let last = 0;

    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= actual - delta && i <= actual + delta)) {
        if (last && i - last > 1) items.push('…');
        items.push(i);
        last = i;
      }
    }

    return items;
  }

  get skeletonArray() {
    return Array.from({ length: this.rowCount });
  }
}
