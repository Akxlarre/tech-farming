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
import { MergedLectura, UltimaLectura } from '../../../services/sensores.service';

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

  /**
   * Cada fila es una lectura individual (hasta 10),
   * enriquecida con su sensor, tipo y invernadero.
   */
  mergedLecturas: Array<{
    lectura: MergedLectura;
    sensor?: Sensor;
    tipoNombre: string;
    invernaderoNombre: string;
  }> = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['ultimasLecturas'] ||
      changes['sensores'] ||
      changes['invernaderos'] ||
      changes['tiposSensor']
    ) {
      this.mergeLecturas();
    }
  }

  private mergeLecturas(): void {
    // 1) Ordenar por fecha descendente
    const sorted = [...this.ultimasLecturas].sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    // 2) Tomar las 10 primeras
    const top10 = sorted.slice(0, 10);

    // 3) Enriquecer cada lectura
    this.mergedLecturas = top10.map(l => {
      // extraer número de sensor: S00x → x
      const idNum = parseInt(l.sensor_id.replace(/^S0*/, ''), 10);
      const sensor = this.sensores.find(s => s.id === idNum);

      // nombre de tipo
      const tipoObj = this.tiposSensor.find(t => t.id === sensor?.tipo_sensor_id);
      const tipoNombre = tipoObj?.nombre ??
        (sensor?.tipo_sensor_id === 1 ? 'De un parámetro' :
         sensor?.tipo_sensor_id === 2 ? 'Multiparámetro' :
         '—');

      // nombre de invernadero
      const inv = this.invernaderos.find(i => i.id === sensor?.invernadero_id);

      return {
        lectura: l,
        sensor,
        tipoNombre,
        invernaderoNombre: inv?.nombre ?? '—'
      };
    });
  }
}
