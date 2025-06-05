import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute} from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PerfilService } from './perfil.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <section class="min-h-[calc(100vh-5rem)] flex justify-center items-center p-6">
      <div class="card w-full max-w-md bg-base-100 shadow-xl p-6 space-y-6">
      <h1 class="text-3xl font-bold text-center mb-3 text-success">Perfil</h1>
        <div class="flex justify-center">
          <div class="avatar">
            <div class="w-24 rounded-full ring ring-success ring-offset-base-100 ring-offset-2">
              <img src="https://i.pravatar.cc/150?img=3" alt="Foto de perfil" />
            </div>
          </div>
        </div>

        <!-- Nombre -->
        <div class="form-control">
          <label class="label"><span class="label-text">Nombre</span></label>
          <div class="flex gap-2 items-center">
            <input class="input input-bordered w-full"
              [(ngModel)]="nombre"
              [disabled]="editando !== 'nombre'" />
            <button class="btn btn-sm" (click)="toggleEditar('nombre')" [disabled]="actualizandoCampo === 'nombre'">
              <span *ngIf="actualizandoCampo === 'nombre'" class="loading loading-spinner loading-sm"></span>
              <span *ngIf="actualizandoCampo !== 'nombre'">
                {{ editando === 'nombre' ? 'Guardar' : 'Editar' }}
              </span>
            </button>
          </div>
        </div>

        <!-- Apellido -->
        <div class="form-control">
          <label class="label"><span class="label-text">Apellido</span></label>
          <div class="flex gap-2 items-center">
            <input class="input input-bordered w-full"
              [(ngModel)]="apellido"
              [disabled]="editando !== 'apellido'" />
            <button class="btn btn-sm" (click)="toggleEditar('apellido')" [disabled]="actualizandoCampo === 'apellido'">
              <span *ngIf="actualizandoCampo === 'apellido'" class="loading loading-spinner loading-sm"></span>
              <span *ngIf="actualizandoCampo !== 'apellido'">
                {{ editando === 'apellido' ? 'Guardar' : 'Editar' }}
              </span>
            </button>
          </div>
        </div>

        <!-- Correo -->
        <div class="form-control">
          <label class="label"><span class="label-text">Correo electrónico</span></label>
          <input class="input input-bordered w-full bg-gray-100 text-gray-500"
            [value]="correo"
            disabled />
        </div>

        <!-- Teléfono -->
        <div class="form-control">
          <label class="label"><span class="label-text">Teléfono</span></label>
          <div class="flex gap-2 items-center">
            <span class="text-md font-medium px-2 border rounded bg-gray-100">+56</span>
            <input class="input input-bordered w-full"
              [(ngModel)]="telefonoSinPrefijo"
              [disabled]="editando !== 'telefono'"
              maxlength="9"
              pattern="[0-9]{7,9}" />
            <button class="btn btn-sm" (click)="toggleEditar('telefono')" [disabled]="actualizandoCampo === 'telefono'">
              <span *ngIf="actualizandoCampo === 'telefono'" class="loading loading-spinner loading-sm"></span>
              <span *ngIf="actualizandoCampo !== 'telefono'">
                {{ editando === 'telefono' ? 'Guardar' : 'Editar' }}
              </span>
            </button>
          </div>
        </div>

        <div class="text-center">
          <button class="btn btn-link text-sm text-success" (click)="goToReset()">Cambiar mi contraseña</button>
        </div>
      </div>
    </section>

    <router-outlet></router-outlet>
  `
})
export class PerfilComponent {
  nombre = '';
  apellido = '';
  correo = '';
  telefonoSinPrefijo = '';
  userId: string | null = null;
  editando: 'nombre' | 'apellido' | 'telefono' | null = null;
  actualizandoCampo: 'nombre' | 'apellido' | 'telefono' | null = null;

  private perfilService = inject(PerfilService);
  private router = inject(Router);

  async ngOnInit() {
    const { user, error: authError } = await this.perfilService.getUsuarioAutenticado();

    if (authError || !user) {
      console.error('No se pudo obtener el usuario autenticado');
      this.router.navigateByUrl('/login');
      return;
    }

    this.correo = user.email ?? '';
    this.userId = user.id;

    const { usuario, error: dbError } = await this.perfilService.getDatosPerfil(user.id);

    if (dbError || !usuario) {
      console.error('No se encontró el usuario en la tabla usuarios');
      return;
    }

    this.nombre = usuario.nombre;
    this.apellido = usuario.apellido;
    this.telefonoSinPrefijo = usuario.telefono?.replace('+56', '') ?? '';
  }

  get telefonoCompleto(): string {
    return `+56${this.telefonoSinPrefijo}`;
  }

  async toggleEditar(campo: 'nombre' | 'apellido' | 'telefono') {
    if (this.editando === campo) {
      this.actualizandoCampo = campo;
      await this.guardarCampo(campo);
      this.actualizandoCampo = null;
      this.editando = null;
    } else {
      this.editando = campo;
    }
  }

  async guardarCampo(campo: 'nombre' | 'apellido' | 'telefono') {
    if (!this.userId) return;

    const updateObj: any = {};

    if (campo === 'nombre') updateObj.nombre = this.nombre;
    if (campo === 'apellido') updateObj.apellido = this.apellido;
    if (campo === 'telefono') updateObj.telefono = this.telefonoCompleto;

    const { error } = await this.perfilService.actualizarUsuario(this.userId, updateObj);

    if (error) {
      console.error(`Error al actualizar ${campo}:`, error);
    } else {
      console.log(`${campo} actualizado correctamente`);
    }
  }

  goToReset() {
    this.router.navigate(['perfil/reset-password']);
  }
}
