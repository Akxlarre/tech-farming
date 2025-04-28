import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZonaModalService } from '../invernaderoModalService/invernadero-modal.service';

@Component({
  selector: 'app-zona-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './invernadero--header.component.html',
  styleUrls: ['./invernadero--header.component.css']
})
export class ZonaHeaderComponent {
  constructor(private zonaModalService: ZonaModalService) {}

  abrirModalCrearZona() {
    this.zonaModalService.openModal('create', null);
  }
}