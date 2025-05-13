// src/app/core/components/mobile-nav.component.ts
import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-mobile-nav',
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="navbar-center lg:hidden">
      <div class="dropdown">
        <label tabindex="0" class="btn btn-ghost p-2">
          <svg xmlns="http://www.w3.org/2000/svg"
               class="h-6 w-6"
               fill="none"
               viewBox="0 0 24 24"
               stroke="currentColor"
               stroke-width="2">
            <path stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </label>
        <ul tabindex="0"
            class="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52 animate-fade-in-down">
          <li *ngFor="let item of navItems">
            <a [routerLink]="item.path">{{ item.label }}</a>
          </li>
        </ul>
      </div>
    </div>
  `
})
export class MobileNavComponent {
  @Input() navItems!: { label: string; path: string }[];
}
