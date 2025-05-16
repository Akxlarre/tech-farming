import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SensorModalService } from '../SensorModalService/sensor-modal.service';
import { Sensor } from '../../models/sensor.model';

@Component({
    selector: 'app-sensor-delete-modal',
    imports: [CommonModule],
    templateUrl: './sensor-delete-modal.component.html',
    styleUrls: ['./sensor-delete-modal.component.css']
})
export class SensorDeleteModalComponent implements OnInit {
  sensor: Sensor | null = null;
  loading = false;

  constructor(public modalService: SensorModalService) {}

  ngOnInit(): void {
    this.sensor = this.modalService.selectedSensor$.getValue() ?? null;
  }

  confirmarEliminacion(): void {
    this.loading = true;

    setTimeout(() => {
      console.log('🗑️ Sensor eliminado:', this.sensor?.nombre);
      this.loading = false;
      this.modalService.closeModal();
    }, 1000);
  }

  cancelar(): void {
    this.modalService.closeModal();
  }
}
