// src/app/sensores/components/sensor-create-modal.component.ts
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';

import { Invernadero, Zona } from '../../invernaderos/models/invernadero.model';
import { InvernaderoService } from '../../invernaderos/invernaderos.service';
import { ZonaService } from '../../invernaderos/zona.service';

import {
  SensoresService,
  CrearSensorPayload,
  CrearSensorResponse
} from '../sensores.service';

import { TipoSensor } from '../models/tipo-sensor.model';
import { TipoParametro } from '../models/tipos_parametro.model';
import { TipoSensorService } from '../tipos_sensor.service';
import { TipoParametroService } from '../tipos_parametro.service';
import { forkJoin } from 'rxjs';
import { SensorSetupWizardComponent } from './sensor-setup-wizard.component';

@Component({
  selector: 'app-sensor-create-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SensorSetupWizardComponent],
  template: `
    <div *ngIf="!loading; else loadingTpl">
    <ng-container *ngIf="!created; else instructions">
      <div class="p-8 space-y-5 bg-base-100 rounded-lg shadow-lg w-full max-w-2xl">
        <h2 class="text-[1.625rem] font-bold text-success flex items-center gap-2">
          Crear Nuevo Sensor
        </h2>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <fieldset [disabled]="loading" class="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <!-- Nombre -->
          <div class="sm:col-span-2">
            <label for="nombre" class="label-base-content">Nombre del sensor</label>
            <input
              id="nombre"
              type="text"
              formControlName="nombre"
              placeholder="Ej: Sensor Norte"
              class="input input-bordered w-full"
            />
            <span
              *ngIf="form.get('nombre')!.invalid && form.get('nombre')!.touched"
              class="text-error text-sm mt-1 block"
            >
              El nombre es obligatorio.
            </span>
          </div>

          <!-- Invernadero -->
          <div>
            <label for="invernadero_id" class="label-base-content">Invernadero</label>
            <select
              id="invernadero_id"
              formControlName="invernadero_id"
              (change)="onInvernaderoChange()"
              class="select select-bordered w-full"
            >
              <option [ngValue]="null" disabled>Seleccione uno</option>
              <option *ngFor="let inv of invernaderos" [value]="inv.id">
                {{ inv.nombre }}
              </option>
            </select>
            <span
              *ngIf="form.get('invernadero_id')!.invalid && form.get('invernadero_id')!.touched"
              class="text-error text-sm mt-1 block"
            >
              Selecciona un invernadero.
            </span>
          </div>

          <!-- Zona (ahora obligatoria) -->
          <div>
            <label for="zona_id" class="label-base-content">Zona</label>
            <select
              id="zona_id"
              formControlName="zona_id"
              class="select select-bordered w-full"
              [disabled]="zonas.length === 0"
            >
              <option [ngValue]="null" disabled>Seleccione una zona</option>
              <option *ngFor="let z of zonas" [value]="z.id">
                {{ z.nombre }}
              </option>
            </select>
            <span
              *ngIf="form.get('zona_id')!.invalid && form.get('zona_id')!.touched"
              class="text-error text-sm mt-1 block"
            >
              Selecciona una zona.
            </span>
          </div>

          <!-- Descripción -->
          <div class="sm:col-span-2">
            <label for="descripcion" class="label-base-content">
              Descripción (opcional)
            </label>
            <textarea
              id="descripcion"
              formControlName="descripcion"
              rows="3"
              class="textarea textarea-bordered w-full"
              placeholder="Breve descripción del sensor"
            ></textarea>
          </div>

          <!-- Estado -->
          <div class="flex items-center gap-3">
            <label for="estado" class="label-base-content">Estado</label>
            <input
              id="estado"
              type="checkbox"
              [checked]="form.get('estado')!.value === 'Activo'"
              (change)="toggleEstado($event)"
              class="toggle toggle-success"
            />
            <span class="text-sm">
              {{ form.get('estado')!.value || 'Inactivo' }}
            </span>
          </div>

          <!-- Parámetros -->
          <div class="sm:col-span-2">
            <label class="label-base-content">¿Qué mide el sensor?</label>
            <div class="flex flex-wrap gap-2">
              <ng-container *ngFor="let param of posiblesParametros">
                <label class="inline-flex items-center cursor-pointer mt-2">
                  <input
                    type="checkbox"
                    class="peer sr-only"
                    [value]="param.id"
                    (change)="toggleParametro(param.id, $event)"
                    [checked]="isParametroSeleccionado(param.id)"
                  />
                  <span
                    class="badge badge-outline
                          peer-checked:badge-success
                          peer-checked:text-base-content
                          transition-colors duration-150 ease-in-out"
                  >
                    {{ param.nombre }}
                  </span>
                </label>
              </ng-container>
            </div>

            <div class="min-h-[1.25rem]">
              <span
                *ngIf="parametrosSeleccionados.length === 0 && parametrosTouched"
                class="text-error text-sm mt-1 block"
              >
                Selecciona al menos un parámetro.
              </span>
            </div>
          </div>

          <!-- Botones -->
          <div class="sm:col-span-2 flex justify-end gap-2 mt-4">
            <button
              type="button"
              class="btn btn-ghost"
              (click)="close.emit()"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              [disabled]="form.invalid || parametrosSeleccionados.length === 0 || zonas.length === 0"
            >
              Crear Sensor
          </button>
        </div>
        </fieldset>
      </form>
    </div>
  </ng-container>
  </div>
  <ng-template #loadingTpl>
    <div class="p-8 text-center">
      <svg class="animate-spin w-8 h-8 text-success mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
      </svg>
    </div>
  </ng-template>

    <!-- Paso 2: instrucciones -->
    <ng-template #instructions>
      <app-sensor-setup-wizard
        [createdToken]="created.token"
        (finalizado)="onClose()"
        (saltado)="onClose()"
      ></app-sensor-setup-wizard>
    </ng-template>
  `
})
export class SensorCreateModalComponent implements OnInit {
  @Output() saved = new EventEmitter<CrearSensorResponse>();
  @Output() close = new EventEmitter<void>();

