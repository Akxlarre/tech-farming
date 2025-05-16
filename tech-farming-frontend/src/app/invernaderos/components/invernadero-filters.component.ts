// src/app/invernaderos/components/invernadero-filters.component.ts
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

export interface InvernaderoFilter {
  estado: string;
  search: string;
}

@Component({
  selector: 'app-invernadero-filters',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div [formGroup]="filterForm" class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
      <!-- Estado -->
      <select
        formControlName="estado"
        aria-label="Filtrar por estado"
        class="select select-bordered rounded-xl shadow-sm transition focus:ring focus:ring-offset-2 focus:ring-green-500 w-full"
      >
        <option value="">Todos los estados</option>
        <option value="Activo">Activo</option>
        <option value="Inactivo">Inactivo</option>
        <option value="Mantenimiento">Mantenimiento</option>
      </select>

      <!-- Búsqueda -->
      <div class="relative">
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">🔍</span>
        <input
          type="text"
          formControlName="search"
          placeholder="Buscar por nombre"
          class="input input-bordered pl-10 rounded-xl shadow-sm w-full focus:ring focus:ring-offset-2 focus:ring-green-500"
        />
      </div>
    </div>
  `
})
export class InvernaderoFiltersComponent implements OnInit {
  @Output() filtersChange = new EventEmitter<InvernaderoFilter>();

  filterForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      estado: [''],
      search: ['']
    });

    this.filterForm.valueChanges.subscribe((vals: InvernaderoFilter) => {
      this.filtersChange.emit(vals);
    });
  }
}
