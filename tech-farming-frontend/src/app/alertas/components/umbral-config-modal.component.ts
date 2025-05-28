import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
      <div class="bg-white p-6 rounded-xl shadow-xl text-center w-[300px] space-y-2">
        <h3 class="text-xl font-semibold text-green-600">
          ✅ ¡Éxito!
        </h3>
        <p>{{ mensajeConfirmacion }}</p>
      </div>
    </div>

    <!-- Modal Principal -->
    <div class="w-full max-w-3xl p-6 bg-white rounded-2xl shadow-xl space-y-6">
      <h2 class="text-2xl font-bold text-secondary">
        {{ isEdit ? 'Editar Umbral' : 'Crear Umbral' }}
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

        <!-- Acciones -->
        <div class="flex justify-end gap-4 pt-4 border-t border-base-content/20">
          <button type="button" class="btn btn-outline btn-neutral" (click)="cancel()">
            Cancelar
          </button>
          <button type="submit" class="btn btn-primary" [disabled]="form.invalid || loading">
            {{ isEdit ? 'Guardar' : 'Crear' }}
          </button>
        </div>
      </form>
    </div>
  `
})
export class UmbralConfigModalComponent implements OnInit {
  form!: FormGroup;
  isEdit = false;
  loading = false;

  invernaderos: Invernadero[] = [];
  sensores: Sensor[] = [];
  tiposParametro: TipoParametro[] = [];
  sensorParametros: TipoParametro[] = [];
  sensorParametrosCompletos: TipoParametro[] = [];

  confirmacionVisible = false;
  mensajeConfirmacion = '';

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
      sensor_id: [null],
      sensor_parametro_id: [sel?.sensor_parametro_id || null],
      advertencia_min: [sel?.advertencia_min || '', Validators.required],
      advertencia_max: [sel?.advertencia_max || '', Validators.required],
      critico_min: [sel?.critico_min || null],
      critico_max: [sel?.critico_max || null],
      activo: [sel?.activo ?? true]
    });

    // Cargar datos iniciales
    this.invSvc.getInvernaderos().subscribe(list => this.invernaderos = list);
    this.tpSvc.obtenerTiposParametro().subscribe(list => this.tiposParametro = list);

    // Reactividad entre campos
    this.form.get('ambito')!.valueChanges.subscribe(() => this.resetScopeFields());

    this.form.get('invernadero_id')!.valueChanges.subscribe((invId) => {
      const ambito = this.form.get('ambito')!.value;
      if (ambito === 'sensor' && invId) {
        this.loadSensores(invId);
      } else {
        this.sensores = [];
        this.sensorParametros = [];
        this.form.patchValue({ sensor_id: null, tipo_parametro_id: null });
      }
    });

    this.form.get('sensor_id')!.valueChanges.subscribe(id => this.loadSensorParametros(id));

    this.form.get('tipo_parametro_id')!.valueChanges.subscribe((tipo_parametro_id) => {
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

    // Si editamos sensor, cargar sensores iniciales
    if (this.isEdit && this.form.value.ambito === 'sensor') {
      const invId = this.form.get('invernadero_id')!.value;
      if (invId) {
        this.loadSensores(invId);
      }
    }
  }

  private getAmbito(u: Umbral): string {
    if (u.sensor_parametro_id) return 'sensor';
    if (u.invernadero_id) return 'invernadero';
    return 'global';
  }

  private resetScopeFields() {
    this.form.patchValue({ invernadero_id: null, sensor_id: null, tipo_parametro_id: null });
    this.sensores = [];
    this.sensorParametros = [];
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
        const encontrado = list.find(p => p.id == tipo_parametro_id);
        if (encontrado?.sensor_parametro_id) {
          this.form.patchValue({ sensor_parametro_id: encontrado.sensor_parametro_id });
        }
      }
    });
  }

  cancel() {
    this.modal.closeWithAnimation();
  }

  onSubmit() {
    if (this.form.invalid) return;
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
        }, 3000);
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}