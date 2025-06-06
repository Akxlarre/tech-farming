// src/app/historial/components/historial-header.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-historial-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 my-5 mx-6">
      <!-- Título dinámico -->
      <h1 class="text-4xl font-bold text-success tracking-tight">
        {{ title }}
      </h1>

      <!-- Acción de exportar CSV -->
      <div class="flex flex-col sm:flex-row gap-2">
        <button
          class="btn bg-transparent border-success text-base-content hover:bg-success hover:text-success-content flex items-center gap-2"
          (click)="exportCsv.emit()"
          aria-label="Exportar historial a CSV"
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
          <span class="text-base-content group-hover:text-success-content">
            Exportar CSV
          </span>
        </button>
      </div>
    </div>
  `
})
export class HistorialHeaderComponent {
  /** Texto del título */
  @Input() title = 'Historial';
  /** Emite cuando el usuario clickea exportar */
  @Output() exportCsv = new EventEmitter<void>();
}
