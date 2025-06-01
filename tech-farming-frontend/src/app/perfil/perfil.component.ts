import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute} from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <section class="flex justify-center p-8">
      <div class="card w-full max-w-md bg-base-100 shadow-xl p-6 space-y-6">
        <div class="flex justify-center">
          <div class="avatar">
            <div class="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
              <img src="https://i.pravatar.cc/150?img=3" alt="Foto de perfil" />
            </div>
          </div>
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text">Nombre</span>
          </label>
          <div class="flex gap-2 items-center">
            <input type="text" class="input input-bordered w-full" [(ngModel)]="nombre" />
            <button class="btn btn-sm btn-outline">Editar</button>
          </div>
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text">Apellido</span>
          </label>
          <div class="flex gap-2 items-center">
            <input type="text" class="input input-bordered w-full" [(ngModel)]="apellido" />
            <button class="btn btn-sm btn-outline">Editar</button>
          </div>
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text">Correo electrónico</span>
          </label>
          <input type="email" class="input input-bordered w-full" [value]="correo" disabled />
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text">Teléfono</span>
          </label>
          <div class="flex gap-2 items-center">
            <input type="tel" class="input input-bordered w-full" [(ngModel)]="telefono" />
            <button class="btn btn-sm btn-outline">Editar</button>
          </div>
        </div>

        <div class="text-center">
          <button class="btn btn-link text-sm text-primary" (click)="goToReset()">Cambiar mi contraseña</button>
        </div>
      </div>
    </section>

    <router-outlet></router-outlet>
  `
})
export class PerfilComponent {
  nombre = 'Juan';
  apellido = 'Pérez';
  correo = 'juan.perez@example.com';
  telefono = '+56 9 1234 5678';

  constructor(private router: Router, private route: ActivatedRoute) {}

  goToReset() {
    this.router.navigate(['perfil/reset-password']);
  }
}
