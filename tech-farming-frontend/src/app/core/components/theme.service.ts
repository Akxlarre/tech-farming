import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject }               from 'rxjs';
import { isPlatformBrowser }            from '@angular/common';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private theme$ = new BehaviorSubject<'light'|'dark'>('light');
  readonly themeChanges = this.theme$.asObservable();
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    // Solo en navegador
    if (this.isBrowser) {
      const saved = localStorage.getItem('theme') as 'light'|'dark'|null;
      if (saved) {
        this.theme$.next(saved);
        document.documentElement.setAttribute('data-theme', saved);
      }
    }
  }

  toggle() {
    const next = this.theme$.value === 'light' ? 'dark' : 'light';
    this.theme$.next(next);

    if (this.isBrowser) {
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
    }
  }

  current() {
    return this.theme$.value;
  }
}
