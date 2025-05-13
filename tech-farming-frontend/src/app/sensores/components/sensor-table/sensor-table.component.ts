// src/app/sensores/components/sensor-table/sensor-table.component.ts

import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sensor } from '../../models/sensor.model';
import { Invernadero } from '../../../invernaderos/models/invernadero.model';
import { TipoSensor } from '../../models/tipos_sensor.model';
import { MergedLectura } from '../../../services/sensores.service';

@Component({
  selector: 'app-sensor-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sensor-table.component.html',
  styleUrls: ['./sensor-table.component.css'],
})
export class SensorTableComponent implements OnChanges {
  @Input() sensores: Sensor[] = [];
  @Input() invernaderos: Invernadero[] = [];
  @Input() tiposSensor: TipoSensor[] = [];
  @Input() ultimasLecturas: MergedLectura[] = [];

  @Output() view   = new EventEmitter<Sensor>();
  @Output() edit   = new EventEmitter<Sensor>();
  @Output() delete = new EventEmitter<Sensor>();

  /** Filas enriquecidas sin paginar */
  mergedLecturas: Array<{
    lectura: MergedLectura;
    sensor?: Sensor;
    tipoNombre: string;
    invernaderoNombre: string;
  }> = [];

  /** Paginación */
  page = 1;
  pageSize = 10;

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['ultimasLecturas'] ||
      changes['sensores'] ||
      changes['invernaderos'] ||
      changes['tiposSensor']
    ) {
      this.buildRows();
      this.page = 1; // reset a primera página al cambiar datos
    }
  }

  private buildRows(): void {
    // 1) Ordenar por fecha descendente
    const sorted = [...this.ultimasLecturas].sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    // 2) Tomar las 10 primeras para paginar luego
    const top10 = sorted; // PAGINACIÓN manual en getter

    // 3) Enriquecer cada lectura
    this.mergedLecturas = top10.map(l => {
      const idNum = parseInt(l.sensor_id.replace(/^S0*/, ''), 10);
      const sensor = this.sensores.find(s => s.id === idNum);

      const tipoObj = this.tiposSensor.find(t => t.id === sensor?.tipo_sensor_id);
      const tipoNombre = tipoObj?.nombre ??
        (sensor?.tipo_sensor_id === 1 ? 'De un parámetro' :
         sensor?.tipo_sensor_id === 2 ? 'Multiparámetro' :
         '—');

      const inv = this.invernaderos.find(i => i.id === sensor?.invernadero_id);

      return {
        lectura: l,
        sensor,
        tipoNombre,
        invernaderoNombre: inv?.nombre ?? '—'
      };
    });
  }

  /** Devuelve solo las filas de la página actual */
  get pagedLecturas() {
    const start = (this.page - 1) * this.pageSize;
    return this.mergedLecturas.slice(start, start + this.pageSize);
  }
  get pages(): number[] {
    return Array.from(
      { length: this.totalPages },
      (_, i) => i + 1
    );
  }
  /** Total de páginas */
  get totalPages() {
    return Math.ceil(this.mergedLecturas.length / this.pageSize);
  }

  /** Cambiar de página */
  setPage(n: number) {
    if (n >= 1 && n <= this.totalPages) {
      this.page = n;
    }
  }

  /** Para trackear por sensor+timestamp */
  trackBySensor(_: number, item: any) {
    return item.lectura.sensor_id + item.lectura.timestamp;
  }
}
