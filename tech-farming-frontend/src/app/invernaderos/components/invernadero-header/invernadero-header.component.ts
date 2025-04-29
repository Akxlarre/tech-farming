import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZonaModalService } from '../invernaderoModalService/invernadero-modal.service';

@Component({
  selector: 'app-invernadero-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './invernadero-header.component.html',
  styleUrls: ['./invernadero-header.component.css']
})
export class InvernaderoHeaderComponent {

  constructor(private zonaModalService: ZonaModalService) {}

  abrirModalCrearInvernadero() {
    this.zonaModalService.openModal('create', null);
  }
}
