// src/app/dashboard/components/tabs-panel.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tabs-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      role="tablist"
      aria-label="Panel de pestañas"
      class="
        tabs 
        bg-base-100 dark:bg-base-800 
        border-b border-base-200 dark:border-base-700 
        px-4 pt-2 pb-0
      "
    >
      <!-- Pestaña “Alertas” -->
      <button
        id="tab-alertas-btn"
        role="tab"
        class="
          tab flex-1 text-center 
          py-2 
          text-sm font-medium 
          transition-colors duration-200 
          focus:outline-none focus:ring-2 focus:ring-success focus:ring-offset-1
        "
        [ngClass]="{
          'tab-active text-success bg-base-50 dark:bg-base-900': activeTab === 'alertas',
          'text-base-content/70 hover:text-base-content dark:text-base-content/50 dark:hover:text-base-content/80': activeTab !== 'alertas'
        }"
        [attr.aria-selected]="activeTab === 'alertas'"
        [attr.tabindex]="activeTab === 'alertas' ? 0 : -1"
        aria-controls="tab-alertas"
        (click)="onTabClick('alertas')"
        (keydown)="onKeyDown($event, 'alertas')"
      >
        Alertas
      </button>

      <!-- Pestaña “Predicciones” -->
      <button
        id="tab-predicciones-btn"
        role="tab"
        class="
          tab flex-1 text-center 
          py-2 
          text-sm font-medium 
          transition-colors duration-200 
          focus:outline-none focus:ring-2 focus:ring-success focus:ring-offset-1
        "
        [ngClass]="{
          'tab-active text-success bg-base-50 dark:bg-base-900': activeTab === 'predicciones',
          'text-base-content/70 hover:text-base-content dark:text-base-content/50 dark:hover:text-base-content/80': activeTab !== 'predicciones'
        }"
        [attr.aria-selected]="activeTab === 'predicciones'"
        [attr.tabindex]="activeTab === 'predicciones' ? 0 : -1"
        aria-controls="tab-predicciones"
        (click)="onTabClick('predicciones')"
        (keydown)="onKeyDown($event, 'predicciones')"
      >
        Predicciones
      </button>
    </div>
  `,
})
export class TabsPanelComponent {
  @Input() activeTab!: 'alertas' | 'predicciones';
  @Output() activeTabChange = new EventEmitter<'alertas' | 'predicciones'>();

  onTabClick(tab: 'alertas' | 'predicciones') {
    if (this.activeTab !== tab) {
      this.activeTabChange.emit(tab);
    }
  }

  onKeyDown(event: KeyboardEvent, tab: 'alertas' | 'predicciones' ) {
    const tabsOrder: Array<'alertas' | 'predicciones'> = [
      'alertas',
      'predicciones',
    ];
    const idx = tabsOrder.indexOf(tab);

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      const next = tabsOrder[(idx + 1) % tabsOrder.length];
      this.onTabClick(next);
      document.getElementById(`tab-${next}-btn`)?.focus();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      const prev = tabsOrder[(idx - 1 + tabsOrder.length) % tabsOrder.length];
      this.onTabClick(prev);
      document.getElementById(`tab-${prev}-btn`)?.focus();
    }
  }
}
