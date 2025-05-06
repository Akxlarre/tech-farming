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
import { InvernaderoService } from '../invernaderos/invernaderos.service';
import { Invernadero } from '../invernaderos/models/invernadero.model';
import { TipoSensorService } from './tipos_sensor.service';
import { TipoSensor } from './models/tipos_sensor.model';

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
  modalType: 'view'|'edit'|'delete'|'create'|null = null;
  selectedSensor: Sensor | null = null;

  sensores: Sensor[]           = [];
  ultimasLecturas: UltimaLectura[] = [];
  invernaderos: Invernadero[] = [];
  tiposSensor: TipoSensor[]   = [];

  constructor(
    public  modalService: SensorModalService,
    private sensoresService: SensoresService,
    private invernaderoService: InvernaderoService,
    private tipoSensorService: TipoSensorService,
  ) {}

  ngOnInit(): void {
    // 1) Modal
    this.modalService.modalType$.subscribe(t => this.modalType = t);
    this.modalService.selectedSensor$.subscribe(s => this.selectedSensor = s);

    // 2) Cargar sensores
    this.sensoresService.getSensores().subscribe({
      next: data => this.sensores = data,
      error: err => console.error('❌ Error cargando sensores:', err)
    });

    // 3) Cargar invernaderos
    this.invernaderoService.obtenerInvernaderos().subscribe({
      next: data => this.invernaderos = data,
      error: err => console.error('❌ Error cargando invernaderos:', err)
    });

    // 4) Cargar tipos de sensor
    this.tipoSensorService.obtenerTiposSensor().subscribe({
      next: data => this.tiposSensor = data,
      error: err => console.error('❌ Error cargando tipos de sensor:', err)
    });

    // 5) Cargar últimas lecturas Influx
    this.sensoresService.getUltimasLecturas(5).subscribe({
      next: data => {
        this.ultimasLecturas = data;
        // aquí fusionas lectura en cada sensor si lo necesitas…
        this.sensores.forEach(sensor => {
          const lectura = data.find(l =>
            l.sensor_id === `S00${sensor.id}` || l.sensor_id === sensor.id?.toString()
          );
          if (lectura) {
            sensor.parametro = lectura.parametro  ?? '';
            sensor.unidad    = lectura.valor;
            sensor.timestamp = lectura.timestamp ?? '';
          }
        });
      },
      error: err => console.error('❌ Error cargando lecturas:', err)
    });

    // ──────────── AÑADE ESTA SECCIÓN PARA DEBUG ────────────
    this.sensoresService.getMergedLecturas(2).subscribe({
      next: merged => console.log('🔀 MERGED LECTURAS (debug):', merged),
      error: err    => console.error('❌ Error merged-lecturas:', err)
    });
    // ────────────────────────────────────────────────────────
  }

  open(type: 'view'|'edit'|'delete'|'create', sensor: Sensor): void {
    this.modalService.openModal(type, sensor);
  }
}
