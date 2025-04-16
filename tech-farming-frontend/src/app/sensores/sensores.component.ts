import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SensorHeaderComponent } from './components/sensor-header/sensor-header.component';
import { SensorFiltersComponent } from './components/sensor-filters/sensor-filters.component';
import { SensorTableComponent } from './components/sensor-table/sensor-table.component';
import { SensorCardListComponent } from './components/sensor-card-list/sensor-card-list.component';
import { SensorModalWrapperComponent } from './components/sensor-modal-wrapper/sensor-modal-wrapper.component';
import { SensorModalService } from './components/SensorModalService/sensor-modal.service';
import { Sensor } from './models/sensor.model';
import { SensorEditModalComponent } from './components/SensorEditModalComponent/sensor-edit-modal.component';
import { SensorViewModalComponent } from './components/SensorViewModalComponent/sensor-view-modal.component';
import { SensorDeleteModalComponent } from './components/SensorDeleteModalComponent/sensor-delete-modal.component';
import { SensorCreateModalComponent } from './components/sensor-header/components/SensorCreateModalComponent/sensor-create-modal.component';

@Component({
  selector: 'app-sensores',
  standalone: true,
  imports: [
    CommonModule,
    SensorHeaderComponent,
    SensorFiltersComponent,
    SensorTableComponent,
    SensorCardListComponent,
    SensorModalWrapperComponent,
    SensorEditModalComponent,
    SensorDeleteModalComponent,
    SensorViewModalComponent,
    SensorCreateModalComponent,
  ],
  templateUrl: './sensores.component.html',
  styleUrls: ['./sensores.component.css'],
})
export class SensoresComponent implements OnInit {
  modalType: 'view' | 'edit' | 'delete' | 'create' | null = null;  
  selectedSensor: any = null;

  constructor(public modalService: SensorModalService) {}

  ngOnInit(): void {
    this.modalService.modalType$.subscribe(type => this.modalType = type);
    console.log('modalType recibido en SensoresComponent:', this.modalType); // ✅ DEBUG
    this.modalService.selectedSensor$.subscribe(sensor => this.selectedSensor = sensor);
  }

  sensores: Sensor[] = [
    {
      id: 'S001',
      nombre: 'Sensor Temp 1',
      tipo: 'Temperatura',
      icono: '🌡️',
      zona: 'Zona Norte',
      unidad: '°C',
      estado: 'Activo',
      lectura: '22°C - 10:00'
    },
    {
      id: 'S002',
      nombre: 'Sensor Temp 2',
      tipo: 'Temperatura',
      icono: '🌡️',
      zona: 'Zona Sur',
      unidad: '°C',
      estado: 'Advertencia',
      lectura: '21°C - 10:05'
    },
  ]
}