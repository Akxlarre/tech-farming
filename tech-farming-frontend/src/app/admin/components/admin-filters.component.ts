import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="px-6 mb-4">
      <input
        type="text"
        [(ngModel)]="busqueda"
        (input)="buscar.emit(busqueda)"
        placeholder="Buscar por nombre o apellido..."
        class="input input-bordered w-full max-w-sm"
      />
    </div>
  `,
})
export class AdminFiltersComponent {
  @Output() buscar = new EventEmitter<string>();
  busqueda = '';
}
