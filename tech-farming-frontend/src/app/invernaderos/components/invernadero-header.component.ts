import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-invernadero-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <!-- Título -->
      <h1 class="text-3xl font-bold text-base-content tracking-tight">
        Vista de Invernaderos
      </h1>

      <!-- Acciones -->
      <div class="flex flex-col sm:flex-row gap-2">
        <!-- Exportar PDF -->
        <button
          class="btn btn-outline btn-neutral"
          aria-label="Exportar listado de invernaderos a PDF"
        >
           <span class="ml-2">Exportar PDF</span>
        </button>

        <!-- Añadir Invernadero -->
        <button
          class="btn btn-primary"
          (click)="create.emit()"
          aria-label="Añadir nuevo invernadero"
        >
          <span class="ml-2">Añadir Invernadero</span>
        </button>
      </div>
    </div>
  `
})
export class InvernaderoHeaderComponent {
  @Output() create = new EventEmitter<void>();
}