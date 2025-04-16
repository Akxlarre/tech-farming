// src/app/sensores/components/sensor-table/sensor-table.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SensorModalService } from '../SensorModalService/sensor-modal.service';

@Component({
  selector: 'app-sensor-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sensor-table.component.html'
})
export class SensorTableComponent {
  @Input() sensores: any[] = [];

  constructor(private modalService: SensorModalService) {}

  open(type: 'view' | 'edit' | 'delete', sensor: any) {
    console.log('Modal abierto:', type, sensor); // ✅ DEBUG
    this.modalService.openModal(type, sensor);
  }
}