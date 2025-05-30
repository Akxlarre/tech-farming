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

@Component({
  selector: 'app-sensor-create-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <ng-container *ngIf="!created; else instructions">
      <div class="p-8 space-y-5 bg-base-100 rounded-lg shadow-lg w-full max-w-2xl">
        <h2 class="text-[1.625rem] font-bold text-success flex items-center gap-2">
          Crear Nuevo Sensor
        </h2>

        <form
          [formGroup]="form"
          (ngSubmit)="onSubmit()"
          class="grid grid-cols-1 sm:grid-cols-2 gap-5"
        >
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
        </form>
      </div>
    </ng-container>

    <!-- Paso 2: instrucciones -->
    <ng-template #instructions>
      <div class="p-4 sm:p-8 bg-base-100 rounded-lg shadow-lg w-full max-w-[90vw] sm:max-w-2xl">
        <h2 class="text-2xl font-bold text-success flex items-center gap-2">
          Sensor creado con éxito
        </h2>

        <section>
          <h3 class="font-semibold mb-2">1. Token de Conexión</h3>
          <div class="form-control">
            <div class="flex gap-2 items-center">
              <input
                type="text"
                [value]="created.token"
                readonly
                class="input input-bordered w-full"
              />
              <button
                type="button"
                class="btn btn-outline relative w-10 h-10 p-0 flex items-center justify-center group"
                (click)="animateCopyIcon()"
                aria-label="Copiar token"
              >
                <svg viewBox="0 0 24 24" class="w-6 h-6 text-base-content transition-opacity duration-300 group-[.copied]:opacity-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                <svg viewBox="0 0 24 24" class="w-6 h-6 text-success absolute opacity-0 transition-opacity duration-300 group-[.copied]:opacity-100" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 6L9 17l-5-5"></path>
                </svg>
              </button>
            </div>
          </div>
        </section>

        <section class="space-y-1">
          <h3 class="font-semibold text-base sm:text-lg">2. Enviar datos a la API</h3>
          <pre class="bg-base-200 p-3 rounded text-sm whitespace-pre-wrap break-all overflow-auto">
POST {{ apiUrl }}/sensores/datos
          </pre>
        </section>

        <section>
          <h3 class="font-semibold mt-6 mb-2">3. Ejemplo de JSON</h3>
          <pre class="bg-base-200 p-3 rounded overflow-auto text-sm whitespace-pre-wrap">
<code>{{ jsonEjemplo }}</code>
          </pre>
        </section>

        <section>
          <h3 class="font-semibold mt-6 mb-2">4. Parámetros válidos</h3>
          <ul class="list-disc list-inside">
            <li>Temperatura</li>
            <li>Humedad</li>
            <li>Potasio</li>
            <li>Fósforo</li>
            <li>Nitrógeno</li>
          </ul>
          <p class="text-sm text-base-content/70 mt-1">
            * Deben escribirse exactamente como se muestra, respetando mayúsculas.
          </p>
        </section>

        <div class="flex justify-end pt-4">
          <button class="btn btn-primary" (click)="onClose()">Cerrar</button>
        </div>
      </div>
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

    this.invSvc.getInvernaderos().subscribe(inv => (this.invernaderos = inv));
    this.tiposSvc.obtenerTiposSensor().subscribe(ts => (this.tiposSensores = ts));
    this.paramSvc.obtenerTiposParametro().subscribe(tp => (this.posiblesParametros = tp));
  }

  onInvernaderoChange() {
    const invId = this.form.value.invernadero_id;
    this.zonas = [];
    this.form.patchValue({ zona_id: null });
    if (invId) {
      this.zonaSvc.getZonasByInvernadero(invId).subscribe(zs => (this.zonas = zs));
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

    this.svc.crearSensor(payload).subscribe({
      next: res => {
        this.created = res;
        this.saved.emit(res);
      },
      error: () => alert('❌ No se pudo crear el sensor.')
    });
  }

  animateCopyIcon() {
    navigator.clipboard.writeText(this.created.token).then(() => {
      const btn = document.activeElement as HTMLElement;
      btn?.classList.add('copied');
      setTimeout(() => btn?.classList.remove('copied'), 1200);
    });
  }

  onClose() {
    this.close.emit();
  }
}
