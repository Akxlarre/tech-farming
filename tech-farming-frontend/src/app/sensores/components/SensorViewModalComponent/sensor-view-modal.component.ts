import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SensorModalService } from '../../components/SensorModalService/sensor-modal.service';
import { Sensor } from '../../models/sensor.model';

@Component({
  selector: 'app-sensor-view-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sensor-view-modal.component.html',
  styleUrls: ['./sensor-view-modal.component.css']
})
export class SensorViewModalComponent implements OnInit {
  sensor!: Sensor;

  constructor(public modalService: SensorModalService) {}

  ngOnInit(): void {
    const selected = this.modalService.selectedSensor$.getValue();
    if (selected) this.sensor = selected;
  }

  cerrar(): void {
    this.modalService.closeWithAnimation();
  }
}