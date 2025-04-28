
// src/app/zonas/zonas.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZonaHeaderComponent } from './components/invernadero-header/invernadero-header.component';
import { ZonaModalService, ZonaModalType } from '../invernaderos/components/invernaderoModalService/invernadero-modal.service';
import { ZonaModalWrapperComponent } from './components/invernadero-modal-wrapper/invernadero-modal-wrapper.component';
import { ZonaCreateModalComponent } from './components/invernadero-create-modal/invernadero-create-modal.component';
import { ZonaFiltersComponent } from './components/invernadero-filters/invernadero-filters.component';
import { ZoneTableComponent } from './components/invernadero-table/invernadero-table.component';
import { ZoneCardListComponent } from './components/invernadero-card-list/invernadero-card-list.component';

@Component({
  selector: 'app-zonas',
  standalone: true,
  imports: [
    CommonModule,
    ZonaHeaderComponent,
    ZonaModalWrapperComponent,
    ZonaCreateModalComponent,
    ZonaFiltersComponent,
    ZoneTableComponent,
    ZoneCardListComponent
  ],
  templateUrl: './invernaderos.component.html',
  styleUrls: ['./invernaderos.component.css']
})
export class ZonasComponent implements OnInit {
  modalType: ZonaModalType = null;
  selectedZona: any = null;

  zonas = [
    {
      id: 'Z001',
      nombre: 'Zona Norte',
      sensoresActivos: 4,
      estado: 'Normal',
      fechaCreacion: '2024-04-10'
    },
    {
      id: 'Z002',
      nombre: 'Zona Hidropónica',
      sensoresActivos: 2,
      estado: 'Crítico',
      fechaCreacion: '2024-03-15'
    }
  ];

  constructor(public zonaModalService: ZonaModalService) {}

  ngOnInit(): void {
    this.zonaModalService.modalType$.subscribe(tipo => this.modalType = tipo);
    this.zonaModalService.selectedZona$.subscribe(zona => this.selectedZona = zona);
  }
}
