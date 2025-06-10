// src/app/sensores/components/sensor-delete-modal.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule }                           from '@angular/common';
import { FormsModule }                            from '@angular/forms';
import { SensoresService }                        from '../sensores.service';
import { Sensor }                                 from '../models/sensor.model';

@Component({
  selector: 'app-sensor-delete-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 bg-base-100 rounded-lg shadow-lg max-w-md w-full space-y-4">
      <h2 class="text-xl font-bold text-error">⚠️ Eliminar sensor</h2>
      <p>¿Estás seguro de que quieres eliminar el sensor <strong>{{ sensor.nombre }}</strong>?</p>
      <ng-container *ngIf="sensor.estado !== 'Inactivo'; else eliminarForm">
        <p class=" text-red-600">Para eliminar este sensor, debe estar en estado <strong>Inactivo</strong>.</p>
      </ng-container>

      <ng-template #eliminarForm>
        <p>Escribe <strong>"Eliminar {{ sensor.nombre }}"</strong> para confirmar:</p>
        <input
          type="text"
          class="input input-bordered w-full"
          [(ngModel)]="confirmText"
          placeholder="Escribe aquí para confirmar"
        />
      </ng-template>

      <div class="flex justify-end space-x-2">
        <button class="btn btn-ghost " (click)="close.emit()">Cancelar</button>

        <button
          *ngIf="sensor.estado === 'Inactivo'"
          class="btn btn-error"
          [disabled]="!canDelete || loading"
          (click)="onDelete()"
        >
          {{ loading ? 'Eliminando…' : 'Eliminar' }}
        </button>
      </div>
    </div>
  `
})
export class SensorDeleteModalComponent {
  @Input()  sensor!: Sensor;
  @Output() deleted = new EventEmitter<number>();  // emitirá el id
  @Output() close   = new EventEmitter<void>();

  confirmText = '';
  loading = false;

  constructor(private svc: SensoresService) {}

  get canDelete(): boolean {
    return (
      this.sensor.estado === 'Inactivo' &&
      this.confirmText.trim() === `Eliminar ${this.sensor.nombre}`
    );
  }

  onDelete() {
    if (this.loading) return;

    this.loading = true;
    this.svc.eliminarSensor(this.sensor.id).subscribe({
      next: () => this.deleted.emit(this.sensor.id),
      error: (err) => {
        this.loading = false;
        const msg =
          err?.error?.error ||
          '❌ No se pudo eliminar el sensor. Intenta nuevamente.';
        alert(msg);
      }
    });
  }
}
