import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

export interface InvernaderoFilter {
  search: string;
  sortBy: string;
}

@Component({
  selector: 'app-invernadero-filters',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <!-- Cabecera con icono -->
    <div class="flex items-center gap-2 mb-4 px-6 text-basetext">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-basetext" fill="none"
           viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L14 
                 13.414V19a1 1 0 01-1.447.894l-4-2A1 1 0 018 
                 17v-3.586L3.293 6.707A1 1 0 013 6V4z" />
      </svg>
      <h3 class="text-lg font-medium">Filtros</h3>
    </div>

    <div class="bg-base-200 px-6 rounded-xl mb-6">
      <form [formGroup]="filterForm"
            (ngSubmit)="apply()"
            class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 items-end"
      >
        <!-- Buscar -->
        <div>
          <label class="label-basetext font-bold">Buscar</label>
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">🔍</span>
            <input
              type="text"
              formControlName="search"
              placeholder="Nombre del invernadero..."
              maxlength="30"
              class="input input-bordered pl-10 w-full text-sm min-w-0"
            />
          </div>
        </div>

        <!-- Ordenar -->
        <div>
          <label class="label-basetext font-bold">⇅ Ordenar por</label>
          <select formControlName="sortBy"
                  class="select select-bordered w-full text-sm min-w-0 truncate"
          >
            <option disabled value="">Sin ordenar</option>
            <option value="nombre">Nombre A→Z</option>
            <option value="-nombre">Nombre Z→A</option>
            <option value="creado_en">Fecha ↑</option>
            <option value="-creado_en">Fecha ↓</option>
            <option value="-zonasActivas">Más zonas</option>
            <option value="zonasActivas">Menos zonas</option>
          </select>
        </div>

        <!-- Botón Aplicar -->
        <div class="flex justify-end sm:justify-start">
          <button
            type="submit"
            class="btn btn-outline btn-sm h-10 w-full sm:w-auto border-success text-base-content hover:bg-success hover:text-base-content transition-colors duration-200"
          >
            Aplicar
          </button>
        </div>
      </form>

      <!-- Chips de filtros activos -->
      <div class="px-4 py-4">
        <div
          class="flex flex-wrap gap-2 items-center transition-opacity duration-200 min-h-[2.5rem]"
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
                  (click)="clearAll()">
            Limpiar todo
          </button>
        </div>
      </div>
    </div>
  `
})
export class InvernaderoFiltersComponent implements OnInit {
  @Output() filtersChange = new EventEmitter<InvernaderoFilter>();

  filterForm!: FormGroup;

  private labelMap: Record<string, string> = {
    search: 'Buscar',
    sortBy: 'Orden'
  };

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      search: [''],
      sortBy: ['']
    });
  }

  apply() {
    this.filtersChange.emit(this.filterForm.getRawValue());
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

      let display = val;
      if (key === 'sortBy') {
        const map: Record<string, string> = {
          'nombre': 'Nombre A→Z',
          '-nombre': 'Nombre Z→A',
          'creado_en': 'Fecha ↑',
          '-creado_en': 'Fecha ↓',
          '-zonasActivas': 'Más zonas',
          'zonasActivas': 'Menos zonas'
        };
        display = map[val] ?? val;
      }

      chips.push({ key, label: `${this.labelMap[key]}: ${display}` });
    }

    return chips;
  }

  removeFilter(key: string) {
    this.filterForm.patchValue({ [key]: '' });
    this.apply();
  }

  clearAll() {
    this.filterForm.reset({
      search: '',
      sortBy: ''
    });
    this.apply();
  }
}
