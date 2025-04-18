// src/app/zonas/zonas.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZonaHeaderComponent } from './components/zone-header/zona-header.component';
import { ZonaModalService, ZonaModalType } from './components/zonaModalService/zona-modal.service';
import { ZonaModalWrapperComponent } from './components/zona-modal-wrapper/zona-modal-wrapper.component';
import { ZonaCreateModalComponent } from './components/zone-create-modal/zona-create-modal.component';
// ⚠️ Agrega más componentes cuando los tengas listos:
// import { ZonaCreateModalComponent } from './components/zona-create-modal/zona-create-modal.component';
// import { ZonaCardListComponent } from './components/zona-card-list/zona-card-list.component';

@Component({
  selector: 'app-zonas',
  standalone: true,
  imports: [
    CommonModule,
    ZonaHeaderComponent,
    ZonaModalWrapperComponent,
    ZonaCreateModalComponent,
    // ZonaCardListComponent
  ],
  templateUrl: './zonas.component.html',
  styleUrls: ['./zonas.component.css']
})
export class ZonasComponent implements OnInit {
  modalType: ZonaModalType = null;
  selectedZona: any = null;

  constructor(public zonaModalService: ZonaModalService) {}

  ngOnInit(): void {
    this.zonaModalService.modalType$.subscribe(tipo => this.modalType = tipo);
    this.zonaModalService.selectedZona$.subscribe(zona => this.selectedZona = zona);
  }
}
