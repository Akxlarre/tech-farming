import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZonaModalService } from '../zonaModalService/zona-modal.service';

@Component({
  selector: 'app-zona-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './zona-header.component.html',
  styleUrls: ['./zona-header.component.css']
})
export class ZonaHeaderComponent {
  constructor(private zonaModalService: ZonaModalService) {}

  abrirModalCrearZona() {
    this.zonaModalService.openModal('create', null);
  }
}