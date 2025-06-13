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
  selector: 'app-admin-card-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="md:hidden space-y-4 p-6">
      <ng-container *ngIf="!loading; else skeletons">
        <div *ngFor="let u of usuarios" class="card bg-base-100 shadow-lg p-4 space-y-2">
          <h3 class="font-semibold text-lg">{{ u.nombre }} {{ u.apellido }}</h3>
          <div class="text-sm">{{ u.email }}</div>
          <div class="text-sm">{{ u.telefono }}</div>
          <div class="text-sm flex gap-2">
            <span>Editar: {{ u.puedeEditar ? '✔️' : '❌' }}</span>
            <span>Crear: {{ u.puedeCrear ? '✔️' : '❌' }}</span>
            <span>Eliminar: {{ u.puedeEliminar ? '✔️' : '❌' }}</span>
          </div>
          <div class="text-right space-x-2">
            <button class="btn btn-outline btn-sm" (click)="editarUsuario.emit(u)">Editar</button>
            <button class="btn btn-error btn-sm" (click)="eliminarUsuario.emit(u)">Eliminar</button>
          </div>
        </div>
      </ng-container>
      <ng-template #skeletons>
        <div *ngFor="let _ of skeletonArray" class="card bg-base-100 shadow-lg p-4 animate-pulse space-y-2">
          <div class="h-4 w-32 bg-base-300 rounded"></div>
          <div class="h-4 w-24 bg-base-300 rounded"></div>
          <div class="h-4 w-20 bg-base-300 rounded"></div>
        </div>
      </ng-template>
    </div>
  `,
})
export class AdminCardListComponent {
  @Input() usuarios: Usuario[] = [];
  @Input() loading = false;
  @Input() rowCount = 5;
  @Output() editarUsuario = new EventEmitter<Usuario>();
  @Output() eliminarUsuario = new EventEmitter<Usuario>();

  get skeletonArray() {
    return Array.from({ length: this.rowCount });
  }
}
