// src/app/invernaderos/invernaderos.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, timer, of } from 'rxjs';
import { exhaustMap, catchError, tap, takeUntil } from 'rxjs/operators';

import { Invernadero } from './models/invernadero.model';
import {
  InvernaderoService,
  InvernaderoFilters
} from './invernaderos.service';
import { InvernaderoModalService } from './invernadero-modal.service';

import { NotificationService } from '../shared/services/notification.service';

/* Componentes “genéricos” ya existentes */
import { InvernaderoModalWrapperComponent } from './components/invernadero-modal-wrapper.component';
import { InvernaderoHeaderComponent } from './components/invernadero-header.component';
import { InvernaderoFiltersComponent } from './components/invernadero-filters.component';
import { InvernaderoTableComponent } from './components/invernadero-table.component';
import { InvernaderoCardListComponent } from './components/invernadero-card-list.component';
import { InvernaderoCreateModalComponent } from './components/invernadero-create-modal.component';
import { DeleteInvernaderoWithSummaryComponent } from './components/delete-invernadero-with-summary.component';
import { InvernaderoEditInlineZonasComponent } from './components/invernadero-edit-inline-zonas.component';
import { ViewInvernaderoComponent } from './components/view-invernadero.component';

@Component({
  selector: 'app-invernaderos',
  standalone: true,
  imports: [
    CommonModule,

    /* Header, filtros, tabla/lista, modales ya existentes */
    InvernaderoHeaderComponent,
    InvernaderoFiltersComponent,
    InvernaderoTableComponent,
    InvernaderoCardListComponent,
    InvernaderoModalWrapperComponent,
    InvernaderoCreateModalComponent,

    /* En lugar de InvernaderoDeleteModalComponent, ahora usamos DeleteInvernaderoWithSummaryComponent */
    DeleteInvernaderoWithSummaryComponent,

    /* NUEVO: Componente de edición */
    InvernaderoEditInlineZonasComponent,
    /* Componente de vista detallada */
    ViewInvernaderoComponent
  ],
  template: `
    <section class="space-y-6">

      <!-- HEADER + BOTON “Crear” -->
      <app-invernadero-header (create)="open('create')"></app-invernadero-header>

      <!-- FILTROS -->
      <app-invernadero-filters (filtersChange)="onFiltersChange($event)"></app-invernadero-filters>

      <!-- TABLA (desktop) / LISTA (mobile) -->
      <app-invernadero-table
        [invernaderos]="invernaderos"
        (viewInvernadero)="open('view',   $event)"
        (editInvernadero)="open('edit',   $event)"
        (deleteInvernadero)="open('delete',$event)"
      ></app-invernadero-table>

      <app-invernadero-card-list
        *ngIf="invernaderos.length && isMobile"
        [invernaderos]="invernaderos"
      ></app-invernadero-card-list>

      <!-- PAGINACION -->
      <div class="flex items-center justify-between p-6 bg-base-200 rounded-lg">
        <div class="text-sm text-base-content/70">
          Página {{ currentPage }} de {{ totalPages }} · {{ totalCount }} invernaderos
        </div>
        <div class="flex items-center gap-2">
          <!-- Botones «‹‹ ‹ Página › ››» -->
          <button
            class="btn btn-sm btn-outline rounded-full"
            (click)="goToPage(1)"
            [disabled]="currentPage === 1"
          >
            «
          </button>
          <button
            class="btn btn-sm btn-outline rounded-full"
            (click)="goToPage(currentPage - 1)"
            [disabled]="currentPage === 1"
          >
            ‹
          </button>

          <ng-container *ngFor="let item of paginationItems">
            <ng-container *ngIf="item !== '…'; else dots">
              <button
                class="btn btn-sm rounded-full"
                [ngClass]="{
                  'btn-success text-base-content border-success': item === currentPage,
                  'btn-outline': item !== currentPage
                }"
                (click)="goToPage(+item)"
                [disabled]="item === currentPage"
              >
                {{ item }}
              </button>
            </ng-container>
            <ng-template #dots>
              <span class="px-2 text-base-content/60 select-none">…</span>
            </ng-template>
          </ng-container>

          <button
            class="btn btn-sm btn-outline rounded-full"
            (click)="goToPage(currentPage + 1)"
            [disabled]="currentPage === totalPages"
          >
            ›
          </button>
          <button
            class="btn btn-sm btn-outline rounded-full"
            (click)="goToPage(totalPages)"
            [disabled]="currentPage === totalPages"
          >
            »
          </button>
        </div>
      </div>

      <!-- MODALES -->
      <ng-container *ngIf="modalType">
        <app-invernadero-modal-wrapper>
          <ng-container [ngSwitch]="modalType">
            <!-- VIEW (nueva sección) -->
            <view-invernadero
              *ngSwitchCase="'view'"
              [invernaderoId]="selectedInv!.id"
              (close)="modal.closeWithAnimation()"
            ></view-invernadero>

            <!-- CREAR INVERNADERO -->
            <app-invernadero-create-modal
              *ngSwitchCase="'create'"
              (close)="modal.closeWithAnimation()"
              (saved)="onInvernaderoGuardado($event)"
            ></app-invernadero-create-modal>

            <!-- EDITAR INVERNADERO -->
            <app-invernadero-edit-inline-zonas
              *ngSwitchCase="'edit'"
              [invernaderoId]="selectedInv?.id!"
              (saved)="onInvernaderoEditado($event)"
            ></app-invernadero-edit-inline-zonas>

            <!-- ELIMINAR INVERNADERO (con resumen) -->
            <delete-invernadero-with-summary
              *ngSwitchCase="'delete'"
              [invernaderoId]="selectedInv?.id!"
              (confirmDelete)="onConfirmDelete($event)"
              (cancel)="modal.closeWithAnimation()"
            ></delete-invernadero-with-summary>
          </ng-container>
        </app-invernadero-modal-wrapper>
      </ng-container>
    </section>
  `
})
export class InvernaderosComponent implements OnInit, OnDestroy {
  invernaderos: Invernadero[] = [];
  totalCount = 0;
  pageSize = 8;
  currentPage = 1;
  selectedInv: Invernadero | null = null;
  appliedFilters: InvernaderoFilters = {};
  modalType: 'view' | 'create' | 'delete' | 'edit' | null = null;

