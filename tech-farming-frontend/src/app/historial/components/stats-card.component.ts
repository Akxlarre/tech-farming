// historial/components/stats-card.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { MatCardModule }     from '@angular/material/card';

@Component({
  selector: 'app-stats-card',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <mat-card class="stats-card relative overflow-hidden rounded-2xl shadow-xl p-6 flex flex-col justify-between">
      <!-- Degradado de fondo -->
      <div
        class="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5"
        aria-hidden="true">
      </div>

      <div class="relative z-10 flex flex-col items-center">
        <!-- Icono -->
        <div class="icon-wrapper mb-4">
          <ng-container [ngSwitch]="title">
            <i *ngSwitchCase="'Promedio'"        class="fas fa-chart-line"></i>
            <i *ngSwitchCase="'Mínimo'"          class="fas fa-arrow-down"></i>
            <i *ngSwitchCase="'Máximo'"          class="fas fa-arrow-up"></i>
            <i *ngSwitchCase="'Desvío estándar'" class="fas fa-chart-area"></i>
            <i *ngSwitchDefault                   class="fas fa-info-circle"></i>
          </ng-container>
        </div>

        <!-- Título -->
        <h3 class="text-base font-semibold tracking-wide text-base-content mb-2">
          {{ title }}
        </h3>

        <!-- Valor -->
        <p class="value text-2xl font-extrabold text-primary-content mb-4">
          {{ value }}
        </p>
      </div>

      <!-- Subtexto: siempre ocupa espacio fijo aunque esté vacío -->
      <div class="relative z-10 h-6">
        <small *ngIf="subtext; else placeholder" class="subtext text-xs text-base-content">
          {{ subtext }}
        </small>
        <ng-template #placeholder>
          <!-- placeholder invisible para reservar espacio -->
          <span class="block opacity-0 text-xs">Placeholder</span>
        </ng-template>
      </div>
    </mat-card>
  `,
  styles: [`
    :host { display: block; }

    .stats-card {
      background-color: var(--p-base-100);
      border: 1px solid var(--p-base-200);
      /* altura mínima para uniformar todas las cards */
      min-height: 14rem;
    }

    .shadow-xl {
      box-shadow:
        0 20px 25px -5px rgba(0,0,0,0.1),
        0 10px 10px -5px rgba(0,0,0,0.04);
    }

    .icon-wrapper {
      width: 2.5rem;
      height: 2.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--p-base-200);
      border-radius: 9999px;
      color: var(--p-primary);
      font-size: 1.25rem;
    }

    .value {
      color: var(--p-primary);
    }

    .subtext {
      opacity: 0.6;
    }
  `]
})
export class StatsCardComponent {
  @Input() title!: string;
  @Input() value!: number;
  @Input() subtext?: string;
}
