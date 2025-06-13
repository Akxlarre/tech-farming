// src/app/historial/components/historial-header.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExportOptionsComponent } from '../../shared/components/export-options.component';

@Component({
  selector: 'app-historial-header',
  standalone: true,
  imports: [CommonModule, ExportOptionsComponent],
  template: `
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 my-5 mx-6">
      <!-- Título dinámico -->
      <h1 class="text-4xl font-bold text-success tracking-tight">
        {{ title }}
      </h1>

      <!-- Acción de exportar -->
      <div class="flex flex-col sm:flex-row gap-2">
        <app-export-options (exportar)="exportar.emit($event)"></app-export-options>
      </div>
    </div>
  `
})
export class HistorialHeaderComponent {
  /** Texto del título */
  @Input() title = 'Historial';
  /** Emite cuando el usuario clickea exportar */
  @Output() exportar = new EventEmitter<'pdf' | 'excel' | 'csv'>();
}
