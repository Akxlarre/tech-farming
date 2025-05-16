import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-sensor-status',
    imports: [CommonModule],
    templateUrl: './sensor-status.component.html',
    styleUrls: ['./sensor-status.component.css']
})
export class SensorStatusComponent {
  estadoSensores = {
    activos: 12,
    inactivos: 3,
    error: 1,
    desconectados: 2,
  };
}