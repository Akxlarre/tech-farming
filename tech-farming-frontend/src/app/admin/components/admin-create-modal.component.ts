import { Component, EventEmitter, inject, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../admin.service';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-admin-create-modal',
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
      <h3 class="font-bold text-2xl mb-4">Agregar nuevo usuario trabajador</h3>

      <!-- FORMULARIO -->
      <form class="space-y-4" (ngSubmit)="crearUsuario()">
        <!-- Nombre -->
        <div class="form-control">
          <label class="label font-semibold">Nombre</label>
          <input [(ngModel)]="nuevoUsuario.nombre" name="nombre" class="input input-bordered w-full" required />
        </div>

        <!-- Apellido -->
        <div class="form-control">
          <label class="label font-semibold">Apellido</label>
          <input [(ngModel)]="nuevoUsuario.apellido" name="apellido" class="input input-bordered w-full" required />
        </div>

        <!-- Correo -->
        <div class="form-control">
          <label class="label font-semibold">Correo electrónico</label>
          <input [(ngModel)]="nuevoUsuario.email" name="email" type="email" class="input input-bordered w-full" required />
        </div>

        <!-- Teléfono -->
        <div class="form-control">
          <label class="label font-semibold">Teléfono</label>
          <div class="flex gap-2 items-center">
            <span class="text-md font-medium px-2 border rounded bg-base-200">+56</span>
            <input [(ngModel)]="nuevoUsuario.telefono" name="telefono" class="input input-bordered w-full" maxlength="9" pattern="[0-9]{7,9}" required />
          </div>
        </div>

        <!-- Permisos -->
        <div class="form-control">
          <label class="label font-semibold mb-2">Permisos</label>
          <div class="flex flex-wrap gap-4">
            <label class="cursor-pointer label gap-2">
              <input type="checkbox" [(ngModel)]="nuevoUsuario.permisos.editar" name="editar" class="checkbox checkbox-success" />
              <span class="label-text">Puede editar</span>
            </label>
            <label class="cursor-pointer label gap-2">
              <input type="checkbox" [(ngModel)]="nuevoUsuario.permisos.crear" name="crear" class="checkbox checkbox-success" />
              <span class="label-text">Puede crear</span>
            </label>
            <label class="cursor-pointer label gap-2">
              <input type="checkbox" [(ngModel)]="nuevoUsuario.permisos.eliminar" name="eliminar" class="checkbox checkbox-success" />
              <span class="label-text">Puede eliminar</span>
            </label>
          </div>
        </div>

        <div *ngIf="error" class="text-error">{{ error }}</div>

        <!-- BOTONES -->
        <div class="modal-action mt-6 flex justify-end gap-2">
          <button type="button" (click)="close.emit()" class="btn btn-outline">Cancelar</button>
          <button type="submit" class="btn btn-success">
            <span *ngIf="!loading">Crear usuario</span>
            <span *ngIf="loading" class="flex items-center gap-2">
              <span class="loading loading-spinner loading-sm"></span>
              Creando...
            </span>
          </button>
        </div>
      </form>
    </div>
  `
})
export class AdminCreateModalComponent {
  @Output() saved = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();

  adminService = inject(AdminService);
  supabaseService = inject(SupabaseService);
  loading = false;
  error = '';
  confirmacionVisible = false;
  mensajeConfirmacion = '';

  nuevoUsuario = {
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    permisos: {
      editar: false,
      crear: false,
      eliminar: false
    }
  };

  async crearUsuario() {
    this.loading = true;
    this.error = '';

    try {
      const response = await this.adminService.crearTrabajador({
        nombre: this.nuevoUsuario.nombre,
        apellido: this.nuevoUsuario.apellido,
        email: this.nuevoUsuario.email,
        telefono: '+56' + this.nuevoUsuario.telefono,
        permisos: this.nuevoUsuario.permisos
      });

      if (response.success) {
        this.error = '';
        this.mensajeConfirmacion = 'Usuario creado correctamente.';
        this.confirmacionVisible = true;
        setTimeout(() => {
          this.confirmacionVisible = false;
          this.saved.emit();
        }, 2500);
      } else {
        this.error = response.error || 'Error al crear usuario.';
      }
    } catch (err: any) {
      this.error = err.message || 'Error inesperado';
    }

    this.loading = false;
  }
}