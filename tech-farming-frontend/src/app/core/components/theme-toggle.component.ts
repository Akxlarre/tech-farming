// src/app/core/components/theme-toggle.component.ts
import {
    Component,
    ChangeDetectionStrategy,
    OnInit,
    OnDestroy,
    inject,
    PLATFORM_ID
  } from '@angular/core';
  import { CommonModule, isPlatformBrowser } from '@angular/common';
  import { ThemeService } from '../components/theme.service';
  import { Observable, Subscription } from 'rxjs';
  import {
    trigger,
    transition,
    style,
    animate,
    query,
    group,
  } from '@angular/animations';
  
  @Component({
    standalone: true,
    selector: 'app-theme-toggle',
    imports: [CommonModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
      <button
        (click)="themeService.toggle()"
        aria-label="Alternar tema"
        [@iconSwap]="theme$ | async"
        class="
            p-2
            rounded-full
            bg-transparent
            hover:bg-base-200 dark:hover:bg-base-300
            transition-colors duration-150
            active:scale-95
            focus:outline-none
        "
      >
        <div class="relative w-6 h-6">
          <!-- LUNA (modo claro) -->
          <svg
            *ngIf="(theme$ | async) === 'light'"
            class="moon absolute inset-0 w-full h-full text-black"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" />
          </svg>
  
          <!-- SOL (modo oscuro) -->
          <svg
            *ngIf="(theme$ | async) === 'dark'"
            class="sun absolute inset-0 w-full h-full text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1"  x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1"    y1="12" x2="3"    y2="12" />
            <line x1="21"   y1="12" x2="23"   y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        </div>
      </button>
    `,
    styles: [`
      /* Asegurar que no queden outlines o sombras residuales */
      button:focus,
      button:active {
        outline: none !important;
        box-shadow: none !important;
      }
    `],
    animations: [
      trigger('iconSwap', [
        transition('light => dark', [
          group([
            query('.moon', [
              animate(
                '200ms ease-in',
                style({ opacity: 0, transform: 'scale(0.5) rotate(90deg)' })
              )
            ], { optional: true }),
            query('.sun', [
              style({ opacity: 0, transform: 'scale(0.5) rotate(-90deg)' }),
              animate(
                '200ms 100ms ease-out',
                style({ opacity: 1, transform: 'scale(1) rotate(0deg)' })
              )
            ], { optional: true })
          ])
        ]),
        transition('dark => light', [
          group([
            query('.sun', [
              animate(
                '200ms ease-in',
                style({ opacity: 0, transform: 'scale(0.5) rotate(90deg)' })
              )
            ], { optional: true }),
            query('.moon', [
              style({ opacity: 0, transform: 'scale(0.5) rotate(-90deg)' }),
              animate(
                '200ms 100ms ease-out',
                style({ opacity: 1, transform: 'scale(1) rotate(0deg)' })
              )
            ], { optional: true })
          ])
        ]),
      ])
    ]
  })
  export class ThemeToggleComponent implements OnInit, OnDestroy {
    private platformId = inject(PLATFORM_ID);
    private themeSub!: Subscription;
    public themeService = inject(ThemeService);
    readonly theme$: Observable<'light' | 'dark'> = this.themeService.themeChanges;
  
    ngOnInit() {
      if (isPlatformBrowser(this.platformId)) {
        document.documentElement.setAttribute(
          'data-theme',
          this.themeService.current()
        );
        this.themeSub = this.theme$.subscribe(theme =>
          document.documentElement.setAttribute('data-theme', theme)
        );
      }
    }
  
    ngOnDestroy() {
      this.themeSub?.unsubscribe();
    }
  }
  