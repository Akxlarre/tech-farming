import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import e from 'express';

@Component({
  selector: 'app-admin-create-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl">
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
            <span class="text-md font-medium px-2 border rounded bg-gray-100">+56</span>
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

        <!-- BOTONES -->
        <div class="modal-action mt-6 flex justify-end gap-2">
          <button type="button" (click)="close.emit()" class="btn btn-outline">Cancelar</button>
          <button type="submit" class="btn btn-success">Crear usuario</button>
        </div>
      </form>
    </div>
  `
})
export class AdminCreateModalComponent {
  @Output() saved = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();

  nuevoUsuario = {
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    permisos: {
      ver: true,
      editar: false,
      crear: false,
      eliminar: false
    }
  };

  crearUsuario() {
    const usuario = {
      id: Date.now(), // ID temporal
      ...this.nuevoUsuario,
      telefono: `+56${this.nuevoUsuario.telefono}`
    };
    this.saved.emit(usuario);
  }
}

