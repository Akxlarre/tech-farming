// src/app/core/components/app-logo.component.ts
import {
    Component,
    ChangeDetectionStrategy,
    inject,
    PLATFORM_ID
  } from '@angular/core';
  import { CommonModule, isPlatformBrowser } from '@angular/common';
  import { RouterModule } from '@angular/router';
  import { ThemeService } from '../components/theme.service';
  import { map } from 'rxjs/operators';
  import { Observable } from 'rxjs';
  
  @Component({
    selector: 'app-logo',
    imports: [CommonModule, RouterModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
      <a routerLink="/" class="flex items-center gap-2 sm:gap-3 md:gap-4">
        <!-- Imagen responsiva -->
        <img
          [src]="logoSrc$ | async"
          alt="Tech Farming logo"
          class="
            logo-img
            w-6 h-6       /* xs: 24×24 */
            sm:w-8 sm:h-8 /* sm: 32×32 */
            md:w-10 md:h-10 /* md: 40×40 */
            lg:w-12 lg:h-12 /* lg+: 48×48 */
            transition-all
          "
        />
        <!-- Texto responsivo -->
        <span
          class="
            logo-text
            text-base      /* xs */
            sm:text-lg     /* sm */
            md:text-xl     /* md */
            lg:text-2xl    /* lg+ */
            font-semibold
          "
        >
          Tech Farm<span class="sensor-i">i</span>ng
        </span>
      </a>
    `,
    styles: [`
      :host {
        display: block;
        --brand-green: #174C3C;
      }
  
      .logo-img {
        filter: brightness(0) saturate(100%) invert(16%) sepia(68%)
                saturate(373%) hue-rotate(86deg) brightness(90%) contrast(88%);
      }
  
      .logo-text {
        color: var(--brand-green);
        line-height: 1;
        position: relative;
      }
  
      .sensor-i {
        position: relative;
        display: inline-block;
        vertical-align: middle;
      }
  
      /* Arcos Wi-Fi sobre la ‘i’ */
      .sensor-i::before,
      .sensor-i::after,
      .sensor-i span {
        content: '';
        position: absolute;
        bottom: 100%;
        left: 50%;
        transform-origin: bottom center;
        border-radius: 50% 50% 0 0;
        border-left: none;
        border-right: none;
        opacity: 0;
      }
      .sensor-i::before {
        width: 0.3em; height: 0.15em;
        border-top: 2px solid var(--brand-green);
        animation: wave1 2.5s infinite ease-out;
        transform: translate(-50%, -0.05em);
        z-index: 3;
      }
      .sensor-i::after {
        width: 0.5em; height: 0.25em;
        border-top: 1.8px solid var(--brand-green);
        animation: wave2 2.5s infinite ease-out 0.6s;
        transform: translate(-50%, -0.08em);
        z-index: 2;
      }
      .sensor-i span {
        width: 0.7em; height: 0.35em;
        border-top: 1.5px solid var(--brand-green);
        animation: wave3 2.5s infinite ease-out 1.2s;
        transform: translate(-50%, -0.11em);
        z-index: 1;
      }
      @keyframes wave1 {
        0%   { opacity: 0.8; transform: translate(-50%, -0.05em) scaleX(0.5); }
        50%  { opacity: 0;   transform: translate(-50%, -0.05em) scaleX(1.2); }
        100% { opacity: 0;   transform: translate(-50%, -0.05em) scaleX(0.5); }
      }
      @keyframes wave2 {
        0%   { opacity: 0.6; transform: translate(-50%, -0.08em) scaleX(0.6); }
        50%  { opacity: 0;   transform: translate(-50%, -0.08em) scaleX(1.3); }
        100% { opacity: 0;   transform: translate(-50%, -0.08em) scaleX(0.6); }
      }
      @keyframes wave3 {
        0%   { opacity: 0.4; transform: translate(-50%, -0.11em) scaleX(0.7); }
        50%  { opacity: 0;   transform: translate(-50%, -0.11em) scaleX(1.4); }
        100% { opacity: 0;   transform: translate(-50%, -0.11em) scaleX(0.7); }
      }
    `]
})
  export class AppLogoComponent {
    private themeService = inject(ThemeService);
    private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  
    readonly logoSrc$: Observable<string> = this.themeService.themeChanges.pipe(
      map(t => t === 'light'
        ? '/assets/img/hoja-logo-light.png'
        : '/assets/img/hoja-logo-dark.png'
      )
    );
  
    constructor() {
      if (this.isBrowser) {
        document.documentElement.setAttribute(
          'data-theme',
          this.themeService.current()
        );
      }
    }
  }
  