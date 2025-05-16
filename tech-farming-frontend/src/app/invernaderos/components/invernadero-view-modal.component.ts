// src/app/invernaderos/components/invernadero-view-modal.component.ts
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
    <div class="modal-box max-w-lg">
      <h2 class="text-xl font-semibold mb-4">Detalle de Invernadero</h2>

      <ng-container *ngIf="inv$ | async as inv">
        <div class="space-y-2">
          <p><strong>Nombre:</strong> {{ inv.nombre }}</p>
          <p><strong>Descripción:</strong> {{ inv.descripcion || '—' }}</p>
          <p><strong>Estado:</strong>
            <span
              class="badge"
              [ngClass]="{
                'badge-success': inv.estado === 'Activo',
                'badge-warning': inv.estado === 'Inactivo',
                'badge-error': inv.estado === 'Mantenimiento'
              }"
            >{{ inv.estado }}</span>
          </p>
          <p><strong>Sensores Activos:</strong> {{ inv.sensoresActivos ?? 0 }}</p>
          <p><strong>Creado en:</strong> {{ inv.creado_en | date:'short' }}</p>

          <div *ngIf="inv.zonas?.length" class="mt-4">
            <h3 class="font-medium mb-2">Zonas Asociadas</h3>
            <ul class="list-disc list-inside space-y-1">
              <li *ngFor="let z of inv.zonas">
                <p><strong>{{ z.nombre }}</strong> – {{ z.descripcion || 'Sin descripción' }}</p>
              </li>
            </ul>
          </div>
        </div>
      </ng-container>

      <div class="modal-action justify-end">
        <button
          class="btn btn-ghost"
          (click)="modal.closeWithAnimation()"
        >Cerrar</button>
      </div>
    </div>
  `
})
export class InvernaderoViewModalComponent {
  public inv$: Observable<Invernadero | null>;

  constructor(public modal: InvernaderoModalService) {
    this.inv$ = this.modal.selectedInv$;
  }
}