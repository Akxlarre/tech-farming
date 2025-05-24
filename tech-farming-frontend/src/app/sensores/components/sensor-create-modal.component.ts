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
        <h2 class="text-[1.625rem] font-bold text-green-700 flex items-center gap-2">
          ➕ Crear Nuevo Sensor
        </h2>

        <form
          [formGroup]="form"
          (ngSubmit)="onSubmit()"
          class="grid grid-cols-1 sm:grid-cols-2 gap-5"
        >
          <!-- Nombre -->
          <div class="sm:col-span-2">
            <label for="nombre" class="label">Nombre del sensor</label>
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

          <!-- Tipo de sensor -->
          <div>
            <label for="tipo_sensor_id" class="label">Tipo de sensor</label>
            <select
              id="tipo_sensor_id"
              formControlName="tipo_sensor_id"
              class="select select-bordered w-full"
            >
              <option [ngValue]="null" disabled>Seleccione uno</option>
              <option *ngFor="let ts of tiposSensores" [value]="ts.id">
                {{ ts.nombre }}
              </option>
            </select>
            <span
              *ngIf="
                form.get('tipo_sensor_id')!.invalid &&
                form.get('tipo_sensor_id')!.touched
              "
              class="text-error text-sm mt-1 block"
            >
              Selecciona un tipo de sensor.
            </span>
          </div>

          <!-- Invernadero -->
          <div>
            <label for="invernadero_id" class="label">Invernadero</label>
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
              *ngIf="
                form.get('invernadero_id')!.invalid &&
                form.get('invernadero_id')!.touched
              "
              class="text-error text-sm mt-1 block"
            >
              Selecciona un invernadero.
            </span>
          </div>

          <!-- Zona -->
          <div>
            <label for="zona_id" class="label">Zona (opcional)</label>
            <select
              id="zona_id"
              formControlName="zona_id"
              class="select select-bordered w-full"
              [disabled]="zonas.length === 0"
            >
              <option [ngValue]="null">Todas las zonas</option>
              <option *ngFor="let z of zonas" [value]="z.id">
                {{ z.nombre }}
              </option>
            </select>
          </div>

          <!-- Descripción -->
          <div class="sm:col-span-2">
            <label for="descripcion" class="label">
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
            <label for="estado" class="label">Estado</label>
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
            <label class="label">¿Qué mide el sensor?</label>
            <div class="flex flex-wrap gap-2">
              <ng-container *ngFor="let param of posiblesParametros">
                <label class="cursor-pointer flex items-center">
                  <input
                    type="checkbox"
                    [value]="param.id"
                    (change)="toggleParametro(param.id, $event)"
                    [checked]="isParametroSeleccionado(param.id)"
                    class="hidden peer"
                  />
                  <span
                    class="px-3 py-1 rounded-full bg-gray-200 text-sm
                      peer-checked:bg-green-600 peer-checked:text-white"
                  >
                    {{ param.nombre }}
                  </span>
                </label>
              </ng-container>
            </div>
            <span
              *ngIf="
                parametrosSeleccionados.length === 0 && parametrosTouched
              "
              class="text-error text-sm mt-1 block"
            >
              Selecciona al menos un parámetro.
            </span>
          </div>

          <!-- Botón Crear -->
          <div class="sm:col-span-2 flex justify-end">
            <button
              type="submit"
              class="btn btn-primary"
              [disabled]="
                form.invalid || parametrosSeleccionados.length === 0
              "
            >
              Crear Sensor
            </button>
          </div>
        </form>
      </div>
    </ng-container>

    <!-- Paso 2: instrucciones y token -->
    <ng-template #instructions>
      <div class="p-8 space-y-5 bg-base-100 rounded-lg shadow-lg w-full max-w-2xl">
        <h2 class="text-[1.625rem] font-bold text-green-700 flex items-center gap-2">
          ✅ Sensor Creado con Éxito
        </h2>

        <!-- Token -->
        <div class="form-control">
          <label class="label">Token de Conexión</label>
          <div class="flex gap-2">
            <input
              type="text"
              [value]="created.token"
              readonly
              class="input input-bordered w-full"
            />
            <button
              class="btn btn-outline"
              (click)="copyToken()"
              title="Copiar token"
            >
              📋
            </button>
          </div>
        </div>

        <!-- Instrucciones de API -->
        <div class="prose">
          <p>Envía una solicitud <code>POST</code> a:</p>
          <pre><code>POST {{ apiUrl }}/sensores/datos</code></pre>

          <p class="mt-4">Con el siguiente JSON en el <code>body</code>:</p>
          <pre class="whitespace-pre-wrap"><code>
{{ '{' }}
  "token": "{{ created.token }}",
  "parametros": {{ '{' }}
    "Temperatura": 25.4,
    "Humedad": 80.2
  {{ '}' }}
{{ '}' }}</code></pre>

          <p>Parámetros válidos (deben escribirse exactamente):</p>
          <ul>
            <li>Temperatura</li>
            <li>Humedad</li>
            <li>Potasio</li>
            <li>Fósforo</li>
            <li>Nitrógeno</li>
          </ul>
        </div>

        <div class="flex justify-end">
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
  tiposSensores: TipoSensor[] = [];
  posiblesParametros: TipoParametro[] = [];
  parametrosSeleccionados: number[] = [];
  parametrosTouched = false;

  created!: CrearSensorResponse;
  apiUrl = 'http://localhost:5000/api';

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
      nombre: ['', Validators.required],
      descripcion: [''],
      estado: ['Activo'],
      tipo_sensor_id: [null, Validators.required],
      invernadero_id: [null, Validators.required],
      zona_id: [null]
    });

    this.invSvc.getInvernaderos().subscribe(list => (this.invernaderos = list));
    this.tiposSvc.obtenerTiposSensor()
      .subscribe(list => (this.tiposSensores = list));
    this.paramSvc.obtenerTiposParametro()
      .subscribe(list => (this.posiblesParametros = list));
  }

  onInvernaderoChange() {
    const invId = this.form.get('invernadero_id')!.value;
    this.zonas = [];
    this.form.patchValue({ zona_id: null });
    if (invId) {
      this.zonaSvc.getZonasByInvernadero(invId)
        .subscribe(zs => (this.zonas = zs));
    }
  }

  toggleEstado(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.form.patchValue({ estado: checked ? 'Activo' : 'Inactivo' });
  }

  toggleParametro(id: number, event: Event) {
    this.parametrosTouched = true;
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.parametrosSeleccionados.push(id);
    } else {
      this.parametrosSeleccionados = this.parametrosSeleccionados.filter(x => x !== id);
    }
  }

  isParametroSeleccionado(id: number): boolean {
    return this.parametrosSeleccionados.includes(id);
  }

  onSubmit() {
    if (this.form.invalid || this.parametrosSeleccionados.length === 0) return;

    const payload: CrearSensorPayload = {
      nombre: this.form.value.nombre,
      descripcion: this.form.value.descripcion,
      estado: this.form.value.estado,
      tipo_sensor_id: this.form.value.tipo_sensor_id,
      invernadero_id: this.form.value.invernadero_id,
      zona_id: this.form.value.zona_id,
      parametro_ids: this.parametrosSeleccionados
    };

    this.svc.crearSensor(payload).subscribe({
      next: res => {
        this.created = res;
        this.saved.emit(res);
      },
      error: () => {
        alert('❌ No se pudo crear el sensor.');
      }
    });
  }

  copyToken() {
    navigator.clipboard.writeText(this.created.token);
    alert('✔️ Token copiado al portapapeles');
  }

  onClose() {
    this.close.emit();
  }
}
