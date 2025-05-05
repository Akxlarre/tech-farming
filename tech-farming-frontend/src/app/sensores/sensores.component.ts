// src/app/sensores/sensores.component.ts
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

  ultimasLecturas: UltimaLectura[] = [];

  sensores: Sensor[] = [
    { id: 1, invernadero_id: 101, nombre: 'Sensor Temp 1', tipo_sensor_id: 1, estado: 'Activo' },
    { id: 2, invernadero_id: 102, nombre: 'Sensor Temp 2', tipo_sensor_id: 2, estado: 'Advertencia' },
  ];

  constructor(
    public modalService: SensorModalService,
    private sensoresService: SensoresService
  ) {}

  ngOnInit(): void {
    // Suscripciones al modal
    this.modalService.modalType$.subscribe(type => this.modalType = type);
    this.modalService.selectedSensor$.subscribe(sensor => this.selectedSensor = sensor);

    // Carga de últimas lecturas desde InfluxDB
    this.sensoresService.getUltimasLecturas().subscribe(data => {
      this.ultimasLecturas = data;
      console.log('✅ Últimas lecturas recibidas:', data);

      this.sensores.forEach(sensor => {
        const lectura = data.find(l => l.sensor_id === sensor.id?.toString());
        if (lectura) {
          sensor.parametro = lectura.parametro || '';
          sensor.unidad    = lectura.valor;           // valor numérico medido
          sensor.timestamp = lectura.timestamp || '';
        }
      });
    });
  }

  /**
   * Abre el modal correspondiente con el sensor seleccionado.
   * Este método es invocado desde
   * <app-sensor-table> a través de (view), (edit) y (delete).
   */
  open(type: 'view' | 'edit' | 'delete' | 'create', sensor: Sensor): void {
    this.modalService.openModal(type, sensor);
  }
}
