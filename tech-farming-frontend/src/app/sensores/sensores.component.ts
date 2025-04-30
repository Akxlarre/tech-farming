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
import { SensoresService, UltimaLectura } from '../services/sensores.service';

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

  sensores: Sensor[] = [
    {
      id: 1,
      invernadero_id: 101,
      nombre: 'Sensor Temp 1',
      tipo_sensor_id: 1,
      estado: 'Activo'
    },
    {
      id: 2,
      invernadero_id: 102,
      nombre: 'Sensor Temp 2',
      tipo_sensor_id: 2,
      estado: 'Advertencia'
    },
  ];

  ultimasLecturas: UltimaLectura[] = [];  // ✅ Propiedad declarada correctamente

  constructor(
    public modalService: SensorModalService,
    private sensoresService: SensoresService
  ) {}

  ngOnInit(): void {
    this.modalService.modalType$.subscribe(type => this.modalType = type);
    this.modalService.selectedSensor$.subscribe(sensor => this.selectedSensor = sensor);

    this.sensoresService.getUltimasLecturas().subscribe(data => {
      this.ultimasLecturas = data;
      console.log('📡 Lecturas desde backend:', data);
    });
  }
}
