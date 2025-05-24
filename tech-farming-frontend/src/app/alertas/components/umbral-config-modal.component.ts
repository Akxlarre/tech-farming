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
          <select formControlName="invernadero_id" class="select select-bordered w-full"
                  [disabled]="form.value.ambito === 'global'">
            <option value="">-- Selecciona Invernadero --</option>
            <option *ngFor="let inv of invernaderos" [value]="inv.id">{{ inv.nombre }}</option>
          </select>
        </div>

        <!-- Parámetro -->
        <div *ngIf="form.value.ambito !== 'global'">
          <label class="label"><span class="label-text">Parámetro</span></label>
          <select formControlName="tipo_parametro_id" class="select select-bordered w-full"
                  [disabled]="form.value.ambito === 'global'">
            <option value="">-- Selecciona Parámetro --</option>
            <option *ngFor="let tp of tiposParametro" [value]="tp.id">{{ tp.nombre }} ({{ tp.unidad }})</option>
          </select>
        </div>

        <!-- Sensor -->
        <div *ngIf="form.value.ambito === 'sensor'">
          <label class="label"><span class="label-text">Sensor</span></label>
          <select formControlName="sensor_parametro_id" class="select select-bordered w-full"
                  [disabled]="!sensorEnabled">
            <option value="">-- Selecciona Sensor --</option>
            <option *ngFor="let s of sensores" [value]="s.id">{{ s.nombre }}</option>
          </select>
          <div *ngIf="form.value.ambito==='sensor' && sensores.length === 0" class="text-sm text-warning">
            No hay sensores disponibles para ese invernadero y parámetro.
          </div>
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
  tiposParametro: TipoParametro[] = [];
  sensores: Sensor[] = [];
  sensorEnabled = false;

  constructor(
    private fb: FormBuilder,
    private umbralService: UmbralService,
    private invSvc: InvernaderoService,
    private tpSvc: TipoParametroService,
    private sensorSvc: SensoresService,
    private modal: UmbralModalService
  ) {}

  ngOnInit() {
    // Inicializar form
    const sel = this.modal.selectedUmbral$.value;
    this.isEdit = !!sel?.id;
    this.form = this.fb.group({
      id: [sel?.id || null],
      ambito: [sel ? this.getAmbito(sel) : 'global', Validators.required],
      invernadero_id: [sel?.invernadero_id || null],
      tipo_parametro_id: [sel?.tipo_parametro_id || null],
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
    this.form.get('invernadero_id')!.valueChanges.subscribe(() => this.onScopeChange());
    this.form.get('tipo_parametro_id')!.valueChanges.subscribe(() => this.onScopeChange());

    // Si editamos sensor, cargar sensores iniciales
    if (this.isEdit && this.form.value.ambito === 'sensor') {
      this.loadSensores();
    }
  }

  private getAmbito(u: Umbral): string {
    if (u.sensor_parametro_id) return 'sensor';
    if (u.invernadero_id)    return 'invernadero';
    return 'global';
  }

  private resetScopeFields() {
    this.form.patchValue({ invernadero_id: null, tipo_parametro_id: null, sensor_parametro_id: null });
    this.sensores = [];
    this.sensorEnabled = false;
  }

  private onScopeChange() {
    const amb = this.form.value.ambito;
    const invId = this.form.value.invernadero_id;
    const tpId = this.form.value.tipo_parametro_id;

    // Habilitar sensor select solo si ámbito= sensor y ambos IDs disponibles
    this.sensorEnabled = (amb === 'sensor' && invId != null && tpId != null);
    if (this.sensorEnabled) {
      this.loadSensores();
    } else {
      this.form.patchValue({ sensor_parametro_id: null });
      this.sensores = [];
    }
  }

  private loadSensores() {
    const invId = this.form.value.invernadero_id;
    const tpId = this.form.value.tipo_parametro_id;
    if (invId != null && tpId != null) {
      this.sensorSvc.getSensoresPorFiltro(invId, tpId).subscribe(list => this.sensores = list);
    }
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
        this.modal.closeWithAnimation();
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
