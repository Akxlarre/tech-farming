import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { UmbralService } from '../umbral.service';
import { UmbralModalService } from '../umbral-modal.service';
import { Umbral } from '../../models/index';
import { InvernaderoService } from '../../invernaderos/invernaderos.service';
import { Invernadero } from '../../invernaderos/models/invernadero.model';
import { TipoParametroService } from '../../sensores/tipos_parametro.service';
import { TipoParametro } from '../../sensores/models/tipos_parametro.model';
import { SensoresService } from '../../sensores/sensores.service';
import { Sensor } from '../../sensores/models/sensor.model';

@Component({
  selector: 'app-umbral-config-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <!-- Modal de Confirmación -->
    <div *ngIf="confirmacionVisible"
         class="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div class="bg-base-100 p-6 rounded-xl shadow-xl text-center w-[90vw] max-w-xs sm:max-w-sm space-y-2 border border-base-300">
        <h3 class="text-xl font-semibold text-success">
          ✅ ¡Éxito!
        </h3>
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

    <!-- Modal de Ayuda -->
    <div *ngIf="ayudaVisible"
        class="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div class="bg-base-100 w-[95vw] sm:max-w-lg max-h-[65vh] p-6 rounded-2xl shadow-xl relative overflow-y-auto pr-2 border border-base-300">

        <div class="space-y-4">
          <h3 class="text-xl font-bold text-success">¿Cómo deben relacionarse los valores de advertencia y crítico?</h3>

          <p class="text-sm text-justify">
            Para que el sistema detecte correctamente los niveles de riesgo, los valores <strong>críticos</strong> deben estar <strong>fuera del rango de advertencia</strong>. Esto permite diferenciar entre un problema leve y uno grave.
          </p>

          <p class="text-sm text-justify">
            La lógica es simple: <strong>los extremos del parámetro (muy bajos o muy altos)</strong> pueden representar situaciones más peligrosas. Por eso, se define un rango intermedio de advertencia, y fuera de ese rango se establecen los valores críticos.
          </p>

          <ul class="list-decimal pl-5 text-sm space-y-2">
            <li>
              <strong>Advertencia Mínima</strong> debe ser menor que la <strong>Advertencia Máxima</strong>.
              <br />
              <span class="text-base-content/60">→ Define un rango aceptable antes de que el sistema emita una advertencia.</span>
            </li>
            <li>
              <strong>Crítico Mínimo</strong> (si se usa) debe ser menor que la <strong>Advertencia Mínima</strong>.
              <br />
              <span class="text-base-content/60">→ Valores demasiado bajos indican un riesgo grave (por ejemplo, temperaturas bajo cero, niveles de humedad extremadamente bajos, etc.).</span>
            </li>
            <li>
              <strong>Crítico Máximo</strong> (si se usa) debe ser mayor que la <strong>Advertencia Máxima</strong>.
              <br />
              <span class="text-base-content/60">→ Valores demasiado altos también son peligrosos (como calor extremo).</span>
            </li>
            <li>
              Si defines ambos críticos, el <strong>Crítico Mínimo</strong> debe ser menor que el <strong>Crítico Máximo</strong>.
            </li>
          </ul>

          <p class="text-sm mt-2">
            Esta estructura asegura que el sistema pueda generar <strong>alertas moderadas</strong> cuando el valor está cerca de salirse de lo normal (advertencia), y <strong>alertas graves</strong> cuando el valor está en un nivel extremo (crítico).
          </p>

          <p class="text-sm italic text-warning">
            ⚠️ Si los valores no respetan esta lógica, el formulario mostrará un error para ayudarte a corregirlo.
          </p>

          <div class="flex justify-end">
            <button (click)="ayudaVisible = false"
                    class="btn btn-outline btn-neutral">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Principal -->
    <div class="w-full max-w-[95vw] sm:max-w-3xl p-4 sm:p-6 bg-base-100 rounded-2xl shadow-xl space-y-6 border border-base-300">
      <h2 class="text-[1.625rem] font-bold text-success flex items-center gap-2">
        {{ isEdit ? 'Editar Umbral' : 'Crear Umbral' }}
         <button type="button"
                (click)="mostrarAyuda()"
                class="btn btn-circle btn-outline border-base-content text-base-content"
                style="width: 2.25rem; height: 2.25rem; font-size: 1.125rem;"
                title="¿Cómo funcionan los umbrales?">
          ?
        </button>
      </h2>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
        <!-- Ámbito -->
        <div>
          <label class="label"><span class="label-text">Ámbito</span></label>
          <select formControlName="ambito" class="select select-bordered w-full">
            <option value="global">Global</option>
            <option value="invernadero">Invernadero</option>
            <option value="sensor">Sensor</option>
          </select>
        </div>

        <!-- Invernadero -->
        <div *ngIf="form.value.ambito !== 'global'">
          <label class="label"><span class="label-text">Invernadero</span></label>
          <select formControlName="invernadero_id" class="select select-bordered w-full">
            <option value="">-- Selecciona Invernadero --</option>
            <option *ngFor="let inv of invernaderos" [value]="inv.id">{{ inv.nombre }}</option>
          </select>
        </div>

        <!-- Sensor -->
        <div *ngIf="form.value.ambito === 'sensor'">
          <label class="label"><span class="label-text">Sensor</span></label>
          <select formControlName="sensor_id" class="select select-bordered w-full">
            <option value="">-- Selecciona Sensor --</option>
            <option *ngFor="let s of sensores" [value]="s.id">{{ s.nombre }}</option>
          </select>
          <div *ngIf="sensores.length === 0" class="text-sm text-warning">No hay sensores disponibles.</div>
        </div>

        <!-- Parámetro -->
        <div *ngIf="form.value.ambito === 'sensor'">
          <label class="label"><span class="label-text">Parámetro</span></label>
          <select formControlName="tipo_parametro_id" class="select select-bordered w-full">
            <option value="">-- Selecciona Parámetro --</option>
            <option *ngFor="let tp of sensorParametros" [value]="tp.id">
              {{ tp.nombre }} ({{ tp.unidad }})
            </option>
          </select>
          <div *ngIf="sensorParametros.length === 0" class="text-sm text-warning">Este sensor no mide ningún parámetro.</div>
        </div>

        <!-- Parámetro para ámbito global o invernadero -->
        <div *ngIf="form.value.ambito !== 'sensor'">
          <label class="label"><span class="label-text">Parámetro</span></label>
          <select formControlName="tipo_parametro_id" class="select select-bordered w-full">
            <option value="">-- Selecciona Parámetro --</option>
            <option *ngFor="let tp of tiposParametro" [value]="tp.id">
              {{ tp.nombre }} ({{ tp.unidad }})
            </option>
          </select>
        </div>

        <!-- Rangos de Advertencia -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="label"><span class="label-text">Advertencia Mín</span></label>
            <input formControlName="advertencia_min" type="number"
                   class="input input-bordered w-full" />
          </div>
          <div>
            <label class="label"><span class="label-text">Advertencia Máx</span></label>
            <input formControlName="advertencia_max" type="number"
                   class="input input-bordered w-full" />
          </div>
        </div>

        <!-- Mensajes de error (Advertencia) -->
        <div *ngIf="form.hasError('advertencia') && (form.dirty || form.touched)" class="text-sm text-error mt-1">
          {{ form.getError('advertencia') }}
        </div>

        <!-- Rangos Críticos -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="label"><span class="label-text">Crítico Mín (opc.)</span></label>
            <input formControlName="critico_min" type="number"
                   class="input input-bordered w-full" />
          </div>
          <div>
            <label class="label"><span class="label-text">Crítico Máx (opc.)</span></label>
            <input formControlName="critico_max" type="number"
                   class="input input-bordered w-full" />
          </div>
        </div>

        <!-- Mensajes de error (Crítico) -->
        <div class="mt-2 space-y-1 text-sm text-error" *ngIf="form.touched || form.dirty">
          <div *ngIf="form.hasError('criticoMin')">
            {{ form.getError('criticoMin') }}
          </div>
          <div *ngIf="form.hasError('criticoMax')">
            {{ form.getError('criticoMax') }}
          </div>
          <div *ngIf="form.hasError('criticoRango')">
            {{ form.getError('criticoRango') }}
          </div>
        </div>

        <!-- Acciones -->
        <div class="flex justify-end gap-4 pt-4 border-t border-base-content/20">
          <button type="button" class="btn btn-outline btn-neutral" (click)="cancel()">
            Cancelar
          </button>
          <button type="submit" 
          class="btn bg-transparent border-success text-base-content hover:bg-success hover:text-success-content" [disabled]="form.invalid || loading">
            {{ isEdit ? 'Guardar' : 'Crear' }}
          </button>
        </div>

      </form>
    </div>
  `
})
export class UmbralConfigModalComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  isEdit = false;
  loading = false;

  invernaderos: Invernadero[] = [];
  sensores: Sensor[] = [];
  tiposParametro: TipoParametro[] = [];
  sensorParametros: TipoParametro[] = [];
  sensorParametrosCompletos: TipoParametro[] = [];

  ayudaVisible = false;
  confirmacionVisible = false;
  mensajeConfirmacion = '';
  errorVisible = false;
  mensajeError = '';

  private formSub?: Subscription;
  private ambitoSub?: Subscription;
  private invernaderoSub?: Subscription;
  private sensorSub?: Subscription;
  private tipoParametroSub?: Subscription;

  constructor(
    private fb: FormBuilder,
    private umbralService: UmbralService,
    private invSvc: InvernaderoService,
    private tpSvc: TipoParametroService,
    private sensorSvc: SensoresService,
    private modal: UmbralModalService
  ) { }

  ngOnInit() {
    // Inicializar form
    const sel = this.modal.selectedUmbral$.value;
    this.isEdit = !!sel?.id;
    this.form = this.fb.group({
      id: [sel?.id || null],
      ambito: [sel ? this.getAmbito(sel) : 'global', Validators.required],
      invernadero_id: [sel?.invernadero_id || null],
      tipo_parametro_id: [sel?.tipo_parametro_id || null, Validators.required],
      sensor_id: [sel?.sensor_id || null],
      sensor_parametro_id: [sel?.sensor_parametro_id || null],
      advertencia_min: [sel?.advertencia_min || null, Validators.required],
      advertencia_max: [sel?.advertencia_max || null, Validators.required],
      critico_min: [sel?.critico_min || null],
      critico_max: [sel?.critico_max || null],
      activo: [sel?.activo ?? true]
    }, { validators: this.validarRangos() });

    this.formSub = this.form.valueChanges.subscribe(() => {
    });

    // Cargar datos iniciales
    this.invSvc.getInvernaderos().subscribe(list => this.invernaderos = list);
    this.tpSvc.obtenerTiposParametro().subscribe(list => this.tiposParametro = list);

    // Reactividad entre campos
    this.ambitoSub = this.form.get('ambito')!.valueChanges.subscribe(() => this.resetScopeFields());

    this.invernaderoSub = this.form.get('invernadero_id')!.valueChanges.subscribe((invId) => {
      const ambito = this.form.get('ambito')!.value;

      if (!this.isEdit) {
        if (ambito === 'sensor' && invId) {
          this.loadSensores(invId);
        } else {
          this.sensores = [];
          this.sensorParametros = [];
          this.form.patchValue({ sensor_id: null, tipo_parametro_id: null });
        }
      }
    });

    this.sensorSub = this.form.get('sensor_id')!.valueChanges.subscribe(id => this.loadSensorParametros(id));

    this.tipoParametroSub = this.form.get('tipo_parametro_id')!.valueChanges.subscribe((tipo_parametro_id) => {
      const sensorParam = this.sensorParametrosCompletos.find(p => p.id == tipo_parametro_id);

      if (sensorParam?.sensor_parametro_id) {
        this.form.patchValue({
          sensor_parametro_id: sensorParam.sensor_parametro_id
        });
      } else {
        this.form.patchValue({
          sensor_parametro_id: null
        });
      }
    });

    // Si editamos sensor, cargar sensores y parámetros iniciales
    if (this.isEdit && this.form.value.ambito === 'sensor') {
      const invId = this.form.get('invernadero_id')!.value;
      const sensorParametroId = this.form.get('sensor_parametro_id')!.value;

      if (invId && sensorParametroId) {
        this.sensorSvc.getSensoresPorInvernadero(invId).subscribe(sensores => {
          this.sensores = sensores;

          let sensorId: number | null = null;
          let tipoParametroId: number | null = null;

          const sensorRequests = sensores.map(s =>
            this.sensorSvc.getParametrosPorSensor(s.id).toPromise().then(params => {
              if (params) {
                const encontrado = params.find(p => p.sensor_parametro_id === sensorParametroId);
                if (encontrado) {
                  sensorId = s.id;
                  tipoParametroId = encontrado.id;
                  if (this.form.get('sensor_id')?.value !== s.id) {
                    this.sensorParametros = params.map(p => ({
                      id: p.id,
                      nombre: p.nombre,
                      unidad: p.unidad
                    }));
                    this.sensorParametrosCompletos = params;
                  }
                }
              }
            })
          );

          Promise.all(sensorRequests).then(() => {
            if (sensorId && tipoParametroId) {
              this.form.patchValue({
                sensor_id: sensorId
              });

              // Cargar parámetros solo del sensor encontrado
              this.sensorSvc.getParametrosPorSensor(sensorId).subscribe(parametros => {
                this.sensorParametros = parametros.map(p => ({
                  id: p.id,
                  nombre: p.nombre,
                  unidad: p.unidad
                }));
                this.sensorParametrosCompletos = parametros;

                const paramEncontrado = parametros.find(p => p.id === tipoParametroId);
                if (paramEncontrado) {
                  this.form.patchValue({
                    tipo_parametro_id: paramEncontrado.id,
                    sensor_parametro_id: paramEncontrado.sensor_parametro_id
                  });
                }
              });
            }
          });
        });
      }
    }
  }

  private getAmbito(u: Umbral): string {
    if (u.sensor_parametro_id) return 'sensor';
    if (u.invernadero_id) return 'invernadero';
    return 'global';
  }

  private resetScopeFields() {
    if (!this.isEdit) {
      this.form.patchValue({ invernadero_id: null, sensor_id: null, tipo_parametro_id: null });
      this.sensores = [];
      this.sensorParametros = [];
    }
  }

  private loadSensores(invernaderoId: number) {
    this.sensorSvc.getSensoresPorInvernadero(invernaderoId).subscribe(sensores => {
      this.sensores = sensores
      this.form.patchValue({
        sensor_id: null,
        tipo_parametro_id: null
      });
      this.sensorParametros = [];
    });
  }

  private loadSensorParametros(sensorId: number) {
    if (!sensorId) return;
    this.sensorSvc.getParametrosPorSensor(sensorId).subscribe(list => {
      this.sensorParametrosCompletos = list;
      this.sensorParametros = list.map(p => ({
        id: p.id,
        nombre: p.nombre,
        unidad: p.unidad
      }));

      const tipo_parametro_id = this.form.get('tipo_parametro_id')?.value;
      if (tipo_parametro_id) {
        const encontrado = list.find(p => p.id === tipo_parametro_id);
        if (encontrado?.sensor_parametro_id) {
          this.form.patchValue({
            sensor_parametro_id: encontrado.sensor_parametro_id
          }, { emitEvent: false });
        }
      }
    });
  }

  private validarRangos() {
    return (group: FormGroup) => {
      const advMin = group.get('advertencia_min')?.value;
      const advMax = group.get('advertencia_max')?.value;
      const critMin = group.get('critico_min')?.value;
      const critMax = group.get('critico_max')?.value;

      const errores: any = {};

      if (
        advMin != null && advMax != null &&
        !isNaN(advMin) && !isNaN(advMax) &&
        advMin >= advMax
      ) {
        errores['advertencia'] = 'Advertencia Mín debe ser menor que Advertencia Máx';
      }

      if (
        critMin != null && advMin != null &&
        !isNaN(critMin) && !isNaN(advMin) &&
        critMin >= advMin
      ) {
        errores['criticoMin'] = 'Crítico Mín debe ser menor que Advertencia Mín';
      }

      if (
        critMax != null && advMax != null &&
        !isNaN(critMax) && !isNaN(advMax) &&
        advMax >= critMax
      ) {
        errores['criticoMax'] = 'Advertencia Máx debe ser menor que Crítico Máx';
      }

      if (
        critMin != null && critMax != null &&
        !isNaN(critMin) && !isNaN(critMax) &&
        critMin >= critMax
      ) {
        errores['criticoRango'] = 'Crítico Mín debe ser menor que Crítico Máx';
      }

      return Object.keys(errores).length > 0 ? errores : null;
    };
  }

  mostrarAyuda() {
    this.ayudaVisible = true;
  }

  cancel() {
    this.modal.closeWithAnimation();
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.form.updateValueAndValidity();
      return;
    }
    this.loading = true;

    const payload = this.form.value;
    const obs = this.isEdit
      ? this.umbralService.actualizarUmbral(payload.id, payload)
      : this.umbralService.crearUmbral(payload);

    obs.subscribe({
      next: () => {
        this.loading = false;
        this.mensajeConfirmacion = this.isEdit
          ? 'Umbral actualizado correctamente.'
          : 'Umbral creado correctamente.';
        this.confirmacionVisible = true;

        setTimeout(() => {
          this.confirmacionVisible = false;
          this.modal.closeWithAnimation();
        }, 2500);
      },
      error: (err) => {
        this.loading = false;
        this.mensajeError = err?.error?.error || 'No se pudo crear el umbral.';
        this.errorVisible = true;
      }
    });
  }

  ngOnDestroy(): void {
    this.formSub?.unsubscribe();
    this.ambitoSub?.unsubscribe();
    this.invernaderoSub?.unsubscribe();
    this.sensorSub?.unsubscribe();
    this.tipoParametroSub?.unsubscribe();
  }
}