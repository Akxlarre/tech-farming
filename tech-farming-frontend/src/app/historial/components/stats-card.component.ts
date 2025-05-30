// src/app/historial/components/stats-card.component.ts
import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef
} from '@angular/core';
import { CommonModule }  from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-stats-card',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <mat-card
      class="stats-card relative overflow-hidden rounded-2xl shadow-xl p-6
             flex flex-col justify-between
             hover:shadow-2xl hover:-translate-y-1
             transition-transform transition-shadow duration-300"
    >
      <div
        class="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5"
        aria-hidden="true"
      ></div>

      <div class="relative z-10 flex flex-col items-center">
        <div
          #iconWrapper
          class="icon-wrapper mb-4"
          [class.glow]="iconVisible"
        >
          <ng-container [ngSwitch]="title">
            <i *ngSwitchCase="'Promedio'"        class="fas fa-chart-line"></i>
            <i *ngSwitchCase="'Mínimo'"          class="fas fa-arrow-down"></i>
            <i *ngSwitchCase="'Máximo'"          class="fas fa-arrow-up"></i>
            <i *ngSwitchCase="'Desvío estándar'" class="fas fa-chart-area"></i>
            <i *ngSwitchDefault                   class="fas fa-info-circle"></i>
          </ng-container>
        </div>

        <h3 class="text-base font-semibold tracking-wide text-base-content mb-2">
          {{ title }}
        </h3>

        <p
          #valueContainer
          class="value text-2xl font-extrabold text-base-content mb-4"
        >
          {{ displayValue | number:'1.2-2' }}
        </p>
      </div>

      <div class="relative z-10 h-6">
        <small *ngIf="subtext; else placeholder"
               class="subtext text-xs text-base-content flex items-center">
          <i class="far fa-calendar-alt mr-1"></i>
          <ng-container [ngSwitch]="title">
            <ng-container *ngSwitchCase="'Mínimo'">
              {{ subtext | date:'EEE, d MMMM':'':'es-ES' }}
            </ng-container>
            <ng-container *ngSwitchCase="'Máximo'">
              {{ subtext | date:'EEE, d MMMM':'':'es-ES' }}
            </ng-container>
            <ng-container *ngSwitchDefault>
              {{ subtext }}
            </ng-container>
          </ng-container>
        </small>
        <ng-template #placeholder>
          <span class="block opacity-0 text-xs">Placeholder</span>
        </ng-template>
      </div>
    </mat-card>
  `,
  styles: [`
    :host { display: block; }

    .stats-card {
      background-color: var(--p-base-100);
      border: 1px solid var(--p-primary);
      min-height: 14rem;
    }
    :host-context(.dark) .stats-card {
      border-color: var(--p-success);
    }

    .icon-wrapper {
      width: 2.5rem; height: 2.5rem;
      display: flex; align-items: center; justify-content: center;
      background: var(--p-base-200);
      border-radius: 9999px;
      color: var(--p-primary);
      font-size: 1.25rem;
      transition: box-shadow 0.3s;
    }
    .icon-wrapper.glow {
      animation: glowPulse 1.5s ease-in-out forwards;
    }
    @keyframes glowPulse {
      0%   { box-shadow: 0 0   0 var(--p-primary) }
      50%  { box-shadow: 0 0 10px var(--p-primary) }
      100% { box-shadow: 0 0   0 var(--p-primary) }
    }

    .value { /* heredado */ }
    .subtext { opacity: 0.6; }
  `]
})
export class StatsCardComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input() title!: string;
  @Input() value!: number;
  @Input() subtext?: string;

  displayValue = 0;
  private _rafId?: number;

  @ViewChild('iconWrapper', { static: true }) iconWrapper!: ElementRef;
  iconVisible = false;
  private _observer!: IntersectionObserver;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['value'] && !changes['value'].firstChange) {
      this.animateValue();
    }
  }

  ngAfterViewInit() {
    this.animateValue();
    this._observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        this.iconVisible = true;
        this._observer.disconnect();
      }
    }, { threshold: 0.5 });
    this._observer.observe(this.iconWrapper.nativeElement);
  }

  ngOnDestroy() {
    cancelAnimationFrame(this._rafId!);
    this._observer.disconnect();
  }

  private animateValue() {
    cancelAnimationFrame(this._rafId!);
    const start = 0, end = this.value, duration = 800, t0 = performance.now();
    const step = (t: number) => {
      const pct = Math.min((t - t0)/duration, 1);
      this.displayValue = start + (end - start)*pct;
      if (pct < 1) this._rafId = requestAnimationFrame(step);
    };
    this._rafId = requestAnimationFrame(step);
  }
}
