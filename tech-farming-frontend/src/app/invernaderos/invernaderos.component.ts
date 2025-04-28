// src/app/invernaderos/invernaderos.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvernaderoHeaderComponent } from './components/invernadero-header/invernadero-header.component';
import { InvernaderoModalService, InvernaderoModalType } from './components/invernaderoModalService/invernadero-modal.service';
import { InvernaderoModalWrapperComponent } from './components/invernadero-modal-wrapper/invernadero-modal-wrapper.component';
import { InvernaderoCreateModalComponent } from './components/invernadero-create-modal/invernadero-create-modal.component';
// ⚠️ Agrega más componentes cuando los tengas listos:
// import { InvernaderoCreateModalComponent } from './components/invernadero-create-modal/invernadero-create-modal.component';
// import { InvernaderoCardListComponent } from './components/invernadero-card-list/invernadero-card-list.component';

@Component({
  selector: 'app-invernaderos',
  standalone: true,
  imports: [
    CommonModule,
    InvernaderoHeaderComponent,
    InvernaderoModalWrapperComponent,
    InvernaderoCreateModalComponent,
    // InvernaderoCardListComponent
  ],
  templateUrl: './invernaderos.component.html',
  styleUrls: ['./invernaderos.component.css']
})
export class InvernaderosComponent implements OnInit {
  modalType: InvernaderoModalType = null;
  selectedInvernadero: any = null;

  constructor(public invernaderoModalService: InvernaderoModalService) {}

  ngOnInit(): void {
    this.invernaderoModalService.modalType$.subscribe(tipo => this.modalType = tipo);
    this.invernaderoModalService.selectedInvernadero$.subscribe(invernadero => this.selectedInvernadero = invernadero);
  }
}
