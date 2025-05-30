// src/app/shared/filtro-date-range.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule }                          from '@angular/common';

@Component({
  selector: 'app-filtro-date-range',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex gap-4">
      <!-- Desde -->
      <label class="flex-1 block">
        <span class="block text-sm font-medium text-base-content mb-1">Desde</span>
        <input
          type="date"
          class="input input-bordered w-full bg-base-100 text-base-content"
          [value]="formatDate(from)"
          (change)="onFromChange($event)"
        />
      </label>

      <!-- Hasta -->
      <label class="flex-1 block">
        <span class="block text-sm font-medium text-base-content mb-1">Hasta</span>
        <input
          type="date"
          class="input input-bordered w-full bg-base-100 text-base-content"
          [value]="formatDate(to)"
          (change)="onToChange($event)"
        />
      </label>
    </div>
  `
})
export class FiltroDateRangeComponent {
  /** Fecha de inicio */
  @Input() from!: Date;
  /** Fecha de fin */
  @Input() to!: Date;
  /** Emite el par {from,to} cuando alguno cambia */
  @Output() rangeChange = new EventEmitter<{ from: Date; to: Date }>();

  /** Convierte Date a 'YYYY-MM-DD' para el input */
  formatDate(d: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  }

  onFromChange(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.from = new Date(val);
    this.emitRange();
  }

  onToChange(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.to = new Date(val);
    this.emitRange();
  }

  private emitRange() {
    this.rangeChange.emit({ from: this.from, to: this.to });
  }
}