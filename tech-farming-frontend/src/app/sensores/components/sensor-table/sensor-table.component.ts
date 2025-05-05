import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sensor } from '../../models/sensor.model';
import { UltimaLectura } from '../../../services/sensores.service';

@Component({
  selector: 'app-sensor-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sensor-table.component.html',
  styleUrls: ['./sensor-table.component.css'],
})
export class SensorTableComponent implements OnChanges {
  @Input() sensores: Sensor[] = [];
  @Input() ultimasLecturas: UltimaLectura[] = [];

  @Output() view   = new EventEmitter<Sensor>();
  @Output() edit   = new EventEmitter<Sensor>();
  @Output() delete = new EventEmitter<Sensor>();

  merged: Sensor[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sensores'] || changes['ultimasLecturas']) {
      this.mergeLecturas();
    }
  }

  private mergeLecturas(): void {
    this.merged = this.sensores.map(sensor => {
      const lectura = this.ultimasLecturas.find(l => {
        // Convertir "S001" → 1, "S002" → 2, etc.
        const num = parseInt(l.sensor_id.replace(/^S0*/, ''), 10);
        return num === sensor.id;
      });

      return {
        ...sensor,
        timestamp: lectura?.timestamp ?? sensor.timestamp,
      };
    });
  }
}
