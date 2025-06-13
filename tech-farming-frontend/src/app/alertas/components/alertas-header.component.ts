import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-alertas-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 my-5 mx-6">
      <!-- Título -->
      <h1 class="text-4xl font-bold text-success tracking-tight">
        Gestión de Alertas
      </h1>

      <!-- Botón Configurar Notificaciones -->
      <div class="flex flex-col sm:flex-row gap-2">
        <button
          class="btn bg-transparent border-success text-base-content hover:bg-success hover:text-success-content"
          (click)="configurarNotificaciones.emit()"
          aria-label="Abrir configuración de notificaciones"
        >
          <span>Configurar Notificaciones</span>
        </button>

        <!-- Botón Configurar Umbrales -->
        <button
          class="btn bg-transparent border-success text-base-content hover:bg-success hover:text-success-content"
          (click)="configurar.emit()"
          aria-label="Abrir configuración de umbrales"
        >
          <span>Configurar Umbrales</span>
        </button>
      </div>
    </div>
  `
})
export class AlertsHeaderComponent {
  @Output() configurar = new EventEmitter<void>();
  @Output() configurarNotificaciones = new EventEmitter<void>();
}
