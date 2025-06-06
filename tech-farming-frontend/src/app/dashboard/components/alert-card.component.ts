// src/app/dashboard/components/alert-card.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-alert-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      tabindex="0"
      class="flex items-start rounded-lg p-4 shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1"
      [ngClass]="{
        'border border-error bg-error/10 hover:bg-error/20 dark:bg-error/20 dark:hover:bg-error/30 focus:ring-error focus:ring-offset-base-100': nivel === 'critica',
        'border border-warning bg-warning/10 hover:bg-warning/20 dark:bg-warning/20 dark:hover:bg-warning/30 focus:ring-warning focus:ring-offset-base-100': nivel === 'advertencia'
      }"
      role="alert"
      aria-live="polite"
      [attr.aria-label]="'Alerta ' + (nivel === 'critica' ? 'Crítica' : 'Advertencia')"
    >
      <!-- SVG para 'critica' -->
      <svg
        *ngIf="nivel === 'critica'"
        class="w-6 h-6 text-error mr-3 flex-shrink-0"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path
          fill-rule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-9.707a1 1 0 10-1.414-1.414L8.586 8.586 7.293 7.293a1 1 0 10-1.414 1.414L7.172 10l-1.293 1.293a1 1 0 001.414 1.414L8.586 11.414l1.293 1.293a1 1 0 001.414-1.414L9.414 10l1.293-1.293z"
          clip-rule="evenodd"
        />
      </svg>

      <!-- SVG para 'advertencia' -->
      <svg
        *ngIf="nivel === 'advertencia'"
        class="w-6 h-6 text-warning mr-3 flex-shrink-0"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path
          d="M8.257 3.099c.366-.772 1.42-.772 1.786 0l6.518 13.773C16.778 17.61 16.12 18.5 15.186 
             18.5H4.814c-.934 0-1.592-.89-1.375-1.628L8.257 3.1zM11 13a1 1 0 10-2 
             0 1 1 0 002 0zm-1-2a.75.75 0 01-.75-.75V6.75a.75.75 0 011.5 0v3.5A.75.75 0 0110 
             11z"
        />
      </svg>

      <div class="flex-grow">
        <p
          class="font-semibold"
          [ngClass]="{
            'text-error': nivel === 'critica',
            'text-base-content': nivel === 'advertencia'
          }"
        >
          {{ mensaje }}
        </p>
        <p class="text-sm text-base-content/60">
          {{ fecha | date:'HH:mm' }} · {{ zona }}
        </p>
      </div>
      <button
        *ngIf="showResolve"
        class="btn btn-outline btn-xs ml-2"
        (click)="resolver.emit()"
        [disabled]="resolviendo"
        aria-label="Resolver alerta"
      >
        <ng-container *ngIf="resolviendo; else texto">
          <span class="loading loading-spinner loading-sm"></span>
        </ng-container>
        <ng-template #texto>Resolver</ng-template>
      </button>
    </div>
  `,
})
export class AlertCardComponent {
  @Input() nivel!: 'critica' | 'advertencia';
  @Input() mensaje!: string;
  @Input() fecha!: Date;
  @Input() zona!: string;
  @Input() showResolve = false;
  @Input() resolviendo = false;
  @Output() resolver = new EventEmitter<void>();
}
