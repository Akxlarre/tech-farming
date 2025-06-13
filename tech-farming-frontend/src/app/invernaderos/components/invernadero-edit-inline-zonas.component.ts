import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  ReactiveFormsModule,
  FormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

import {
  InvernaderoService,
  EditInvernaderoPayload
} from '../invernaderos.service';
import { InvernaderoModalService } from '../invernadero-modal.service';
import { NotificationService } from '../../shared/services/notification.service';

/**
 * Componente para “Editar Invernadero” con edición inline de Zonas.
 * – Recibe @Input() invernaderoId (el ID a editar).
 * – Trae toda la info (incluye `zonas` y sus `sensores`) usando getInvernaderoDetalle().
 * – Permite:
 *    • Modificar nombre / descripción.
 *    • Añadir nuevas zonas.
 *    • Editar nombre / descripción / “activo” de cada zona.
 *    • Eliminar zonas: si la zona tiene sensores, pide confirmación; si no, la quita directamente.
 * – Al guardar → construye un único `EditInvernaderoPayload` y llama a actualizarInvernaderoCompleto().
 */
@Component({
  selector: 'app-invernadero-edit-inline-zonas',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ],
  template: `
      <!-- Spinner mientras carga -->
      <div *ngIf="isLoading" class="p-8 text-center">
        <svg class="animate-spin w-8 h-8 text-success mx-auto"
             xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
        </svg>
        <p class="mt-2 text-lg text-gray-600">
          Cargando datos del invernadero…
        </p>
      </div>

      <!-- Modal Confirmación de Eliminación de Zona -->
      <div *ngIf="confirmDeleteZonaVisible" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div class="bg-base-100 p-6 rounded-xl shadow-xl w-[340px] border border-base-300 text-center space-y-3">
          <h3 class="text-lg font-bold text-error">¿Eliminar zona?</h3>

          <ng-container *ngIf="zonaAEliminarActiva || zonaAEliminarTieneCambiosNoGuardados; else confirmarTextoZona">
            <p class="text-sm text-base-content/80">
              Para eliminar esta zona, debe estar en estado <strong>Inactivo</strong>.
            </p>
            <p *ngIf="zonaAEliminarTieneCambiosNoGuardados && zonaMarcadaInactivaEnFormulario()" class="text-sm text-warning mt-2">
              ⚠️ Has marcado esta zona como inactiva, pero <strong>no has guardado los cambios</strong>.
            </p>
            <p *ngIf="zonaAEliminarTieneCambiosNoGuardados && zonaMarcadaActivaEnFormulario()" class="text-sm text-warning mt-2">
              ⚠️ Has marcado esta zona como <strong>activa</strong>, pero <strong>no has guardado los cambios</strong>.
            </p>
          </ng-container>

          <ng-template #confirmarTextoZona>
            <p class="text-sm text-base-content/80 mb-2">
              Esta acción eliminará la zona permanentemente.
            </p>

            <p *ngIf="zonaAEliminarTieneSensores" class="text-xs text-warning mb-4">
              También se eliminarán los sensores y alertas asociadas.
            </p>

            <p class="text-sm mb-1">
              Escribe <strong>{{ zonaAEliminarNombre }}</strong> para confirmar:
            </p>

            <input
              type="text"
              class="input input-bordered w-full"
              [(ngModel)]="textoConfirmacionZona"
              placeholder="Escribe aquí para confirmar"
            />
          </ng-template>

          <div class="flex justify-center gap-4 pt-2">
            <button class="btn btn-outline btn-neutral" (click)="cancelarEliminarZona()">Cancelar</button>
            <button
              *ngIf="!zonaAEliminarActiva && !zonaAEliminarTieneCambiosNoGuardados"
              class="btn btn-error"
              [disabled]="textoConfirmacionZona !== zonaAEliminarNombre"
              (click)="confirmarEliminarZonaFinal()"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
        
      <!-- Formulario una vez cargado -->
      <form
        *ngIf="!isLoading"
        [formGroup]="form"
        (ngSubmit)="onSubmit()"
        class="space-y-6"
      >
        <div class="bg-base-100 p-6 rounded-lg shadow-lg max-w-3xl mx-auto">
          <!-- Título -->
          <h2 class="text-3xl font-bold text-success mb-4">
            Editar Invernadero
          </h2>
  
          <!-- Campos generales del invernadero -->
          <div class="space-y-4">
            <!-- Nombre -->
            <div>
              <label class="label">
                <span class="label-text font-semibold">Nombre</span>
              </label>
              <input
                formControlName="nombre"
                type="text"
                class="input input-bordered w-full"
                placeholder="Ej: Invernadero Centro"
              />
              <p
                *ngIf="form.get('nombre')?.touched && form.get('nombre')?.invalid"
                class="text-error text-sm mt-1"
              >
                El nombre es obligatorio (máx. 100 caracteres).
              </p>
            </div>
  
            <!-- Descripción -->
            <div>
              <label class="label">
                <span class="label-text font-semibold">Descripción</span>
              </label>
              <textarea
                formControlName="descripcion"
                rows="2"
                class="textarea textarea-bordered w-full"
                placeholder="Descripción opcional…"
              ></textarea>
            </div>
          </div>
  
          <!-- Sección de Zonas -->
          <div class="mt-8">
            <h3 class="text-2xl font-semibold mb-3">Zonas</h3>
  
            <!-- Aviso de zonas eliminadas sin guardar -->
            <div *ngIf="zonasEliminadas.length > 0" class="alert alert-warning shadow-sm mb-4 text-sm">
              Has eliminado {{ zonasEliminadas.length === 1 ? 'una zona' : zonasEliminadas.length + ' zonas' }}.
              Recuerda hacer clic en <span class="font-semibold text-base-content">“Guardar Cambios”</span> para aplicar la eliminación.
            </div>

            <!-- FormArray de zonas dentro de un contenedor con scroll -->
            <div formArrayName="zonas"
                 class="space-y-4 max-h-[300px] overflow-y-auto pr-2">
              <ng-container *ngFor="let zonaCtrl of zonas.controls; let i = index">
                <div
                  [formGroupName]="i"
                  class="bg-base-200 p-4 rounded-lg flex flex-col lg:flex-row lg:items-center gap-4"
                >
                  <!-- ID oculto -->
                  <input formControlName="id" type="hidden" />
  
                  <!-- Nombre de Zona -->
                  <div class="flex-1">
                    <label class="label">
                      <span class="label-text">Nombre Zona</span>
                    </label>
                    <input
                      formControlName="nombre"
                      type="text"
                      class="input input-bordered w-full"
                      placeholder="Ej: Zona Norte"
                    />
                    <p
                      *ngIf="zonaCtrl.get('nombre')?.touched && zonaCtrl.get('nombre')?.invalid"
                      class="text-error text-xs mt-1"
                    >
                      El nombre de zona es obligatorio.
                    </p>
                  </div>
  
                  <!-- Descripción de Zona -->
                  <div class="flex-1">
                    <label class="label">
                      <span class="label-text">Descripción Zona</span>
                    </label>
                    <textarea
                      formControlName="descripcion"
                      rows="1"
                      class="textarea textarea-bordered w-full"
                      placeholder="Descripción (opcional)…"
                    ></textarea>
                  </div>
  
                  <!-- Checkbox “Activo” -->
                  <div>
                    <label class="cursor-pointer flex items-center gap-2">
                      <input
                        type="checkbox"
                        formControlName="activo"
                        class="checkbox"
                      />
                      <span class="label-text">Zona activa</span>
                    </label>
                  </div>
  
                  <!-- Botón “Eliminar Zona” -->
                  <div>
                    <button
                      type="button"
                      class="btn btn-sm btn-error text-white"
                      (click)="confirmarEliminarZona(i)"
                    >
                      🗑️ Eliminar Zona
                    </button>
                  </div>
  
                  <!-- Si la zona tiene ID (existe en BD), mostrar # sensores -->
                  <div *ngIf="zonaCtrl.get('id')?.value" class="text-sm text-gray-600">
                    Sensores: {{ obtenerSensoresCount(zonaCtrl.get('id')!.value) }}
                  </div>
                </div>
              </ng-container>
            </div>
  
            <!-- Botón para añadir nueva zona -->
            <div class="mt-4">
              <button
                type="button"
                class="btn btn-outline btn-sm"
                (click)="addZona()"
              >
                + Añadir Zona
              </button>
            </div>
  
            <!-- Mensaje si no hay zonas o hay zonas inválidas -->
            <p
              *ngIf="isZonasInvalid()"
              class="text-error text-xs mt-2"
            >
              Debes tener al menos una zona con nombre válido.
            </p>
          </div>
  
          <!-- Botones “Cancelar” y “Guardar Cambios” -->
          <div class="flex justify-end mt-8 gap-3">
            <button
              type="button"
              class="btn btn-ghost"
              (click)="onCancel()"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              [disabled]="form.invalid || isZonasInvalid()"
            >
              Guardar Cambios
            </button>
          </div>
        </div>
      </form>
    `
})
export class InvernaderoEditInlineZonasComponent implements OnInit, OnDestroy {
  @Input() invernaderoId!: number;

