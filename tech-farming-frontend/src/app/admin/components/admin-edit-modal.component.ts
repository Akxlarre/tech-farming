import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-edit-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl">
      <h3 class="font-bold text-2xl mb-4">Editar permisos del usuario</h3>

      <form class="space-y-4" (ngSubmit)="guardarCambios()">
        <!-- Nombre (solo lectura) -->
        <div class="form-control">
          <label class="label font-semibold">Nombre</label>
          <input class="input input-bordered w-full bg-gray-100" [value]="usuario.nombre + ' ' + usuario.apellido" disabled />
        </div>

        <!-- Permisos -->
        <div class="form-control">
          <label class="label font-semibold mb-2">Permisos</label>
          <div class="flex flex-wrap gap-4">
            <label class="cursor-pointer label gap-2">
              <input type="checkbox" [(ngModel)]="usuario.permisos.editar" name="editar" class="checkbox checkbox-success" />
              <span class="label-text">Puede editar</span>
            </label>
            <label class="cursor-pointer label gap-2">
              <input type="checkbox" [(ngModel)]="usuario.permisos.crear" name="crear" class="checkbox checkbox-success" />
              <span class="label-text">Puede crear</span>
            </label>
            <label class="cursor-pointer label gap-2">
              <input type="checkbox" [(ngModel)]="usuario.permisos.eliminar" name="eliminar" class="checkbox checkbox-success" />
              <span class="label-text">Puede eliminar</span>
            </label>
          </div>
        </div>

        <!-- BOTONES -->
        <div class="modal-action mt-6 flex justify-end gap-2">
          <button type="button" class="btn btn-outline" (click)="close.emit()">Cancelar</button>
          <button type="submit" class="btn btn-success">Guardar cambios</button>
        </div>
      </form>
    </div>
  `
})
export class AdminEditModalComponent {
  @Input() usuario!: {
    id: number;
    nombre: string;
    apellido: string;
    permisos: {
      editar: boolean;
      crear: boolean;
      eliminar: boolean;
    };
  };

  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<any>();

  guardarCambios() {
    this.saved.emit(this.usuario);
  }
}
