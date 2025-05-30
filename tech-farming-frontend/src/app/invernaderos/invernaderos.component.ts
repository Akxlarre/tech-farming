import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Invernadero } from './models/invernadero.model';
import { InvernaderoService, InvernaderoFilters } from './invernaderos.service';
import { InvernaderoModalService } from './invernadero-modal.service';

import { InvernaderoModalWrapperComponent } from './components/invernadero-modal-wrapper.component';
import { InvernaderoHeaderComponent } from './components/invernadero-header.component';
import { InvernaderoFiltersComponent } from './components/invernadero-filters.component';
import { InvernaderoTableComponent } from './components/invernadero-table.component';
import { InvernaderoCardListComponent } from './components/invernadero-card-list.component';
import { InvernaderoViewModalComponent } from './components/invernadero-view-modal.component';
import { InvernaderoCreateModalComponent } from './components/invernadero-create-modal.component';
import { InvernaderoDeleteModalComponent } from './components/invernadero-delete-modal.component';
import { catchError, exhaustMap, of, tap, timer } from 'rxjs';
import { NotificationService } from '../shared/services/notification.service';

@Component({
  selector: 'app-invernaderos',
  standalone: true,
  imports: [
    CommonModule,
    InvernaderoHeaderComponent,
    InvernaderoFiltersComponent,
    InvernaderoTableComponent,
    InvernaderoCardListComponent,
    InvernaderoModalWrapperComponent,
    InvernaderoViewModalComponent,
    InvernaderoCreateModalComponent,
    InvernaderoDeleteModalComponent
  ],
  template: `
    <section class="space-y-6">
      <app-invernadero-header (create)="open('create')"></app-invernadero-header>
      <app-invernadero-filters (filtersChange)="onFiltersChange($event)"></app-invernadero-filters>

      <app-invernadero-table
        [invernaderos]="invernaderos"
        (viewInvernadero)="open('view', $event)"
        (deleteInvernadero)="open('delete', $event)">
      </app-invernadero-table>

      <div class="flex items-center justify-between p-6 bg-base-200 rounded-lg">
        <div class="text-sm text-base-content/70">
          Página {{currentPage}} de {{totalPages}} · {{totalCount}} invernaderos
        </div>
        <div class="flex items-center gap-2">
          <button class="btn btn-sm btn-outline rounded-full"
                  (click)="goToPage(1)" [disabled]="currentPage === 1">«</button>
          <button class="btn btn-sm btn-outline rounded-full"
                  (click)="goToPage(currentPage - 1)" [disabled]="currentPage === 1">‹</button>

          <ng-container *ngFor="let item of paginationItems">
            <ng-container *ngIf="item !== '…'; else dots">
              <button class="btn btn-sm rounded-full"
                      [ngClass]="{
                        'btn-success text-base-content border-success': item === currentPage,
                        'btn-outline': item !== currentPage
                      }"
                      (click)="goToPage(+item)" [disabled]="item === currentPage">
                {{ item }}
              </button>
            </ng-container>
            <ng-template #dots>
              <span class="px-2 text-base-content/60 select-none">…</span>
            </ng-template>
          </ng-container>

          <button class="btn btn-sm btn-outline rounded-full"
                  (click)="goToPage(currentPage + 1)" [disabled]="currentPage === totalPages">›</button>
          <button class="btn btn-sm btn-outline rounded-full"
                  (click)="goToPage(totalPages)" [disabled]="currentPage === totalPages">»</button>
        </div>
      </div>

      <ng-container *ngIf="modalType">
        <app-invernadero-modal-wrapper>
          <ng-container [ngSwitch]="modalType">
            <app-invernadero-view-modal *ngSwitchCase="'view'"></app-invernadero-view-modal>
            <app-invernadero-create-modal
              *ngSwitchCase="'create'"
              (close)="modal.closeWithAnimation()"
              (saved)="onInvernaderoGuardado($event)"
            ></app-invernadero-create-modal>
            <app-invernadero-delete-modal *ngSwitchCase="'delete'"></app-invernadero-delete-modal>
          </ng-container>
        </app-invernadero-modal-wrapper>
      </ng-container>
    </section>
  `
})
export class InvernaderosComponent implements OnInit {
  invernaderos: Invernadero[] = [];
  totalCount = 0;
  pageSize = 8;
  currentPage = 1;
  selectedInv: Invernadero | null = null;
  appliedFilters: InvernaderoFilters = {};
  modalType: 'view' | 'create' | 'delete' | 'edit' | null = null;

  constructor(
    private svc: InvernaderoService,
    public modal: InvernaderoModalService,
    private notify: NotificationService
  ) {}

  ngOnInit() {
    this.modal.modalType$.subscribe(t => this.modalType = t);
    this.loadPage(1);
    timer(0, 10000).pipe(
      exhaustMap(() =>
        this.svc.getEstadosAlerta(this.currentPage, this.pageSize).pipe(
          catchError(() => of([]))
        )
      ),
      tap(estados => {
        const idsActuales = this.invernaderos.map(i => i.id);
        const idsRecibidos = estados.map(e => e.id);
        const cambio = idsActuales.length !== idsRecibidos.length ||
                       !idsRecibidos.every(id => idsActuales.includes(id));
        if (cambio) {
          this.loadPage(this.currentPage);
        } else {
          estados.forEach(est => {
            const inv = this.invernaderos.find(i => i.id === est.id);
            if (inv) inv.estado = est.estado || 'Sin alertas';
          });
        }
      })
    ).subscribe();
  }

  onFiltersChange(f: InvernaderoFilters) {
    this.appliedFilters = f;
    this.loadPage(1);
  }

  goToPage(p: number) {
    if (p < 1 || p > this.totalPages) return;
    this.loadPage(p);
  }

  private loadPage(page: number) {
    this.currentPage = page;
    this.svc.getInvernaderosPage(page, this.pageSize, this.appliedFilters)
      .subscribe({
        next: resp => {
          this.invernaderos = resp.data;
          this.totalCount = resp.total;
        },
        error: err => console.error('Error al cargar invernaderos', err)
      });
  }

  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize);
  }

  get paginationItems(): Array<number | string> {
    const total = this.totalPages;
    const cur = this.currentPage;
    const delta = 1;
    const pages: Array<number | string> = [];
    let last = 0;

    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= cur - delta && i <= cur + delta)) {
        if (last && i - last > 1) pages.push('…');
        pages.push(i);
        last = i;
      }
    }
    return pages;
  }

  open(type: 'view' | 'create' | 'delete', inv: Invernadero | null = null) {
    this.selectedInv = inv;
    this.modal.openModal(type, inv);
  }

  onInvernaderoGuardado(data: any) {
    this.svc.crearInvernadero(data).subscribe({
      next: creado => {
        this.modal.closeWithAnimation();
        this.loadPage(1);
      },
      error: err => {
        console.error('Error al crear invernadero:', err);
        alert('❌ No se pudo crear el invernadero');
      }
    });
  }
}

