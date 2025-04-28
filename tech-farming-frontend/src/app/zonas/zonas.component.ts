// src/app/zonas/zonas.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZonaHeaderComponent } from './components/zone-header/zona-header.component';
import { ZonaModalService, ZonaModalType } from './components/zonaModalService/zona-modal.service';
import { ZonaModalWrapperComponent } from './components/zona-modal-wrapper/zona-modal-wrapper.component';
import { ZonaCreateModalComponent } from './components/zone-create-modal/zona-create-modal.component';
import { ZonaFiltersComponent } from './components/zone-filters/zona-filters.component';
import { ZoneTableComponent } from './components/zona-table/zona-table.component';
import { ZoneCardListComponent } from './components/zona-card-list/zone-card-list.component';

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
  templateUrl: './zonas.component.html',
  styleUrls: ['./zonas.component.css']
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
