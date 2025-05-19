import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { Invernadero } from '../models/invernadero.model';
import { InvernaderoModalService } from '../invernadero-modal.service';

@Component({
  selector: 'app-invernadero-view-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <h2 class="text-2xl font-bold text-secondary mb-6">Detalle de Invernadero</h2>
      <ng-container *ngIf="inv$ | async as inv">
        <!-- Información principal en grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-base-content">
          <div>
            <span class="font-semibold">Nombre:</span>
            <span class="ml-1">{{ inv.nombre }}</span>
          </div>
          <div>
            <span class="font-semibold">Estado:</span>
            <span class="ml-1">
              <span
                class="badge badge-md"
                [ngClass]="{
                  'badge-success': inv.estado === 'Activo',
                  'badge-warning': inv.estado === 'Inactivo',
                  'badge-error': inv.estado === 'Mantenimiento'
                }"
              >{{ inv.estado }}</span>
            </span>
          </div>
          <div class="md:col-span-2">
            <span class="font-semibold">Descripción:</span>
            <p class="mt-1">{{ inv.descripcion || '—' }}</p>
          </div>
          <div>
            <span class="font-semibold">Sensores Activos:</span>
            <span class="ml-1">{{ inv.sensoresActivos ?? 0 }}</span>
          </div>
          <div>
            <span class="font-semibold">Creado en:</span>
            <span class="ml-1">{{ inv.creado_en | date:'short' }}</span>
          </div>
        </div>

        <!-- Zonas asociadas como badges/cards -->
        <div *ngIf="inv.zonas?.length" class="mb-6">
          <h3 class="text-lg font-semibold text-base-content mb-3">Zonas Asociadas</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-auto">
            <div *ngFor="let z of inv.zonas" class="card bg-base-200 p-4">
              <h4 class="font-medium">{{ z.nombre }}</h4>
              <p class="mt-1 text-sm text-base-content/80">{{ z.descripcion || 'Sin descripción' }}</p>
            </div>
          </div>
        </div>
      </ng-container>

      <!-- Acción de cerrar -->
      <div class="flex justify-end">
        <button class="btn btn-accent" (click)="modal.closeWithAnimation()">Cerrar</button>
      </div>
    </div>
  `
})
export class InvernaderoViewModalComponent {
  inv$: Observable<Invernadero | null>;
  constructor(public modal: InvernaderoModalService) {
    this.inv$ = this.modal.selectedInv$;
  }
}