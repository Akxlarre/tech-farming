import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExportOptionsComponent } from '../../shared/components/export-options.component';

@Component({
  selector: 'app-invernadero-header',
  standalone: true,
  imports: [CommonModule, ExportOptionsComponent],
  template: `
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 my-5 mx-6">
      <!-- Título -->
      <h1 class="text-4xl font-bold text-success tracking-tight">
        Inventario de Invernaderos
      </h1>

      <!-- Acciones -->
      <div class="flex flex-col sm:flex-row gap-2">
        <app-export-options (exportar)="exportar.emit($event)"></app-export-options>

        <!-- Botón Añadir Invernadero -->
        <button
          *ngIf="puedeCrear"
          class="btn bg-transparent border-success text-base-content hover:bg-success hover:text-success-content"
          (click)="create.emit()"
          aria-label="Añadir nuevo invernadero"
        >
          <svg
            class="w-5 h-5 stroke-base-content hover:stroke-success-content"
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
          <span class="text-base-content group-hover:text-success-content">
            Añadir Invernadero
          </span>
        </button>
      </div>
    </div>
  `,
})
export class InvernaderoHeaderComponent {
  @Input() puedeCrear = false;
  @Output() create     = new EventEmitter<void>();
  @Output() exportar = new EventEmitter<'pdf' | 'excel' | 'csv'>();
}