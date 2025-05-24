import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sensor-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <!-- Título -->
      <h1 class="text-3xl font-bold text-base-content tracking-tight">
        Inventario de Sensores
      </h1>

      <!-- Acciones -->
      <div class="flex flex-col sm:flex-row gap-2">
        <!-- Exportar PDF -->
        <button
          class="btn btn-outline btn-neutral"
          aria-label="Exportar listado de sensores a PDF"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 3v12m0 0l-3-3m3 3l3-3M20 21H4a2 2 0 01-2-2V5a2 2 0
                 012-2h8l8 8v10a2 2 0 01-2 2z" />
          </svg>
          <span class="ml-2">Exportar PDF</span>
        </button>

        <!-- Añadir Sensor -->
        <button
          class="btn btn-primary"
          (click)="create.emit()"
          aria-label="Añadir nuevo sensor"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 4v16m8-8H4" />
          </svg>
          <span class="ml-2">Añadir Sensor</span>
        </button>
      </div>
    </div>
  `,
})
export class SensorHeaderComponent {
  @Output() create = new EventEmitter<void>();
}
