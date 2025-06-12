// notificaciones-config-modal.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PerfilService } from '../../perfil/perfil.service';
import { AlertasModalService } from '../alertas-modal.service';

@Component({
  selector: 'app-alerts-notifications-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
  <!-- Spinner mientras carga -->
    <div class="p-8" *ngIf="isLoading; else contenido">
      <svg class="animate-spin w-8 h-8 text-success mx-auto"
          xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
      </svg>
    </div>

    <!-- Modal de Confirmación -->
    <div *ngIf="confirmacionVisible" class="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div class="bg-base-100 p-6 rounded-xl shadow-xl text-center w-[90vw] max-w-xs sm:max-w-sm space-y-2 border border-base-300">
        <h3 class="text-xl font-semibold text-success">✅ ¡Éxito!</h3>
        <p>{{ mensajeConfirmacion }}</p>
      </div>
    </div>

    <!-- Modal de Error -->
    <div *ngIf="errorVisible" class="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div class="bg-base-100 p-6 rounded-xl shadow-xl text-center w-[90vw] max-w-xs sm:max-w-sm space-y-2 border border-base-300">
        <h3 class="text-xl font-semibold text-error">❌ Error</h3>
        <p>{{ mensajeError }}</p>
        <button class="btn btn-sm btn-outline mt-3" (click)="errorVisible = false">Cerrar</button>
      </div>
    </div>


    <!-- Modal Principal -->
    <ng-template #contenido>
      <ng-container >
      <div class="p-6 w-full max-w-[95vw] sm:max-w-2xl bg-base-100 rounded-2xl shadow-xl border border-base-300 overflow-auto space-y-6">
        
        <!-- Encabezado -->
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-[1.625rem] font-bold text-success flex items-center gap-2">
            Configuración de Notificaciones
          </h2>
          <button class="btn btn-ghost" (click)="modal.closeModal()">✕</button>
        </div>

        <form [formGroup]="form" (ngSubmit)="guardar()" class="space-y-6">
          <!-- Toggle activar/desactivar notificaciones -->
          <div class="form-control">
            <label class="cursor-pointer label flex items-center gap-3">
              <input type="checkbox"
                    class="toggle toggle-success"
                    formControlName="recibe_notificaciones" />
              <span class="label-text font-medium text-base-content">
                Recibir notificaciones por WhatsApp
              </span>
            </label>
          </div>

          <!-- Frecuencia entre notificaciones -->
          <div class="form-control">
            <label class="label font-bold">Frecuencia de notificación</label>
            <select class="select select-bordered w-full" formControlName="alertas_cada_minutos">
              <option [value]="5">Cada 5 minutos</option>
              <option [value]="10">Cada 10 minutos</option>
              <option [value]="15">Cada 15 minutos</option>
              <option [value]="30">Cada 30 minutos</option>
              <option [value]="60">Cada 1 hora</option>
              <option [value]="-1">Otro (personalizado)</option>
            </select>
            <input *ngIf="form.value.alertas_cada_minutos == -1"
                  type="number"
                  min="1"
                  placeholder="Ingresa los minutos"
                  formControlName="alertas_personalizado"
                  class="input input-bordered w-full mt-2" />
          </div>

          <!-- Cooldown después de resolución -->
          <div class="form-control">
            <label class="label font-bold">Periodo de espera tras resolución</label>
            <select class="select select-bordered w-full" formControlName="cooldown_post_resolucion">
              <option [value]="60">1 hora</option>
              <option [value]="120">2 horas</option>
              <option [value]="240">4 horas</option>
              <option [value]="360">6 horas</option>
              <option [value]="-1">Otro (personalizado)</option>
            </select>
            <input *ngIf="form.value.cooldown_post_resolucion == -1"
                  type="number"
                  min="1"
                  placeholder="Ingresa los minutos"
                  formControlName="cooldown_personalizado"
                  class="input input-bordered w-full mt-2" />
          </div>

          <!-- Botón guardar -->
          <div class="flex justify-end gap-4 pt-4 ">
            <button type="button" class="btn btn-outline btn-neutral" (click)="modal.closeModal()" >
                Cancelar
              </button>
            <button class="btn bg-transparent border-success text-base-content hover:bg-success hover:text-success-content"
                    type="submit">
              Guardar
            </button>
          </div>
        </form>
      </div>
      </ng-container>
    </ng-template>
  `
})
export class AlertNotificationsComponent {
  form: FormGroup;
  perfilService = inject(PerfilService);
  isLoading = true;
  confirmacionVisible = false;
  mensajeConfirmacion = '';
  errorVisible = false;
  mensajeError = '';

  constructor(private fb: FormBuilder, public modal: AlertasModalService) {
    this.form = this.fb.group({
      recibe_notificaciones: [true],
      alertas_cada_minutos: [10],
      cooldown_post_resolucion: [120],
      alertas_personalizado: [null],
      cooldown_personalizado: [null]
    });

    this.inicializarFormulario();
  }

  async inicializarFormulario() {
    const { user } = await this.perfilService.getUsuarioAutenticado();
    const uid = user?.id;
    if (!uid) return;

    const { usuario, error } = await this.perfilService.getDatosPerfil(uid);
    if (error || !usuario) return;

    const recibe = usuario.recibe_notificaciones ?? true;
    const frecuencia = usuario.alertas_cada_minutos ?? 10;
    const cooldown = usuario.cooldown_post_resolucion ?? 120;

    this.form.patchValue({
      recibe_notificaciones: recibe,
      alertas_cada_minutos: frecuencia,
      cooldown_post_resolucion: cooldown
    });

    this.isLoading = false
  }

  async guardar() {
    const user = await this.perfilService.getUsuarioAutenticado();
    const uid = user.user?.id;
    if (!uid) return;

    const recibe = this.form.get('recibe_notificaciones')!.value === true;
    const alertas = Number(this.form.get('alertas_personalizado')!.value ?? this.form.get('alertas_cada_minutos')!.value);
    const cooldown = Number(this.form.get('cooldown_personalizado')!.value ?? this.form.get('cooldown_post_resolucion')!.value);

    const { error } = await this.perfilService.actualizarNotificaciones(uid, {
      recibe_notificaciones: recibe,
      alertas_cada_minutos: alertas,
      cooldown_post_resolucion: cooldown
    });

    if (!error) {
      this.mensajeConfirmacion = 'Notificaciones actualizadas correctamente.';
      this.confirmacionVisible = true;
      setTimeout(() => {
        this.confirmacionVisible = false;
        this.modal.closeWithAnimation()
      }, 2500);
    } else {
      this.mensajeError = error?.message || 'No se pudieron actualizar las notificaciones.';
      this.errorVisible = true;
    }
  }

  cerrar() {
    document.body.removeChild(document.getElementById('notificaciones-modal')!);
  }
}
