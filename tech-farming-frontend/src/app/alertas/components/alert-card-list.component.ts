import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Alerta } from '../models/index';

@Component({
  selector: 'app-alert-card-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="md:hidden space-y-4 p-6">
      <ng-container *ngIf="!loading; else skeletons">
        <div *ngFor="let a of alertas" class="card bg-base-100 shadow p-4 space-y-2">
          <div class="flex justify-between items-start">
            <span class="text-sm">{{ a.fecha_hora | date:'short' }}</span>
            <span class="badge badge-sm" [ngClass]="{ 'badge-warning': a.nivel === 'Advertencia', 'badge-error': a.nivel === 'Crítico' }">
              {{ a.nivel }}
            </span>
          </div>
          <div class="text-sm">{{ a.sensor_nombre || '-' }} · {{ a.tipo_parametro || '-' }}</div>
          <p class="text-sm">{{ a.mensaje }}</p>
          <div *ngIf="a.resuelta_por" class="text-xs text-base-content/60">Resuelta por {{ a.resuelta_por }}</div>
          <div class="text-right" *ngIf="showResolver">
            <button class="btn btn-outline btn-sm" (click)="resolver.emit(a)" [disabled]="resolviendoId === a.id">
              <ng-container *ngIf="resolviendoId === a.id; else txt"> <span class="loading loading-spinner loading-sm"></span> </ng-container>
              <ng-template #txt>Resolver</ng-template>
            </button>
          </div>
        </div>
      </ng-container>
      <ng-template #skeletons>
        <div *ngFor="let _ of skeletonArray" class="card bg-base-100 shadow p-4 animate-pulse space-y-2">
          <div class="h-4 w-24 bg-base-300 rounded"></div>
          <div class="h-4 w-20 bg-base-300 rounded"></div>
          <div class="h-4 w-32 bg-base-300 rounded"></div>
        </div>
      </ng-template>
    </div>
  `,
})
export class AlertCardListComponent {
  @Input() alertas: Alerta[] = [];
  @Input() resolviendoId: number | null = null;
  @Input() loading = false;
  @Input() rowCount = 5;
  @Input() showResolver = false;
  @Output() resolver = new EventEmitter<Alerta>();

  get skeletonArray() {
    return Array.from({ length: this.rowCount });
  }
}
