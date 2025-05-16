// src/app/sensores/components/sensor-card-list/sensor-card-list.component.ts

import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule, ViewportScroller  } from '@angular/common';
import { SensorModalService } from '../SensorModalService/sensor-modal.service';
import { Sensor } from '../../models/sensor.model';
import { Invernadero } from '../../../invernaderos/models/invernadero.model';
import { TipoSensor } from '../../models/tipos_sensor.model';
import { MergedLectura } from '../../../services/sensores.service';

@Component({
    selector: 'app-sensor-card-list',
    imports: [CommonModule],
    templateUrl: './sensor-card-list.component.html',
    styleUrls: ['./sensor-card-list.component.css']
})
export class SensorCardListComponent implements OnChanges {
  @Input() sensores: Sensor[]               = [];
  @Input() invernaderos: Invernadero[]     = [];
  @Input() tiposSensor: TipoSensor[]       = [];
  @Input() ultimasLecturas: MergedLectura[] = [];

  cards: Array<{
    sensor: Sensor;
    lectura: MergedLectura;
    tipoNombre: string;
    invernaderoNombre: string;
  }> = [];

  // paginación
  page = 1;
  pageSize = 10;

  constructor(private modalService: SensorModalService,private viewport: ViewportScroller) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['ultimasLecturas'] || changes['sensores'] || changes['invernaderos'] || changes['tiposSensor']) {
      this.buildCards();
      this.page = 1;
    }
  }

  private buildCards(): void {
    this.cards = this.ultimasLecturas.map(l => {
      const idNum = parseInt(l.sensor_id.replace(/^S0*/, ''), 10);
      const sensor = this.sensores.find(s => s.id === idNum)!;
      const tipo   = this.tiposSensor.find(t => t.id === sensor.tipo_sensor_id);
      const invern = this.invernaderos.find(i => i.id === sensor.invernadero_id);

      return {
        sensor,
        lectura: l,
        tipoNombre: tipo?.nombre ?? '—',
        invernaderoNombre: invern?.nombre ?? '—'
      };
    });
  }

  /** filas paginadas */
  get pagedCards() {
    const start = (this.page - 1) * this.pageSize;
    return this.cards.slice(start, start + this.pageSize);
  }

  /** total de páginas */
  get totalPages() {
    return Math.ceil(this.cards.length / this.pageSize);
  }

  /** array [1..totalPages] */
  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  setPage(n: number) {
    if (n >= 1 && n <= this.totalPages) {
      this.page = n;
      // desplazar suavemente hasta arriba
      this.viewport.scrollToPosition([0, 450]);

    }
  }

  ver(sensor: Sensor)    { this.modalService.openModal('view',   sensor); }
  editar(sensor: Sensor) { this.modalService.openModal('edit',   sensor); }
  eliminar(sensor: Sensor){ this.modalService.openModal('delete', sensor); }
}