  /** Detectar si estamos en móvil para mostrar la lista en tarjetas */
  get isMobile(): boolean {
    return window.innerWidth < 768;
  }

  /** Usado para cancelar el polling cuando el componente se destruye */
  private destroy$ = new Subject<void>();

  constructor(
    private svc: InvernaderoService,
    public modal: InvernaderoModalService,
    private notify: NotificationService
  ) {}

  ngOnInit() {
    // 1) Suscribirnos al tipo de modal para saber cuál abrir/cerrar
    this.modal.modalType$.pipe(takeUntil(this.destroy$)).subscribe(t => this.modalType = t);

    // 2) Cargar la primera página de resultados
    this.loadPage(1);

    // 3) Cada 10s actualizar “estados de alerta” para refrescar badges en la lista
    timer(0, 10000).pipe(
      exhaustMap(() =>
        this.svc.getEstadosAlerta(this.currentPage, this.pageSize).pipe(
          catchError(() => of([]))
        )
      ),
      tap(estados => {
        const idsActuales = this.invernaderos.map(i => i.id);
        const idsRecibidos = estados.map((e: any) => e.id);
        const cambio =
          idsActuales.length !== idsRecibidos.length ||
          !idsRecibidos.every(id => idsActuales.includes(id));

        if (cambio) {
          // Si cambió la página, recargamos todo
          this.loadPage(this.currentPage);
        } else {
          // Solo actualizamos el “estado” en cada invernadero visible
          estados.forEach((est: any) => {
            const inv = this.invernaderos.find(i => i.id === est.id);
            if (inv) inv.estado = est.estado || 'Sin alertas';
          });
        }
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  /**
   * Manejador del cambio de filtros (search / sortBy).
   */
  onFiltersChange(f: InvernaderoFilters) {
    this.appliedFilters = f;
    this.loadPage(1);
  }

  /**
   * Navegar a página “p” (1-based). Validamos límites.
   */
  goToPage(p: number) {
    if (p < 1 || p > this.totalPages) return;
    this.loadPage(p);
  }

  /**
   * Realiza la petición con paginación + filtros. 
   * Actualiza invernaderos[] y totalCount.
   */
  private loadPage(page: number) {
    this.currentPage = page;
    this.svc.getInvernaderosPage(page, this.pageSize, this.appliedFilters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: resp => {
          this.invernaderos = resp.data;
          this.totalCount = resp.total;
        },
        error: err => console.error('Error al cargar invernaderos', err)
      });
  }

  /**
   * Número total de páginas, redondeando hacia arriba.
   */
  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize);
  }

  /**
   * Construye un array de “items” para paginación con puntos suspensivos.
   */
  get paginationItems(): Array<number | string> {
    const total = this.totalPages;
    const cur = this.currentPage;
    const delta = 1;
    const pages: Array<number | string> = [];
    let last = 0;

    for (let i = 1; i <= total; i++) {
      if (
        i === 1 ||
        i === total ||
        (i >= cur - delta && i <= cur + delta)
      ) {
        if (last && i - last > 1) {
          pages.push('…');
        }
        pages.push(i);
        last = i;
      }
    }
    return pages;
  }

  /**
   * Abre el modal correspondiente:
   * - view:   Mostrar detalle
   * - create: Formulario nueva
   * - edit:   Formulario de edición inline 
   * - delete: Confirmación con resumen de borrado
   */
  open(type: 'view' | 'create' | 'delete' | 'edit', inv: Invernadero | null = null) {
    this.selectedInv = inv;
    this.modal.openModal(type, inv);
  }

  /**
   * Callback cuando el modal “Crear” emite un “saved”.
   * Simplemente recargamos la página 1 y cerramos el modal.
   */
  onInvernaderoGuardado(data: any) {
    this.svc.crearInvernadero(data).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.modal.closeWithAnimation();
        this.loadPage(1);
      },
      error: err => console.error('Error al crear invernadero:', err)
    });
  }

  /**
   * Callback cuando el modal “Editar” emite un “saved”. 
   * El niño ya hizo el PUT, así que cerramos el modal y recargamos la página.
   */
  onInvernaderoEditado(_evento: any) {
    this.modal.closeWithAnimation();
    this.loadPage(this.currentPage);
  }

  /**
   * Recibimos el ID desde el componente DeleteInvernaderoWithSummaryComponent
   * para efectuar el DELETE y luego recargar.
   */
  onConfirmDelete(invernaderoId: number) {
    this.svc.eliminarInvernadero(invernaderoId).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.notify.success('Invernadero eliminado correctamente.');
        this.modal.closeWithAnimation();
        // Si borramos el único ítem de la última página, navegamos a página anterior
        if (this.invernaderos.length === 1 && this.currentPage > 1) {
          this.loadPage(this.currentPage - 1);
        } else {
          this.loadPage(this.currentPage);
        }
      },
      error: err => {
        console.error('Error al eliminar invernadero:', err);
        this.notify.error('No se pudo eliminar el invernadero.');
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
