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
          <svg xmlns="http://www.w3.org/2000/svg"
               class="w-5 h-5 stroke-base-content hover:stroke-success-content"
               fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 12v8M8 16l4 4 4-4M8 12h8" />
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
