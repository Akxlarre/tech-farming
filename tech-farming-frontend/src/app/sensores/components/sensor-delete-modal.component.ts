// src/app/sensores/components/sensor-delete-modal.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule }                           from '@angular/common';
import { SensoresService }                       from '../sensores.service';
import { Sensor }                                from '../models/sensor.model';

@Component({
  selector: 'app-sensor-delete-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 bg-base-100 rounded-lg shadow-lg max-w-md w-full space-y-4">
      <h2 class="text-xl font-bold text-error">⚠️ Eliminar sensor</h2>
      <p>¿Estás seguro de que quieres eliminar el sensor <strong>{{ sensor.nombre }}</strong>?</p>
      <div class="flex justify-end space-x-2">
        <button class="btn btn-ghost " (click)="close.emit()">Cancelar</button>
        <button
          class="btn btn-error"
          [disabled]="loading"
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

  loading = false;

  constructor(private svc: SensoresService) {}

  onDelete() {
    if (this.loading) return;
    this.loading = true;
    this.svc.eliminarSensor(this.sensor.id).subscribe({
      next: () => this.deleted.emit(this.sensor.id),
      error: () => {
        this.loading = false;
        alert('❌ No se pudo eliminar.');
      }
    });
  }
}
