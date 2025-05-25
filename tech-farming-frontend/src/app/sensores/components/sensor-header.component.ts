// src/app/sensores/components/sensor-header.component.ts
import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sensor-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 my-5 mx-6">
      <!-- Título -->
      <h1 class="text-4xl font-bold text-success tracking-tight">
        Inventario de Sensores
      </h1>

      <!-- Acciones -->
      <div class="flex flex-col sm:flex-row gap-2">
        <!-- Botón Exportar PDF -->
        <button
          class="btn bg-transparent border-success text-base-content hover:bg-success hover:text-success-content "
          (click)="exportPdf.emit()"
          aria-label="Exportar listado de sensores a PDF"
        >
          <svg
            class="w-5 h-5 stroke-base-content hover:stroke-success-content "
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 3v12m0 0l-3-3m3 3l3-3M20 21H4a2 2 0 01-2-2V5a2 2 0 012-2h8l8 8v10a2 2 0 01-2 2z"
            />
          </svg>
          <span class="text-base-content group-hover:text-success-content ">
            Exportar PDF
          </span>
        </button>

        <!-- Botón Añadir Sensor -->
        <button
          class="btn bg-transparent border-success text-base-content hover:bg-success hover:text-success-content"
          (click)="create.emit()"
          aria-label="Añadir nuevo sensor"
        >
          <svg
            class="w-5 h-5 stroke-base-content hover:stroke-success-content "
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span class="text-base-content group-hover:text-success-content ">
            Añadir Sensor
          </span>
        </button>
      </div>
    </div>
  `,
})
export class SensorHeaderComponent {
  @Output() create    = new EventEmitter<void>();
  @Output() exportPdf = new EventEmitter<void>();
}
