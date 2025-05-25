// src/app/core/components/desktop-nav.component.ts
import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-desktop-nav',
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="flex-1 hidden lg:flex justify-center">
      <ul class="flex space-x-6">
        <li *ngFor="let item of navItems" class="relative">
          <a [routerLink]="item.path"
             class="px-1 py-2 transition-colors"
             [ngClass]="{
               'text-success border-b-2 border-success': isActive(item.path),
               'hover:text-success': !isActive(item.path)
             }">
            {{ item.label }}
          </a>
        </li>
      </ul>
    </nav>
  `
})
export class DesktopNavComponent {
  @Input() navItems!: { label: string; path: string }[];

  constructor(private router: Router) {}

  isActive(path: string): boolean {
    return this.router.url.includes(path);
  }
}
