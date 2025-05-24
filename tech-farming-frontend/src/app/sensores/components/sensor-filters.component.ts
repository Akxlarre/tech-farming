// src/app/sensores/components/sensor-filters.component.ts
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

import { TipoSensor }        from '../models/tipo-sensor.model';
import { Zona, Invernadero } from '../../invernaderos/models/invernadero.model';
import { ZonaService }       from '../../invernaderos/zona.service';

@Component({
  selector: 'app-sensor-filters',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <!-- Cabecera con icono -->
    <div class="flex items-center gap-2 mb-4 px-6">
      <svg xmlns="http://www.w3.org/2000/svg"
           class="w-5 h-5 text-gray-600"
           fill="none"
           viewBox="0 0 24 24"
           stroke="currentColor"
      >
        <path stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L14 
                 13.414V19a1 1 0 01-1.447.894l-4-2A1 1 0 018 
                 17v-3.586L3.293 6.707A1 1 0 013 6V4z"
        />
      </svg>
      <h3 class="text-lg font-medium text-gray-700">Filtros</h3>
    </div>

    <div class="bg-base-200 px-6 rounded-xl mb-6">
      <!-- Formulario de filtros: 7 columnas en md -->
      <form [formGroup]="filterForm"
            (ngSubmit)="apply()"
            class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-4 items-end"
      >
        <!-- 1. Invernadero -->
        <div>
          <label class="label">Invernadero</label>
          <select formControlName="invernadero"
                  class="select select-bordered rounded-lg w-full focus:ring focus:ring-green-500"
          >
            <option disabled value="">Todos los invernaderos</option>
            <option *ngFor="let inv of invernaderos" [value]="inv.id">
              {{ inv.nombre }}
            </option>
          </select>
        </div>

        <!-- 2. Zona -->
        <div>
        <label class="label">Zona</label>
        <select
          formControlName="zona"
          class="select select-bordered rounded-lg w-full focus:ring focus:ring-green-500
                disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
          [disabled]="!filterForm.get('invernadero')?.value"
          [attr.title]="!filterForm.get('invernadero')?.value ? 'Selecciona un invernadero primero' : null"
        >
          <option value="">
            {{ filterForm.get('invernadero')?.value ? 'Todas las zonas' : 'Selecciona un invernadero primero' }}
          </option>
          <option *ngFor="let z of zonasDisponibles" [value]="z.id">
            {{ z.nombre }}
          </option>
        </select>
      </div>

        <!-- 3. Tipo de sensor -->
        <div>
          <label class="label">Tipo</label>
          <select formControlName="tipoSensor"
                  class="select select-bordered rounded-lg w-full focus:ring focus:ring-green-500"
          >
            <option disabled value="">Todos los tipos</option>
            <option *ngFor="let t of tiposSensor" [value]="t.id">
              {{ t.nombre }}
            </option>
          </select>
        </div>

        <!-- 4. Estado -->
        <div>
          <label class="label">Estado</label>
          <select formControlName="estado"
                  class="select select-bordered rounded-lg w-full focus:ring focus:ring-green-500"
          >
            <option disabled value="">Todos</option>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
            <option value="Mantenimiento">Mantenimiento</option>
          </select>
        </div>

        <!-- 5. Ordenar por -->
        <div>
          <label class="label flex items-center gap-1">
            <span>⇅ Ordenar por</span>
          </label>
          <select formControlName="sortBy"
                  class="select select-bordered rounded-lg w-full focus:ring focus:ring-green-500"
          >
            <option disabled value="">Sin ordenar</option>
            <option value="nombre">Nombre A→Z</option>
            <option value="-nombre">Nombre Z→A</option>
            <option value="fecha_instalacion">Fecha ↑</option>
            <option value="-fecha_instalacion">Fecha ↓</option>
          </select>
        </div>

        <!-- 6. Buscar -->
        <div>
          <label class="label">Buscar</label>
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              🔍
            </span>
            <input type="text"
                   formControlName="search"
                   placeholder="Nombre del sensor..."
                   class="input input-bordered pl-10 rounded-lg w-full focus:ring focus:ring-green-500"
            />
          </div>
        </div>

        <!-- 7. Botón Aplicar -->
        <div class="flex justify-end md:justify-start">
          <button type="submit"
                  class="btn btn-outline btn-sm h-12 w-full md:w-auto"
          >Aplicar</button>
        </div>
      </form>

      <!-- Zona de chips: altura y padding responsive -->
      <div class="py-4 sm:py-0 mb-4 sm:mb-4 px-4 sm:px-0">
        <div class="flex flex-wrap gap-2 items-center transition-opacity duration-200"
             [class.opacity-0]="!hasActiveFilters()"
             [class.opacity-100]="hasActiveFilters()"
        >
          <ng-container *ngFor="let chip of activeChips()">
            <span class="badge badge-outline badge-primary flex items-center">
              {{ chip.label }}
              <button type="button"
                      class="btn btn-xs btn-circle btn-ghost ml-2"
                      (click)="removeFilter(chip.key)"
                      [attr.aria-label]="'Quitar filtro ' + chip.label">
                ×
              </button>
            </span>
          </ng-container>
          <button *ngIf="hasActiveFilters()"
                  type="button"
                  class="btn btn-sm btn-ghost ml-4"
                  (click)="clearAll()"
          >Limpiar todo</button>
        </div>
      </div>
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
  private labelMap: Record<string,string> = {
    invernadero: 'Invernadero',
    zona:        'Zona',
    tipoSensor:  'Tipo',
    estado:      'Estado',
    sortBy:      'Orden',
    search:      'Buscar'
  };

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

    this.filterForm.get('invernadero')!
      .valueChanges
      .subscribe(invId => {
        const zonaCtrl = this.filterForm.get('zona')!;
        if (invId) {
          this.zonaSvc.getZonasByInvernadero(+invId)
            .subscribe(zs => {
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
    this.filter.emit(this.filterForm.getRawValue());
  }

  hasActiveFilters(): boolean {
    const v = this.filterForm.getRawValue();
    return Object.values(v).some(val => val !== '' && val != null);
  }

  activeChips() {
    const v = this.filterForm.getRawValue();
    const chips: Array<{ key: string; label: string }> = [];
    for (const key of Object.keys(v)) {
      const val = v[key as keyof typeof v];
      if (!val) continue;
      let display: string;
      switch (key) {
        case 'invernadero':
          display = this.invernaderos.find(i => i.id === +val)?.nombre || String(val);
          break;
        case 'zona':
          display = this.zonasDisponibles.find(z => z.id === +val)?.nombre || String(val);
          break;
        case 'tipoSensor':
          display = this.tiposSensor.find(t => t.id === +val)?.nombre || String(val);
          break;
        case 'sortBy':
          const mapSort: Record<string,string> = {
            'nombre':'Nombre A→Z','-nombre':'Nombre Z→A',
            'fecha_instalacion':'Fecha ↑','-fecha_instalacion':'Fecha ↓'
          };
          display = mapSort[val] ?? 'Sin ordenar';
          break;
        default:
          display = String(val);
      }
      chips.push({ key, label: `${this.labelMap[key]}: ${display}` });
    }
    return chips;
  }

  removeFilter(key: string) {
    this.filterForm.patchValue({ [key]: '' });
    if (key === 'invernadero') {
      this.zonasDisponibles = [];
      this.filterForm.get('zona')!.disable({ emitEvent: false });
    }
    this.apply();
  }

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
