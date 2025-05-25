// src/app/sensores/components/sensor-edit-modal.component.ts
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule }   from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Invernadero, Zona } from '../../invernaderos/models/invernadero.model';
import { InvernaderoService } from '../../invernaderos/invernaderos.service';
import { ZonaService }        from '../../invernaderos/zona.service';
import { SensoresService, EditarSensorPayload } from '../sensores.service';
import { Sensor }             from '../models/sensor.model';
import { TipoParametro }      from '../models/tipos_parametro.model';
import { TipoParametroService } from '../tipos_parametro.service';

@Component({
  selector: 'app-sensor-edit-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="p-8 bg-base-100 rounded-lg shadow-lg max-w-2xl w-full space-y-5">
      <h2 class="text-2xl font-bold text-success">Editar Sensor</h2>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <!-- Nombre -->
        <div class="sm:col-span-2">
          <label class="label-base-content">Nombre</label>
          <input type="text" formControlName="nombre" class="input input-bordered w-full" />
          <div *ngIf="form.get('nombre')?.invalid && form.get('nombre')?.touched"
               class="text-error text-sm mt-1">
            Nombre obligatorio.
          </div>
        </div>

        <!-- Invernadero -->
        <div>
          <label class="label-base-content">Invernadero</label>
          <select formControlName="invernadero_id"
                  (change)="onInvernaderoChange()"
                  class="select select-bordered w-full">
            <option [ngValue]="null" disabled>Seleccione uno</option>
            <option *ngFor="let inv of invernaderos" [value]="inv.id">{{ inv.nombre }}</option>
          </select>
        </div>

        <!-- Zona -->
        <div>
          <label class="label-base-content">Zona (opcional)</label>
          <select formControlName="zona_id"
                  [disabled]="zonas.length===0"
                  class="select select-bordered w-full">
            <option [ngValue]="null">Todas las zonas</option>
            <option *ngFor="let z of zonas" [value]="z.id">{{ z.nombre }}</option>
          </select>
        </div>

        <!-- Descripción -->
        <div class="sm:col-span-2">
          <label class="label-base-content">Descripción</label>
          <textarea formControlName="descripcion"
                    rows="3"
                    class="textarea textarea-bordered w-full"></textarea>
        </div>

        <!-- Estado -->
        <div class="flex items-center gap-2">
          <label class="label-base-content">Activo</label>
          <input type="checkbox"
                 [checked]="form.get('estado')?.value==='Activo'"
                 (change)="toggleEstado($event)"
                 class="toggle toggle-success" />
        </div>

        <!-- Parámetros -->
        <div class="sm:col-span-2">
          <label class="label-base-content">¿Qué mide?</label>
          <div class="flex flex-wrap gap-2">
            <label *ngFor="let p of posiblesParametros"
                   class="inline-flex items-center cursor-pointer">
              <input type="checkbox" class="sr-only peer"
                     [value]="p.id"
                     (change)="toggleParametro(p.id, $event)"
                     [checked]="isParametroSeleccionado(p.id)" />
              <span
                  class="badge badge-outline
                    peer-checked:badge-success
                    peer-checked:text-base-content
                    transition-colors duration-150 ease-in-out"
                  >
                {{ p.nombre }}
              </span>
            </label>
          </div>
          <div *ngIf="parametrosSeleccionados.length===0 && parametrosTouched"
               class="text-error text-sm mt-1">
            Selecciona al menos un parámetro.
          </div>
        </div>

        <!-- Botones -->
        <div class="sm:col-span-2 flex justify-end space-x-2">
          <button type="button" class="btn btn-ghost" (click)="onClose()">Cancelar</button>
          <button type="submit"
                  class="btn btn-primary"
                  [disabled]="form.invalid || parametrosSeleccionados.length===0">
            Guardar
          </button>
        </div>
      </form>
    </div>
  `
})
export class SensorEditModalComponent implements OnInit {
  @Input()  sensor!: Sensor;
  @Output() saved  = new EventEmitter<Sensor>();
  @Output() close  = new EventEmitter<void>();

  form!: FormGroup;
  invernaderos: Invernadero[]     = [];
  zonas:         Zona[]            = [];
  posiblesParametros: TipoParametro[] = [];
  parametrosSeleccionados: number[]   = [];
  parametrosTouched = false;

  constructor(
    private fb:   FormBuilder,
    private inv:  InvernaderoService,
    private zs:   ZonaService,
    private ps:   TipoParametroService,
    private svc:  SensoresService
  ) {}

  ngOnInit() {
    // 1) Inicializa formulario con datos del sensor
    this.form = this.fb.group({
      nombre:         [this.sensor.nombre, Validators.required],
      descripcion:    [this.sensor.descripcion || ''],
      estado:         [this.sensor.estado],
      invernadero_id: [this.sensor.invernadero?.id || null, Validators.required],
      zona_id:        [this.sensor.zona?.id || null]
    });

    // 2) Carga selects
    this.inv.getInvernaderos().subscribe(l => {
      this.invernaderos = l;
      if (this.sensor.invernadero?.id) {
        this.loadZonas(this.sensor.invernadero.id);
      }
    });

    this.ps.obtenerTiposParametro().subscribe(l => {
      this.posiblesParametros = l;
      this.parametrosSeleccionados = this.sensor.parametros.map(x => x.id);
    });
  }

  private loadZonas(invId: number) {
    this.zs.getZonasByInvernadero(invId).subscribe(zs => this.zonas = zs);
  }

  onInvernaderoChange() {
    const invId = this.form.value.invernadero_id as number;
    this.form.patchValue({ zona_id: null });
    this.zonas = [];
    if (invId) this.loadZonas(invId);
  }

  toggleEstado(e: Event) {
    const checked = (e.target as HTMLInputElement).checked;
    this.form.patchValue({ estado: checked ? 'Activo' : 'Inactivo' });
  }

  toggleParametro(id: number, e: Event) {
    this.parametrosTouched = true;
    const chk = (e.target as HTMLInputElement).checked;
    if (chk) this.parametrosSeleccionados.push(id);
    else      this.parametrosSeleccionados = this.parametrosSeleccionados.filter(x => x!==id);
  }

  isParametroSeleccionado(id: number) {
    return this.parametrosSeleccionados.includes(id);
  }

  onSubmit() {
    if (this.form.invalid || this.parametrosSeleccionados.length===0) return;
    const payload: EditarSensorPayload = {
      id:              this.sensor.id,
      nombre:          this.form.value.nombre,
      descripcion:     this.form.value.descripcion,
      estado:          this.form.value.estado,
      tipo_sensor_id:   this.sensor.tipo_sensor.id,
      invernadero_id:  this.form.value.invernadero_id,
      zona_id:         this.form.value.zona_id,
      parametro_ids:   this.parametrosSeleccionados
    };
    this.svc.editarSensor(payload).subscribe({
      next: updated => this.saved.emit(updated),
      error: ()      => alert('❌ No se pudo guardar.')
    });
  }

  onClose() {
    this.close.emit();
  }
}
