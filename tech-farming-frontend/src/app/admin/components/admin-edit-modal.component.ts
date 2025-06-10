import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../admin.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-admin-edit-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Modal de Confirmación de Éxito -->
    <div *ngIf="confirmacionVisible"
        class="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div class="bg-base-100 p-6 rounded-xl shadow-xl text-center w-[300px] space-y-2 border border-base-300">
        <h3 class="text-xl font-semibold text-success">
          ✅ ¡Éxito!
        </h3>
        <p>{{ mensajeConfirmacion }}</p>
      </div>
    </div>

    <div class="bg-base-100 rounded-xl shadow-xl p-6 w-full max-w-[90vw] sm:max-w-2xl border border-base-300">
      <h3 class="font-bold text-2xl mb-4">Editar permisos del usuario</h3>

      <form class="space-y-4" (ngSubmit)="guardarCambios()">
        <!-- Nombre (solo lectura) -->
        <div class="form-control">
          <label class="label font-semibold">Nombre</label>
          <input class="input input-bordered w-full bg-base-200" [value]="usuario.nombre + ' ' + usuario.apellido" disabled />
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
          <button type="button" class="btn btn-outline" (click)="close.emit()" [disabled]="loading">Cancelar</button>
          <button type="submit" class="btn btn-success" [disabled]="loading">
            <span *ngIf="!loading">Guardar cambios</span>
            <span *ngIf="loading" class="flex items-center gap-2">
              <span class="loading loading-spinner loading-sm"></span>
              Guardando...
            </span>
          </button>
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

  adminService = inject(AdminService);
  loading = false;
  confirmacionVisible = false;
  mensajeConfirmacion = 'Permisos actualizados correctamente.';
  error = '';

  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<any>();

  async guardarCambios() {
    this.loading = true;
    this.error = '';
    this.mensajeConfirmacion = '';

    try {
      await firstValueFrom(
        this.adminService.actualizarPermisos(this.usuario.id, this.usuario.permisos)
      );

      this.mensajeConfirmacion = 'Permisos actualizados correctamente.';
      this.confirmacionVisible = true;
      this.saved.emit(this.usuario);

      setTimeout(() => {
        this.confirmacionVisible = false;
        this.close.emit();
      }, 2000);
    } catch (err: any) {
      console.error('Error al actualizar permisos:', err);
      this.error = err?.message || 'Error inesperado';
      alert(this.error);
    }

    this.loading = false;
  }
}
