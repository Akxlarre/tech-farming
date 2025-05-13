// src/app/sensores/sensores.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SensorHeaderComponent } from './components/sensor-header/sensor-header.component';
import { SensorFiltersComponent, SensorFilter } from './components/sensor-filters/sensor-filters.component';
import { SensorTableComponent } from './components/sensor-table/sensor-table.component';
import { SensorCardListComponent } from './components/sensor-card-list/sensor-card-list.component';
import { SensorModalWrapperComponent } from './components/sensor-modal-wrapper/sensor-modal-wrapper.component';
import { SensorEditModalComponent } from './components/SensorEditModalComponent/sensor-edit-modal.component';
import { SensorViewModalComponent } from './components/SensorViewModalComponent/sensor-view-modal.component';
import { SensorDeleteModalComponent } from './components/SensorDeleteModalComponent/sensor-delete-modal.component';
import { SensorCreateModalComponent } from './components/sensor-header/components/SensorCreateModalComponent/sensor-create-modal.component';

import { SensorModalService } from './components/SensorModalService/sensor-modal.service';
import { Sensor } from './models/sensor.model';

import { SensoresService, MergedLectura } from '../services/sensores.service';
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
  modalType: 'view' | 'edit' | 'delete' | 'create' | null = null;
  selectedSensor: Sensor | null                       = null;

  sensores: Sensor[]               = [];
  ultimasLecturas: MergedLectura[] = [];
  filteredLecturas: MergedLectura[]= [];
  invernaderos: Invernadero[]      = [];
  tiposSensor: TipoSensor[]        = [];

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

    // 5) Cargar merged-lecturas
    this.sensoresService.getMergedLecturas(50).subscribe({
      next: merged => {
        console.log('🔀 MERGED LECTURAS:', merged);
        this.ultimasLecturas   = merged;
        this.filteredLecturas  = merged;
      },
      error: err => console.error('❌ Error merged-lecturas:', err)
    });
  }

  /**
   * Recibe los filtros desde <app-sensor-filters>
   * y actualiza filteredLecturas.
   */
  onFiltersChange(f: SensorFilter): void {
  console.log('Filtros recibidos:', f);

  this.filteredLecturas = this.ultimasLecturas.filter(l => {
    // 1) Encontrar el sensor “padre” para esta lectura
    const sensor = this.sensores.find(s =>
      `S00${s.id}` === l.sensor_id || s.id?.toString() === l.sensor_id
    );

    // 2) Extraer los valores confiables de sensor
    const invId      = sensor?.invernadero_id;
    const tipoNombre = this.tiposSensor
      .find(t => t.id === sensor?.tipo_sensor_id)?.nombre || '';

    // Debug de invernadero
    console.log(
      `Lectura ${l.sensor_id}: invId=`, invId, `(${typeof invId}), filtro=`,
      f.invernadero, `(${typeof f.invernadero})`
    );

    // 3) Comparar filtros
    const matchInv  = !f.invernadero || invId === f.invernadero;
    const matchTipo = !f.tipoSensor   || tipoNombre === f.tipoSensor;
    const matchEst  = !f.estado       || l.estado === f.estado;

    // 4) Filtrado por búsqueda libre
    const invNombre   = this.invernaderos.find(i => i.id === invId)?.nombre || '';
    const texto       = (l.nombre + ' ' + l.sensor_id + ' ' + invNombre).toLowerCase();
    const matchSearch = !f.search || texto.includes(f.search.toLowerCase());

    return matchInv && matchTipo && matchEst && matchSearch;
  });
}



  open(type: 'view'|'edit'|'delete'|'create', sensor: Sensor): void {
    this.modalService.openModal(type, sensor);
  }
}
