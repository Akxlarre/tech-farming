import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SensorModalService } from '../SensorModalService/sensor-modal.service';

interface Sensor {
  id: string;
  nombre: string;
  tipo: string;
  icono: string;
  zona: string;
  unidad: string;
  estado: string;
  lectura: string;
}


@Component({
  selector: 'app-sensor-card-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sensor-card-list.component.html',
  styleUrls: ['./sensor-card-list.component.css']
})
export class SensorCardListComponent {
  @Input() sensores: Sensor[] = [];

  constructor(private modalService: SensorModalService) {}

  ver(sensor: Sensor) {
    this.modalService.openModal('view', sensor);
  }

  editar(sensor: Sensor) {
    this.modalService.openModal('edit', sensor);
  }

  eliminar(sensor: Sensor) {
    this.modalService.openModal('delete', sensor);
  }
}
