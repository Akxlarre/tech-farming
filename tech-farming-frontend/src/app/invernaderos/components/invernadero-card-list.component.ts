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
      <ng-container *ngIf="!loading; else cardSkeletons">
        <div *ngFor="let inv of pagedInvernaderos" class="card bg-base-100 shadow-lg p-6">
          <!-- Header -->
          <div class="flex justify-between items-center mb-2">
            <h3 class="text-lg font-semibold">{{ inv.nombre }}</h3>
            <span
              class="badge badge-sm"
              [ngClass]="{
                'badge-success': inv.estado === 'Activo',
                'badge-warning': inv.estado === 'Inactivo',
                'badge-error':   inv.estado === 'Mantenimiento',
                'badge-neutral': inv.estado === 'Sin sensores'
              }"
            >{{ inv.estado }}</span>
          </div>

          <!-- Detalles -->
          <ul class="text-sm space-y-1 mb-4">
            <li><strong>Zonas:</strong> {{ inv.zonasActivas ?? 0 }}</li>
            <li><strong>Sensores:</strong> {{ inv.sensoresActivos ?? 0 }}</li>
            <li><strong>Creado:</strong> {{ inv.creado_en | date:'short' }}</li>
          </ul>

          <!-- Acciones -->
          <div class="flex justify-end space-x-2">
            <button
              class="btn btn-sm btn-ghost btn-circle border border-transparent hover:border-success hover:bg-success/10 transition-colors duration-200"
              (click)="view(inv)"
              aria-label="Ver invernadero"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
            <button
              class="btn btn-sm btn-ghost btn-circle border border-transparent hover:border-success hover:bg-success/10 transition-colors duration-200"
              (click)="edit(inv)"
              aria-label="Editar invernadero"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-5m-7-5l7-7m0 0l-7 7m7-7H11" />
              </svg>
            </button>
            <button
              class="btn btn-sm btn-ghost btn-circle border border-transparent hover:border-error hover:bg-error/10 transition-colors duration-200"
              (click)="delete(inv)"
              aria-label="Eliminar invernadero"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a1 1 0 011-1h6a1 1 0 011 1v2" />
              </svg>
            </button>
          </div>
        </div>
      </ng-container>
      <ng-template #cardSkeletons>
        <div *ngFor="let _ of skeletonArray" class="card bg-base-100 shadow-lg p-6 animate-pulse space-y-4">
          <div class="h-4 w-32 rounded bg-base-300 skeleton"></div>
          <div class="h-4 w-24 rounded bg-base-300 skeleton"></div>
          <div class="h-4 w-20 rounded bg-base-300 skeleton"></div>
          <div class="h-4 w-28 rounded bg-base-300 skeleton"></div>
        </div>
      </ng-template>
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
  @Input() loading = false;
  @Input() rowCount = 3;

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

  get skeletonArray() {
    return Array.from({ length: this.rowCount });
  }
}