  /** Emitiremos al padre cuando el usuario haga “Guardar Cambios” exitosamente */
  @Output() saved = new EventEmitter<{
    invernaderoId: number;
    payload: EditInvernaderoPayload;
  }>();

  zonaAEliminarIndex: number | null = null;
  confirmDeleteZonaVisible = false;
  textoConfirmacionZona = '';
  zonaAEliminarNombre = '';
  zonaAEliminarActiva = true;
  zonaAEliminarTieneSensores = false;
  zonaAEliminarTieneCambiosNoGuardados = false;

  form!: FormGroup;
  zonasEliminadas: number[] = [];
  datosOriginales: any;
  isLoading = true;

  private subs = new Subscription();

  constructor(
    private fb: FormBuilder,
    private svc: InvernaderoService,
    private modal: InvernaderoModalService,
    private notify: NotificationService       // Para confirmaciones y notificaciones
  ) { }

  ngOnInit() {
    console.log('[EditarZona] ngOnInit → invernaderoId=', this.invernaderoId);

    // 1) Construir el formulario vacío:
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      descripcion: [''],
      zonas: this.fb.array([])    // <-- aquí inicial
    });

    // 2) Traer detalle del invernadero (incluye zonas y sensores)
    this.subs.add(
      this.svc.getInvernaderoDetalle(this.invernaderoId).subscribe({
        next: (inv) => {
          console.log('[EditarZona] GET detalle recibido →', inv);
          this.datosOriginales = inv;

          // ─── Vaciar el FormArray antes de volver a llenarlo ────────────────────
          while (this.zonas.length) {
            this.zonas.removeAt(0);
          }

          // Rellenar nombre/ descripción
          this.form.patchValue({
            nombre: inv.nombre,
            descripcion: inv.descripcion || ''
          });

          // Ahora sí agregar cada zona del backend
          inv.zonas.forEach((z: any) => {
            console.log(`[EditarZona] → Agregando zona existente al FormArray:`, z);
            this.zonas.push(this.fb.group({
              id: [z.id],
              nombre: [z.nombre, Validators.required],
              descripcion: [z.descripcion],
              activo: [z.activo]
            }));
          });

          console.log(`[EditarZona] FormArray de zonas inicializado con ${this.zonas.length} items.`);
          this.isLoading = false;
        },
        error: (err) => {
          console.error('[EditarZona] Error al cargar invernadero:', err);
          this.isLoading = false;
        }
      })
    );
  }

  ngOnDestroy() {
    console.log('[EditarZona] ngOnDestroy → unsubscribiendo…');
    this.subs.unsubscribe();
  }

  /** Acceso sencillo al FormArray “zonas” */
  get zonas(): FormArray {
    return this.form.get('zonas') as FormArray;
  }

  /** Añade un FormGroup en blanco para crear una zona nueva */
  addZona(): void {
    console.log('[EditarZona] addZona() → zonas antes:', this.zonas.length);
    this.zonas.push(this.fb.group({
      id: [null],
      nombre: ['', Validators.required],
      descripcion: [''],
      activo: [true]
    }));
    console.log('[EditarZona] addZona() → zonas después:', this.zonas.length);
  }

  /** Retorna `true` si no hay zonas o alguna zona tiene nombre inválido */
  isZonasInvalid(): boolean {
    if (this.zonas.length === 0) {
      console.log('[EditarZona] isZonasInvalid() → true (no hay zonas)');
      return true;
    }
    const algunoInvalid = this.zonas.controls.some(ctrl => ctrl.get('nombre')?.invalid);
    console.log('[EditarZona] isZonasInvalid() →', algunoInvalid);
    return algunoInvalid;
  }

  /**
   * Cuenta la cantidad de sensores que tenía originalmente la zona con id=zonaId
   */
  obtenerSensoresCount(zonaId: number): number {
    const z = this.datosOriginales.zonas.find((x: any) => x.id === zonaId);
    const count = (z && 'sensores_count' in z)
      ? (z as any).sensores_count
      : Array.isArray(z?.sensores) ? z.sensores.length : 0;
    console.log(`[EditarZona] obtenerSensoresCount(${zonaId}) → ${count}`);
    return count;
  }

  /**
   * Invocado al hacer clic en “Eliminar Zona” (índice = i).
   * Si la zona existe (tiene ID) y hay sensores, pide confirmación.
   * Si confirma, la marca para borrarse y la remueve del FormArray.
   * Si no hay sensores o es una zona nueva, la remueve directamente.
   */
  confirmarEliminarZona(index: number) {
    const zCtrl = this.zonas.at(index) as FormGroup;
    const zonaId = zCtrl.get('id')?.value as number | null;

    this.zonaAEliminarIndex = index;
    this.zonaAEliminarNombre = `Eliminar ${zCtrl.get('nombre')?.value || ''}`;
    if (zonaId) {
      const zonaOriginal = this.datosOriginales.zonas.find((z: any) => z.id === zonaId);
      this.zonaAEliminarActiva = zonaOriginal?.activo ?? true;

      const activoEnFormulario = zCtrl.get('activo')?.value ?? true;
      this.zonaAEliminarTieneCambiosNoGuardados = (
        zonaOriginal?.activo !== activoEnFormulario
      );
    } else {
      // Zona nueva: tomamos el valor actual del form porque no hay persistencia aún
      this.zonaAEliminarActiva = zCtrl.get('activo')?.value ?? true;
      this.zonaAEliminarTieneCambiosNoGuardados = false;
    }
    this.zonaAEliminarTieneSensores = zonaId ? this.obtenerSensoresCount(zonaId) > 0 : false;
    this.confirmDeleteZonaVisible = true;
  }

  cancelarEliminarZona() {
    this.confirmDeleteZonaVisible = false;
    this.zonaAEliminarIndex = null;
    this.textoConfirmacionZona = '';
  }

  confirmarEliminarZonaFinal() {
    const index = this.zonaAEliminarIndex;
    if (index === null) return;

    const zCtrl = this.zonas.at(index) as FormGroup;
    const zonaId = zCtrl.get('id')?.value as number | null;

    if (zonaId) {
      this.zonasEliminadas.push(zonaId);
    }

    this.zonas.removeAt(index);
    this.cancelarEliminarZona();
  }

  zonaMarcadaInactivaEnFormulario(): boolean {
    if (this.zonaAEliminarIndex === null) return false;
    const zCtrl = this.zonas.at(this.zonaAEliminarIndex) as FormGroup;
    return zCtrl.get('activo')?.value === false;
  }

  zonaMarcadaActivaEnFormulario(): boolean {
    if (this.zonaAEliminarIndex === null) return false;
    const zCtrl = this.zonas.at(this.zonaAEliminarIndex) as FormGroup;
    return zCtrl.get('activo')?.value === true;
  }


  /**
   * Cancela la edición y cierra el modal sin guardar.
   */
  onCancel() {
    console.log('[EditarZona] onCancel() → cerrando modal sin guardar.');
    this.modal.closeWithAnimation();
  }

  /**
   * Al hacer clic en “Guardar Cambios”:
   * • Validamos que el form y las zonas sean válidos
   * • Construimos el payload EditInvernaderoPayload
   * • Llamamos a actualizarInvernaderoCompleto(...)
   */
  onSubmit() {
    if (this.form.invalid || this.isZonasInvalid()) {
      this.form.markAllAsTouched();
      return;
    }

    const val = this.form.value;
    const payload: EditInvernaderoPayload = {
      nombre: val.nombre,
      descripcion: val.descripcion,
      zonas: val.zonas.map((z: any) => ({
        id: z.id,
        nombre: z.nombre,
        descripcion: z.descripcion,
        activo: z.activo
      })),
      zonasEliminadas: this.zonasEliminadas
    };

    // 1) Ejecuto el PUT y sólo cuando termine exitosamente emito el saved
    this.svc.actualizarInvernaderoCompleto(this.invernaderoId, payload)
      .subscribe({
        next: () => {
          console.log('[HIJO] PUT exitoso → emito saved y cierro modal');
          // Emito el evento saved para que el padre recargue en el momento justo
          this.saved.emit({ invernaderoId: this.invernaderoId, payload });
          this.modal.closeWithAnimation();
          this.notify.success('Invernadero actualizado correctamente.');
        },
        error: (err) => {
          console.error('[HIJO] Error al actualizar invernadero:', err);
          this.notify.error('Error al guardar cambios del invernadero. Por favor, inténtelo de nuevo.');
        }
      });
  }
}
