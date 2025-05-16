// src/app/invernaderos/components/invernadero-header.component.ts
import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-invernadero-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
      <h1 class="text-3xl font-bold text-gray-800 tracking-tight">
        🌿 Vista de Invernaderos
      </h1>

      <div class="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
        <!-- Botón Exportar -->
        <button
          class="btn border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 hover:shadow transition-all duration-200 w-full sm:w-auto"
        >
          📤 <span class="ml-2">Exportar PDF</span>
        </button>

        <!-- Botón Crear Invernadero -->
        <button
          (click)="create.emit()"
          class="btn bg-green-600 hover:bg-green-700 text-white font-semibold shadow-md transition duration-200 w-full sm:w-auto px-4 py-2 rounded-xl flex items-center justify-center"
        >
          ➕ <span class="ml-2">Añadir Invernadero</span>
        </button>
      </div>
    </div>
  `
})
export class InvernaderoHeaderComponent {
  @Output() create = new EventEmitter<void>();
}
