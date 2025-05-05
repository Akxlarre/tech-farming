// src/app/sensores/components/sensor-table/sensor-table.component.ts
import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sensor } from '../../models/sensor.model';
import { Invernadero } from '../../../invernaderos/models/invernadero.model';
import { TipoSensor } from '../../models/tipos_sensor.model';
import { UltimaLectura } from '../../../services/sensores.service';

@Component({
  selector: 'app-sensor-table',
  standalone: true,
  imports: [ CommonModule ],
  templateUrl: './sensor-table.component.html',
  styleUrls: ['./sensor-table.component.css'],
})
export class SensorTableComponent implements OnChanges {
  @Input() sensores: Sensor[] = [];
  @Input() invernaderos: Invernadero[] = [];
  @Input() tiposSensor: TipoSensor[] = [];
  @Input() ultimasLecturas: UltimaLectura[] = [];

  @Output() view   = new EventEmitter<Sensor>();
  @Output() edit   = new EventEmitter<Sensor>();
  @Output() delete = new EventEmitter<Sensor>();

  merged: Array<Sensor & {
    tipoNombre: string;
    invernaderoNombre?: string;
    timestamp?: string;
  }> = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sensores'] ||
        changes['invernaderos'] ||
        changes['tiposSensor'] ||
        changes['ultimasLecturas']) {
      this.mergeDatos();
    }
  }

  private mergeDatos(): void {
    this.merged = this.sensores.map(sensor => {
      // Nombre de tipo (fallback a ID si no está en el array)
      const tipoObj = this.tiposSensor.find(t => t.id === sensor.tipo_sensor_id);
      let tipoNombre = tipoObj?.nombre ?? 
                       (sensor.tipo_sensor_id === 1 ? 'De un parámetro' :
                        sensor.tipo_sensor_id === 2 ? 'Multiparámetro' :
                        '—');

      // Nombre de invernadero
      const inv = this.invernaderos.find(i => i.id === sensor.invernadero_id);

      // Última lectura
      const lectura = this.ultimasLecturas.find(l => {
        const num = parseInt(l.sensor_id.replace(/^S0*/, ''), 10);
        return num === sensor.id;
      });

      return {
        ...sensor,
        tipoNombre,
        invernaderoNombre: inv?.nombre,
        timestamp: lectura?.timestamp
      };
    });
  }
}
