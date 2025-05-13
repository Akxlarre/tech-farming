// src/app/shared/filtro-select.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule }                            from '@angular/common';

@Component({
  selector: 'app-filtro-select',
  standalone: true,
  imports: [CommonModule],
  template: `
    <label class="block">
      <span class="block text-sm font-medium text-base-content mb-1">{{ label }}</span>
      <select
        class="select select-bordered w-full bg-base-100 text-base-content"
        [value]="selectedId"
        (change)="onChange($event)"
      >
        <option
          *ngFor="let o of options"
          [value]="o.id"
        >{{ o.label }}</option>
      </select>
    </label>
  `
})
export class FiltroSelectComponent {
  /** Texto que aparece encima */
  @Input() label!: string;
  /** Opciones a mostrar */
  @Input() options: Array<{ id: number; label: string }> = [];
  /** Id actualmente seleccionado */
  @Input() selectedId?: number;
  /** Emite el nuevo id (número) al cambiar */
  @Output() selectionChange = new EventEmitter<number>();

  onChange(event: Event) {
    const value = +(event.target as HTMLSelectElement).value;
    this.selectionChange.emit(value);
  }
}
