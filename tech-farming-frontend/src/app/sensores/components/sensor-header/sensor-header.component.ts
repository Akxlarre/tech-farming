import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SensorModalService } from '../SensorModalService/sensor-modal.service';

@Component({
  selector: 'app-sensor-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sensor-header.component.html',
  styleUrls: ['./sensor-header.component.css']
})
export class SensorHeaderComponent {
  constructor(private modalService: SensorModalService) {}

  abrirModalCrearSensor() {
    this.modalService.openModal('create', null); // null porque no hay sensor existente
  }
}
