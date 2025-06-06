// src/app/dashboard/components/kpi-card.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="card bg-base-100 shadow-sm border border-base-200 p-4 md:p-6 flex flex-col items-center justify-center hover:shadow-md transition-shadow duration-200 min-h-[8rem]"
      [ngClass]="customClasses"
      role="region"
      [attr.aria-label]="label"
      [attr.aria-describedby]="label + '-val'"
    >
      <!-- Ícono principal -->
      <div class="relative" [attr.title]="label">
        <i
          [class]="icon + ' text-2xl sm:text-3xl mb-1 text-accent'"
          aria-hidden="true"
        ></i>
      </div>

      <!-- Valor + Unidad -->
      <div class="flex items-baseline">
        <span
          id="{{ label }}-val"
          class="text-xl sm:text-2xl font-semibold truncate"
          [attr.title]="value"
        >
          {{ value }}
        </span>
        <span *ngIf="unit" class="text-base sm:text-lg font-medium ml-2">
          <abbr [attr.title]="unitTitle || unit">{{ unit }}</abbr>
        </span>
      </div>

      <!-- Label descriptivo -->
      <span class="text-xs sm:text-sm text-base-content/80 mt-1">
        {{ label }}
      </span>
    </div>
  `,
})
export class KpiCardComponent {
  /** Clase de icono (ej. 'ri-temperature-line') */
  @Input() icon!: string;

  /** Valor numérico o texto del KPI (ej. 24.5) */
  @Input() value!: string | number;

  /** Abreviatura de unidad (ej. '°C', '%', 'ppm'). Opcional. */
  @Input() unit?: string;

  /** Descripción completa de la unidad para lectores de pantalla. Opcional. */
  @Input() unitTitle?: string;

  /** Etiqueta del KPI (ej. 'Temperatura') */
  @Input() label!: string;

  /**
   * Clases adicionales (p. ej. 'border-error bg-error/10' para estado crítico).
   * Se concatenan con las clases base de la tarjeta.
   */
  @Input() customClasses?: string;
}
