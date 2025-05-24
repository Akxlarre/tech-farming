// src/app/shared/filtro-select.component.ts
import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }  from '@angular/forms';

@Component({
  selector: 'app-filtro-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <label class="block">
      <span class="block text-sm font-medium text-base-content mb-1">
        {{ label }}
      </span>
      <select
        class="select select-bordered w-full bg-base-100 text-base-content"
        [(ngModel)]="selectedId"
        (ngModelChange)="onSelect($event)"
      >
        <!-- Placeholder / “No especifica” -->
        <option *ngIf="allowUndefined" [ngValue]="undefined">
          — No especifica —
        </option>
        <!-- Opciones reales -->
        <option *ngFor="let o of options" [ngValue]="o.id">
          {{ o.label }}
        </option>
      </select>
    </label>
  `
})
export class FiltroSelectComponent implements OnChanges {
  /** Texto que aparece encima */
  @Input() label!: string;
  /** Opciones a mostrar */
  @Input() options: Array<{ id: number; label: string }> = [];
  /** Id actualmente seleccionado */
  @Input() selectedId?: number;
  /** Emite el nuevo id (número) o undefined al cambiar */
  @Input() allowUndefined = true;            // ← por defecto true
  @Output() selectionChange = new EventEmitter<number|undefined>();

  ngOnChanges(changes: SimpleChanges) {
    if (changes['options'] && this.selectedId != null) {
      const exists = this.options.some(o => o.id === this.selectedId);
      if (!exists) {
        this.selectedId = undefined;
        this.selectionChange.emit(undefined);
      }
    }
  }

  onSelect(value: number|undefined) {
    this.selectionChange.emit(value);
  }
}
