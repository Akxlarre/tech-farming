import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-predicciones-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 my-5 mx-6">
      <h1 class="text-4xl font-bold text-success tracking-tight">Predicciones</h1>
      <div class="flex flex-col sm:flex-row gap-2">
        <button
          class="btn bg-transparent border-success text-base-content hover:bg-success hover:text-success-content flex items-center gap-2"
          (click)="reload.emit()"
          [disabled]="disabled"
          aria-label="Actualizar predicciones"
        >
          <i class="fas fa-sync-alt"></i>
          <span>Actualizar</span>
        </button>
      </div>
    </div>
  `
})
export class PrediccionesHeaderComponent {
  @Input() disabled = false;
  @Output() reload = new EventEmitter<void>();
}
