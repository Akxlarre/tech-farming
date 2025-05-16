// src/app/invernaderos/components/invernadero-card-list.component.ts
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule, ViewportScroller } from '@angular/common';
import { InvernaderoModalService } from '../invernadero-modal.service';
import { Invernadero } from '../models/invernadero.model';

@Component({
  selector: 'app-invernadero-card-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Tarjetas móviles -->
    <div class="grid gap-4 md:hidden">
      <div *ngFor="let inv of pagedInvernaderos" class="card p-4 space-y-2 bg-white rounded-lg shadow">
        <h2 class="font-bold text-lg">{{ inv.nombre }}</h2>
        <p><strong>Sensores Activos:</strong> {{ inv.sensoresActivos ?? 0 }}</p>
        <p>
          <strong>Estado:</strong>
          <span [ngClass]="{
            'badge badge-success': inv.estado === 'Activo',
            'badge badge-warning': inv.estado === 'Inactivo',
            'badge badge-error': inv.estado === 'Mantenimiento'
          }">{{ inv.estado }}</span>
        </p>
        <p><strong>Creado:</strong> {{ inv.creado_en | date:'short' }}</p>
        <div class="flex gap-2 mt-2">
          <button class="btn btn-sm btn-outline" (click)="view(inv)">👁️ Ver</button>
          <button class="btn btn-sm btn-outline" (click)="edit(inv)">✏️ Editar</button>
          <button class="btn btn-sm btn-error text-white" (click)="delete(inv)">🗑️ Eliminar</button>
        </div>
      </div>
    </div>

    <!-- Paginación móvil -->
    <div class="flex justify-center gap-2 py-4 md:hidden" *ngIf="totalPages > 1">
      <button
        class="btn btn-sm btn-outline"
        (click)="setPage(page - 1)"
        [disabled]="page === 1"
      >‹</button>
      <ng-container *ngFor="let p of pages">
        <button
          class="btn btn-sm"
          [ngClass]="{ 'btn-active': page === p, 'btn-outline': page !== p }"
          (click)="setPage(p)"
        >{{ p }}</button>
      </ng-container>
      <button
        class="btn btn-sm btn-outline"
        (click)="setPage(page + 1)"
        [disabled]="page === totalPages"
      >›</button>
    </div>
  `,
  styles: [`:host { display: block; }`]
})
export class InvernaderoCardListComponent implements OnChanges {
  @Input() invernaderos: Invernadero[] = [];

  page = 1;
  pageSize = 10;
  pagedInvernaderos: Invernadero[] = [];
  pages: number[] = [];

  constructor(
    private modal: InvernaderoModalService,
    private viewport: ViewportScroller
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.buildPagination();
  }

  private buildPagination(): void {
    const total = this.invernaderos.length;
    this.pages = Array.from(
      { length: Math.ceil(total / this.pageSize) },
      (_, i) => i + 1
    );
    this.setPage(this.page);
  }

  get totalPages(): number {
    return Math.ceil(this.invernaderos.length / this.pageSize);
  }

  setPage(n: number): void {
    if (n < 1 || n > this.totalPages) return;
    this.page = n;
    const start = (n - 1) * this.pageSize;
    this.pagedInvernaderos = this.invernaderos.slice(start, start + this.pageSize);
    this.viewport.scrollToPosition([0, 0]);
  }

  view(inv: Invernadero) {
    this.modal.openModal('view', inv);
  }
  edit(inv: Invernadero) {
    this.modal.openModal('edit', inv);
  }
  delete(inv: Invernadero) {
    this.modal.openModal('delete', inv);
  }
}