  form!: FormGroup;
  invernaderos: Invernadero[] = [];
  zonas: Zona[] = [];
  posiblesParametros: TipoParametro[] = [];
  parametrosSeleccionados: number[] = [];
  parametrosTouched = false;
  tiposSensores: TipoSensor[] = [];
  created!: CrearSensorResponse;
  apiUrl = 'http://localhost:5000/api';
  loading = false;

  get jsonEjemplo() {
    return `{
  "token": "${this.created?.token || ''}",
  "mediciones": [
    { "parametro": "Temperatura", "valor": 25.4 },
    { "parametro": "Humedad", "valor": 80.2 }
  ]
}`;
  }

  constructor(
    private fb: FormBuilder,
    private invSvc: InvernaderoService,
    private zonaSvc: ZonaService,
    private tiposSvc: TipoSensorService,
    private paramSvc: TipoParametroService,
    private svc: SensoresService
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      nombre:           ['', Validators.required],
      descripcion:      [''],
      estado:           ['Activo'],
      invernadero_id:   [null, Validators.required],
      zona_id:          [null, Validators.required]
    });

    this.loading = true;
    forkJoin([
      this.invSvc.getInvernaderos(),
      this.tiposSvc.obtenerTiposSensor(),
      this.paramSvc.obtenerTiposParametro()
    ]).subscribe({
      next: ([invs, tipos, params]) => {
        this.invernaderos = invs;
        this.tiposSensores = tipos;
        this.posiblesParametros = params;
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }

  onInvernaderoChange() {
    const invId = this.form.value.invernadero_id;
    this.zonas = [];
    this.form.patchValue({ zona_id: null });
    if (invId) {
      this.loading = true;
      this.zonaSvc.getZonasByInvernadero(invId).subscribe({
        next: zs => {
          this.zonas = zs;
          this.loading = false;
        },
        error: () => (this.loading = false)
      });
    }
  }

  toggleEstado(e: Event) {
    const checked = (e.target as HTMLInputElement).checked;
    this.form.patchValue({ estado: checked ? 'Activo' : 'Inactivo' });
  }

  toggleParametro(id: number, e: Event) {
    this.parametrosTouched = true;
    const checked = (e.target as HTMLInputElement).checked;
    if (checked) this.parametrosSeleccionados.push(id);
    else this.parametrosSeleccionados = this.parametrosSeleccionados.filter(x => x !== id);
  }

  isParametroSeleccionado(id: number) {
    return this.parametrosSeleccionados.includes(id);
  }

  onSubmit() {
    this.parametrosTouched = true;
    if (this.form.invalid || this.parametrosSeleccionados.length === 0 || this.zonas.length === 0) {
      this.form.markAllAsTouched();
      return;
    }

    const tipoName = this.parametrosSeleccionados.length > 1 ? 'Multiparámetro' : 'De un parámetro';
    const tipo = this.tiposSensores.find(t => t.nombre === tipoName);
    if (!tipo) return alert(`❌ No existe el tipo "${tipoName}" en la configuración`);

    const payload: CrearSensorPayload = {
      nombre:           this.form.value.nombre,
      descripcion:      this.form.value.descripcion,
      estado:           this.form.value.estado,
      tipo_sensor_id:   tipo.id,
      invernadero_id:   this.form.value.invernadero_id,
      zona_id:          this.form.value.zona_id,
      parametro_ids:    this.parametrosSeleccionados
    };

    this.loading = true;
    this.svc.crearSensor(payload).subscribe({
      next: res => {
        this.created = res;
        this.loading = false;
        this.saved.emit(res);
      },
      error: () => {
        this.loading = false;
        alert('❌ No se pudo crear el sensor.');
      }
    });
  }

  onClose() {
    this.close.emit();
  }
}
