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
    <div *ngIf="!loading; else loadingTpl">
    <div class="p-6 bg-base-100 rounded-lg shadow-lg max-w-md w-full space-y-4">
      <h2 class="text-xl font-bold text-error">⚠️ Eliminar sensor</h2>
      <p>¿Estás seguro de que quieres eliminar el sensor <strong>{{ sensor.nombre }}</strong>?</p>
      <div class="flex justify-end space-x-2">
        <button class="btn btn-ghost" (click)="close.emit()" [disabled]="loading">Cancelar</button>
        <button class="btn btn-error" [disabled]="loading" (click)="onDelete()">Eliminar</button>
      </div>
    </div>
    </div>
    <ng-template #loadingTpl>
      <div class="p-6 text-center">
        <svg class="animate-spin w-8 h-8 text-error mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
        </svg>
      </div>
    </ng-template>
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
