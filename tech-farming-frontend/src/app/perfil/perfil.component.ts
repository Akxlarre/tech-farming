import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PerfilService } from './perfil.service';
import { PerfilSharedService } from './perfil-shared.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <!-- Modal cambio de correo -->
    <div *ngIf="confirmarCambioCorreoVisible" class="fixed inset-0 bg-black/30 z-50 flex justify-center items-center">
      <div class="bg-white p-6 rounded-xl shadow-xl w-[90%] max-w-sm space-y-4 text-center">
        <h3 class="text-lg font-semibold text-warning">⚠️ Confirmar cambio de correo</h3>
        <p>¿Estás seguro de que deseas cambiar tu correo?<br>Deberás confirmar el nuevo correo desde tu bandeja de entrada.</p>

        <div class="mt-4 flex justify-end gap-2">
          <button class="btn btn-sm btn-outline" (click)="cancelarCambioCorreo()" [disabled]="actualizandoCampo === 'correo'">Cancelar</button>
          <button class="btn btn-sm btn-success" (click)="confirmarCambioCorreo()" [disabled]="actualizandoCampo === 'correo'">
            <span *ngIf="actualizandoCampo !== 'correo'">Confirmar</span>
            <span *ngIf="actualizandoCampo === 'correo'" class="flex items-center gap-1">
              <span class="loading loading-spinner loading-sm"></span> Aplicando...
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Éxito -->
    <div *ngIf="modalExitoVisible" class="fixed inset-0 bg-black/30 z-50 flex justify-center items-center">
      <div class="bg-white p-6 rounded-xl shadow-xl w-[90%] max-w-sm text-center space-y-3">
        <h3 class="text-green-600 text-lg font-semibold">✅ ¡Éxito!</h3>
        <p>{{ mensajeExito }}</p>
      </div>
    </div>

    <!-- Modal Error -->
    <div *ngIf="modalErrorVisible" class="fixed inset-0 bg-black/30 z-50 flex justify-center items-center">
      <div class="bg-white p-6 rounded-xl shadow-xl w-[90%] max-w-sm text-center space-y-3">
        <h3 class="text-red-600 text-lg font-semibold">❌ Error</h3>
        <p>{{ mensajeError }}</p>
        <button class="btn btn-sm btn-outline mt-3" (click)="modalErrorVisible = false">Cerrar</button>
      </div>
    </div>

    <section class="min-h-[calc(100vh-5rem)] flex justify-center items-center p-6">
    <div class="card w-full max-w-md bg-base-100 shadow-xl p-6 space-y-6 min-h-[750px]">
    <h1 class="text-3xl font-bold text-center mb-3 text-success">Perfil</h1>

      <!-- Avatar -->
        <div class="relative w-fit mx-auto">
          <div class="avatar">
            <!-- Skeleton -->
            <div
              *ngIf="avatarCargando"
              class="w-24 h-24 rounded-full bg-gray-300 animate-pulse"
            ></div>

            <div *ngIf="!avatarCargando" class="w-24 rounded-full ring ring-success ring-offset-base-100 ring-offset-2">
              <img [src]="avatarSeleccionado" alt="Avatar" />
            </div>
          </div>
          <button
            class="absolute bottom-0 right-0 bg-white p-1 rounded-full border shadow hover:bg-gray-100 transition"
            (click)="mostrarOpcionesAvatar = !mostrarOpcionesAvatar"
            aria-label="Cambiar avatar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 3.487a1.875 1.875 0 112.65 2.65L7.5 18.15l-4 1 1-4L16.862 3.487z" />
            </svg>
          </button>
        </div>

        <!-- Opciones de avatar (solo si está visible) -->
        <div *ngIf="mostrarOpcionesAvatar" class="form-control mt-2 transition-all duration-300 ease-in-out">
          <label class="label"><span class="label-text align-middle">Elige una opción:</span></label>
          <div class="flex gap-2 justify-center flex-wrap">
            <img *ngFor="let url of avatarOpciones"
              [src]="url"
              class="w-16 h-16 rounded-full border-4 cursor-pointer transition-all"
              [class.border-success]="url === avatarSeleccionado"
              [class.border-transparent]="url !== avatarSeleccionado"
              (click)="cambiarAvatar(url)" />
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
          <div class="flex gap-2 items-center">
            <input class="input input-bordered w-full"
              [(ngModel)]="correo"
              [disabled]="editando !== 'correo'" />
            <button class="btn btn-sm" (click)="toggleEditar('correo')" [disabled]="actualizandoCampo === 'correo'">
              <span *ngIf="actualizandoCampo === 'correo'" class="loading loading-spinner loading-sm"></span>
              <span *ngIf="actualizandoCampo !== 'correo'">
                {{ editando === 'correo' ? 'Guardar' : 'Editar' }}
              </span>
            </button>
          </div>
        </div>

        <!-- Teléfono -->
        <div class="form-control">
          <label class="label"><span class="label-text">Teléfono</span></label>
          <div class="flex gap-2 items-center">
            <span class="text-md font-medium px-2 border rounded">+56</span>
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
  avatarSeleccionado = '';
  avatarOpciones = [
    'https://efejsncxndycbgfyhvcv.supabase.co/storage/v1/object/public/avatares//avatar1.png',
    'https://efejsncxndycbgfyhvcv.supabase.co/storage/v1/object/public/avatares//avatar2.png',
    'https://efejsncxndycbgfyhvcv.supabase.co/storage/v1/object/public/avatares//avatar3.png',
    'https://efejsncxndycbgfyhvcv.supabase.co/storage/v1/object/public/avatares//avatar4.png',
    'https://efejsncxndycbgfyhvcv.supabase.co/storage/v1/object/public/avatares//avatar5.png'
  ];
  mostrarOpcionesAvatar = false;
  avatarCargando = true;

  userId: string | null = null;
  editando: 'nombre' | 'apellido' | 'correo' | 'telefono' | null = null;
  actualizandoCampo: 'nombre' | 'apellido' | 'correo' | 'telefono' | null = null;

  confirmarCambioCorreoVisible = false;
  nuevoCorreoPendiente = '';
  modalExitoVisible = false;
  mensajeExito = '';
  modalErrorVisible = false;
  mensajeError = '';

  private perfilService = inject(PerfilService);
  private perfilSharedService = inject(PerfilSharedService);
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
    this.avatarSeleccionado = usuario.avatar_url ?? this.avatarOpciones[0];

    const img = new Image();
    img.src = this.avatarSeleccionado;
    img.onload = () => {
      this.avatarCargando = false;
    };
  }

  get telefonoCompleto(): string {
    return `+56${this.telefonoSinPrefijo}`;
  }

  async toggleEditar(campo: 'nombre' | 'apellido' | 'correo' | 'telefono') {
    if (this.editando === campo) {

      if (campo === 'correo') {
        this.nuevoCorreoPendiente = this.correo;
        this.confirmarCambioCorreoVisible = true;
        return;
      }

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
      alert(`Error al actualizar ${campo}.`);
    } else {
      console.log(`${campo} actualizado correctamente.`);
      if (campo === 'nombre') {
        this.perfilSharedService.nombre.set(this.nombre);
      }
    }
  }

  async confirmarCambioCorreo() {
      if (!this.userId) return;

      this.actualizandoCampo = 'correo';
      this.confirmarCambioCorreoVisible = false;

      const { error } = await this.perfilService.actualizarCorreo(this.nuevoCorreoPendiente);

      if (error) {
        console.error('Error al cambiar correo:', error);
        this.mensajeError = 'Error al cambiar el correo. Intenta más tarde.';
        this.modalErrorVisible = true;
      } else {
        this.mensajeExito = '📧 Correo pendiente de confirmación. Revisa la bandeja de entrada del correo nuevo. Tu sesión podría cerrarse automáticamente.';
        this.modalExitoVisible = true;

        setTimeout(() => {
          this.modalExitoVisible = false;
        }, 3500);
      }

      this.actualizandoCampo = null;
      this.editando = null;
    }

    cancelarCambioCorreo() {
      this.confirmarCambioCorreoVisible = false;
      this.correo = '';
    }

  async cambiarAvatar(url: string) {
      if (!this.userId || url === this.avatarSeleccionado) return;

      this.avatarSeleccionado = url;
      const { error } = await this.perfilService.actualizarUsuario(this.userId, { avatar_url: url });

      if (error) {
        this.mensajeError = 'No se pudo cambiar el avatar.';
        this.modalErrorVisible = true;
      } else {
        this.mensajeExito = 'Avatar actualizado correctamente.';
        this.modalExitoVisible = true;
        this.mostrarOpcionesAvatar = false;
        this.perfilSharedService.avatarUrl.set(url);

        setTimeout(() => (this.modalExitoVisible = false), 2500);
      }
    }

    goToReset() {
      this.router.navigate(['perfil/reset-password']);
    }
  }
