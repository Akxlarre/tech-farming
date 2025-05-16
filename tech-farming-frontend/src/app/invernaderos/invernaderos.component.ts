// src/app/invernaderos/invernaderos.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvernaderoHeaderComponent } from './components/invernadero-header/invernadero-header.component';
import { InvernaderoModalService, InvernaderoModalType } from './components/invernaderoModalService/invernadero-modal.service';
import { InvernaderoModalWrapperComponent } from './components/invernadero-modal-wrapper/invernadero-modal-wrapper.component';
import { InvernaderoCreateModalComponent } from './components/invernadero-create-modal/invernadero-create-modal.component';
import { InvernaderoFiltersComponent } from './components/invernadero-filters/invernadero-filters.component';
import { InvernaderoTableComponent } from './components/invernadero-table/invernadero-table.component';
import { InvernaderoCardListComponent } from './components/invernadero-card-list/invernadero-card-list.component';

@Component({
    selector: 'app-invernaderos',
    imports: [
        CommonModule,
        InvernaderoHeaderComponent,
        InvernaderoModalWrapperComponent,
        InvernaderoCreateModalComponent,
        InvernaderoFiltersComponent,
        InvernaderoTableComponent,
        InvernaderoCardListComponent
    ],
    templateUrl: './invernaderos.component.html',
    styleUrls: ['./invernaderos.component.css']
})
export class InvernaderosComponent implements OnInit {
  modalType: InvernaderoModalType = null;
  selectedInvernadero: any = null;

  invernaderos = [
    {
      id: 'I001',
      nombre: 'Invernadero Norte',
      sensoresActivos: 4,
      estado: 'Normal',
      fechaCreacion: '2024-04-10'
    },
    {
      id: 'I002',
      nombre: 'Invernadero Hidropónico',
      sensoresActivos: 2,
      estado: 'Crítico',
      fechaCreacion: '2024-03-15'
    }
  ];

  constructor(public invernaderoModalService: InvernaderoModalService) {}

  ngOnInit(): void {
    this.invernaderoModalService.modalType$.subscribe(tipo => this.modalType = tipo);
    this.invernaderoModalService.selectedInvernadero$.subscribe(invernadero => this.selectedInvernadero = invernadero);
  }
}
