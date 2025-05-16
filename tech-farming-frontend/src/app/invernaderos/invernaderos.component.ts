// src/app/invernaderos/invernaderos.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Invernadero } from './models/invernadero.model';
import { InvernaderoService } from './invernaderos.service';
import { InvernaderoModalService } from './invernadero-modal.service';
import { InvernaderoModalWrapperComponent } from './components/invernadero-modal-wrapper.component';
import { InvernaderoHeaderComponent } from './components/invernadero-header.component';
import { InvernaderoFiltersComponent } from './components/invernadero-filters.component';
import { InvernaderoTableComponent } from './components/invernadero-table.component';
import { InvernaderoCardListComponent } from './components/invernadero-card-list.component';
import { InvernaderoViewModalComponent } from './components/invernadero-view-modal.component';
import { InvernaderoCreateEditModalComponent } from './components/invernadero-create-edit-modal.component';
import { InvernaderoDeleteModalComponent } from './components/invernadero-delete-modal.component';

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
    InvernaderoCreateEditModalComponent,
    InvernaderoDeleteModalComponent
  ],
  template: `
    <section class="min-h-screen px-4 sm:px-10 lg:px-16 space-y-8">
      <!-- Header con botón Crear -->
      <app-invernadero-header (create)="open('create')"></app-invernadero-header>

      <!-- Filtros -->
      <app-invernadero-filters (filtersChange)="onFiltersChange($event)"></app-invernadero-filters>

      <!-- Tabla para escritorio -->
      <app-invernadero-table
        [invernaderos]="filtered"
        (viewInvernadero)="open('view', $event)"
        (editInvernadero)="open('edit', $event)"
        (deleteInvernadero)="open('delete', $event)">
      </app-invernadero-table>

      <!-- Cards para móvil -->
      <app-invernadero-card-list
        [invernaderos]="filtered">
      </app-invernadero-card-list>

      <!-- Modales -->
      <ng-container *ngIf="modalType">
        <app-invernadero-modal-wrapper>
          <ng-container [ngSwitch]="modalType">
            <app-invernadero-view-modal   *ngSwitchCase="'view'"></app-invernadero-view-modal>
            <app-invernadero-create-edit-modal *ngSwitchCase="'create'"></app-invernadero-create-edit-modal>
            <app-invernadero-create-edit-modal *ngSwitchCase="'edit'"></app-invernadero-create-edit-modal>
            <app-invernadero-delete-modal *ngSwitchCase="'delete'"></app-invernadero-delete-modal>
          </ng-container>
        </app-invernadero-modal-wrapper>
      </ng-container>
    </section>
  `
})
export class InvernaderosComponent implements OnInit {
  invernaderos: Invernadero[] = [];
  filtered: Invernadero[] = [];
  modalType: 'view'|'create'|'edit'|'delete'|null = null;

  constructor(
    private svc: InvernaderoService,
    public  modal: InvernaderoModalService
  ) {}

  ngOnInit() {
    this.svc.getInvernaderos().subscribe({
      next: list => {
        this.invernaderos = list;
        this.filtered     = list;
      },
      error: err => console.error('Error al cargar invernaderos', err)
    });

    this.modal.modalType$.subscribe(t => this.modalType = t);
  }

  open(
    type: 'view'|'create'|'edit'|'delete',
    inv: Invernadero|null = null
  ) {
    this.modal.openModal(type, inv);
  }

  onFiltersChange(f: { estado: string; search: string }) {
    this.filtered = this.invernaderos.filter(inv =>
      (!f.estado || inv.estado === f.estado)
      && (!f.search || inv.nombre.toLowerCase().includes(f.search.toLowerCase()))
    );
  }
}
