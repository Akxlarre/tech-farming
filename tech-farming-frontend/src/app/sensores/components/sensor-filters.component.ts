// src/app/sensores/components/sensor-filters.component.ts
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

import { TipoSensor }       from '../models/tipo-sensor.model';
import { Zona, Invernadero } from '../../invernaderos/models/invernadero.model';
import { ZonaService }      from '../../invernaderos/zona.service';

@Component({
  selector: 'app-sensor-filters',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="card bg-base-200 p-6 rounded-xl shadow-lg mb-6">
      <!-- FILTROS ACTIVOS COMO CHIPS -->
      <div *ngIf="hasActiveFilters()" class="flex flex-wrap gap-2 mb-4">
        <ng-container *ngFor="let chip of activeChips()">
          <span class="badge badge-outline badge-primary flex items-center">
            {{ chip.label }}
            <button
              type="button"
              class="btn btn-xs btn-circle btn-ghost ml-2"
              (click)="removeFilter(chip.key)"
              [attr.aria-label]="'Quitar filtro ' + chip.label"
            >×</button>
          </span>
        </ng-container>
        <button
          type="button"
          class="btn btn-sm btn-ghost ml-4"
          (click)="clearAll()"
        >Limpiar todo</button>
      </div>

      <form [formGroup]="filterForm" (ngSubmit)="apply()" class="space-y-4">
        <!-- ROW 1: Invernadero / Zona / Tipo / Estado -->
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <!-- 1. Invernadero -->
          <div>
            <label class="label">Invernadero</label>
            <select formControlName="invernadero"
              class="select select-bordered rounded-lg w-full focus:ring focus:ring-green-500"
            >
              <option value="">Todos</option>
              <option *ngFor="let inv of invernaderos" [value]="inv.id">{{ inv.nombre }}</option>
            </select>
          </div>
          <!-- 2. Zona -->
          <div>
            <label class="label">Zona</label>
            <select formControlName="zona"
              class="select select-bordered rounded-lg w-full focus:ring focus:ring-green-500"
              [disabled]="!zonasDisponibles.length"
            >
              <option value="">Todas</option>
              <option *ngFor="let z of zonasDisponibles" [value]="z.id">{{ z.nombre }}</option>
            </select>
          </div>
          <!-- 3. Tipo de sensor -->
          <div>
            <label class="label">Tipo</label>
            <select formControlName="tipoSensor"
              class="select select-bordered rounded-lg w-full focus:ring focus:ring-green-500"
            >
              <option value="">Todos</option>
              <option *ngFor="let t of tiposSensor" [value]="t.id">{{ t.nombre }}</option>
            </select>
          </div>
          <!-- 4. Estado -->
          <div>
            <label class="label">Estado</label>
            <select formControlName="estado"
              class="select select-bordered rounded-lg w-full focus:ring focus:ring-green-500"
            >
              <option value="">Todos</option>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
              <option value="Mantenimiento">Mantenimiento</option>
            </select>
          </div>
        </div>

        <!-- ROW 2: Orden / Buscar / Aplicar -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <!-- 5. Orden -->
          <div>
            <label class="label">Ordenar por</label>
            <select formControlName="sortBy"
              class="select select-bordered rounded-lg w-full focus:ring focus:ring-green-500"
            >
              <option value="">Sin ordenar</option>
              <option value="nombre">Nombre A→Z</option>
              <option value="-nombre">Nombre Z→A</option>
              <option value="fecha_instalacion">Fecha ↑</option>
              <option value="-fecha_instalacion">Fecha ↓</option>
            </select>
          </div>
          <!-- 6. Búsqueda -->
          <div>
            <label class="label">Buscar</label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                🔍
              </span>
              <input
                type="text"
                formControlName="search"
                placeholder="Nombre del sensor..."
                class="input input-bordered pl-10 rounded-lg w-full focus:ring focus:ring-green-500"
              />
            </div>
          </div>
          <!-- 7. Botón aplicar -->
          <div class="flex justify-end sm:justify-start">
            <button
              type="submit"
              class="btn btn-primary h-12 w-full sm:w-auto"
            >
              Aplicar
            </button>
          </div>
        </div>
      </form>
    </div>
  `
})
export class SensorFiltersComponent implements OnInit {
  @Input() tiposSensor:     TipoSensor[]  = [];
  @Input() invernaderos:    Invernadero[] = [];

  zonasDisponibles: Zona[]  = [];

  @Output() filter = new EventEmitter<{
    invernadero?: number;
    zona?:        number;
    tipoSensor?:  number;
    estado?:      string;
    sortBy?:      string;
    search?:      string;
  }>();

  filterForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private zonaSvc: ZonaService
  ) {}

  ngOnInit() {
    this.filterForm = this.fb.group({
      invernadero: [''],
      zona:         [{ value: '', disabled: true }],
      tipoSensor:  [''],
      estado:      [''],
      sortBy:      [''],
      search:      ['']
    });

    // recargar zonas en cascada
    this.filterForm.get('invernadero')!.valueChanges.subscribe(invId => {
      const zonaCtrl = this.filterForm.get('zona')!;
      if (invId) {
        this.zonaSvc.getZonasByInvernadero(+invId).subscribe(zs => {
          this.zonasDisponibles = zs;
          zonaCtrl.enable({ emitEvent: false });
        });
      } else {
        this.zonasDisponibles = [];
        zonaCtrl.disable({ emitEvent: false });
      }
    });
  }

  apply() {
    // emitir valores del formulario (incluidos los vacíos)
    this.filter.emit(this.filterForm.getRawValue());
  }

  /** ¿Hay algún filtro distinto de vacío? */
  hasActiveFilters(): boolean {
    const v = this.filterForm.getRawValue();
    return Object.values(v).some(val => val !== '' && val != null);
  }

  /** Construye los chips de filtros activos */
  activeChips() {
    const map: { [key: string]: string } = {
      invernadero: 'Invernadero',
      zona:        'Zona',
      tipoSensor:  'Tipo',
      estado:      'Estado',
      sortBy:      'Orden',
      search:      'Buscar'
    };
    const labels: any = {
      // podrías mapear ID→nombre si tuvieras los arrays disponibles aquí
    };
    const v = this.filterForm.getRawValue();
    const chips: Array<{ key: string; label: string }> = [];
    for (const key of Object.keys(v)) {
      const val = v[key as keyof typeof v];
      if (val !== '' && val != null) {
        let text = `${map[key]}: ${val}`;
        // opcional: reemplazar val por nombre de invernadero/tipo/ zona reales
        chips.push({ key, label: text });
      }
    }
    return chips;
  }

  /** Quitar sólo un filtro (resetea ese campo) */
  removeFilter(key: string) {
    this.filterForm.patchValue({ [key]: '' });
    if (key === 'invernadero') {
      this.zonasDisponibles = [];
      this.filterForm.get('zona')!.disable({ emitEvent: false });
    }
    // y volver a aplicar inmediatamente
    this.apply();
  }

  /** Limpiar todos los filtros */
  clearAll() {
    this.filterForm.reset({
      invernadero: '',
      zona:         '',
      tipoSensor:  '',
      estado:      '',
      sortBy:      '',
      search:      ''
    });
    this.zonasDisponibles = [];
    this.filterForm.get('zona')!.disable({ emitEvent: false });
    this.apply();
  }
}
